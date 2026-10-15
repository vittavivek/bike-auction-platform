
from datetime import datetime, timezone

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Auction, Bid, User
from backend.schemas import BidCreate
from backend.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from backend.auth_schemas import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from backend.database import SessionLocal
from backend.models import Auction, User
from backend.schemas import AuctionCreate
app = FastAPI(
    title="Bike Auction Platform",
    description="API for motorcycle auctions and bidding",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bike-auction-platform-mauve.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_error = HTTPException(
        status_code=401,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise credentials_error

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Administrator access required",
        )
    return current_user


@app.get("/")
def home():
    return {"message": "Bike Auction Platform API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-health")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        )


@app.post("/register", response_model=UserResponse, status_code=201)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    email = str(user_data.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    user = User(
        full_name=user_data.full_name.strip(),
        email=email,
        password_hash=hash_password(user_data.password),
        is_admin=False,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    return user


@app.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form_data.username.strip().lower()
    user = db.scalar(select(User).where(User.email == email))

    if user is None or not verify_password(
        form_data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type="bearer",
    )


@app.get("/users/me", response_model=UserResponse)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@app.get("/auctions")
def list_auctions(db: Session = Depends(get_db)):
    auctions = db.scalars(
        select(Auction).order_by(Auction.created_at.desc())
    ).all()

    return [
        {
            "id": auction.id,
            "title": auction.title,
            "description": auction.description,
            "make": auction.make,
            "model": auction.model,
            "year": auction.year,
            "starting_price": str(auction.starting_price),
            "current_price": str(auction.current_price),
            "minimum_increment": str(auction.minimum_increment),
            "status": auction.status,
            "starts_at": auction.starts_at.isoformat(),
            "ends_at": auction.ends_at.isoformat(),
        }
        for auction in auctions
    ]


@app.post("/auctions", status_code=201)
def create_auction(
    auction_data: AuctionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    now = datetime.now(timezone.utc)

    if auction_data.ends_at <= now:
        raise HTTPException(
            status_code=422,
            detail="Auction end time must be in the future",
        )

    status = (
        "live" if auction_data.starts_at <= now else "scheduled"
    )

    auction = Auction(
        title=auction_data.title,
        description=auction_data.description,
        make=auction_data.make,
        model=auction_data.model,
        year=auction_data.year,
        starting_price=auction_data.starting_price,
        current_price=auction_data.starting_price,
        minimum_increment=auction_data.minimum_increment,
        status=status,
        starts_at=auction_data.starts_at,
        ends_at=auction_data.ends_at,
    )

    try:
        db.add(auction)
        db.commit()
        db.refresh(auction)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create auction",
        )

    return {
        "id": auction.id,
        "title": auction.title,
        "starting_price": str(auction.starting_price),
        "current_price": str(auction.current_price),
        "status": auction.status,
    }

@app.post("/auctions/{auction_id}/bids", status_code=201)
def place_bid(
    auction_id: int,
    bid_data: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auction = db.scalar(
        select(Auction)
        .where(Auction.id == auction_id)
        .with_for_update()
    )

    if auction is None:
        raise HTTPException(
            status_code=404,
            detail="Auction not found",
        )

    now = datetime.now(timezone.utc)

    if auction.status != "live":
        raise HTTPException(
            status_code=409,
            detail="Auction is not currently accepting bids",
        )

    if auction.starts_at > now or auction.ends_at <= now:
        raise HTTPException(
            status_code=409,
            detail="Auction is outside its bidding window",
        )

    minimum_bid = (
        Decimal(str(auction.current_price))
        + Decimal(str(auction.minimum_increment))
    )
    amount = Decimal(str(bid_data.amount))

    if amount < minimum_bid:
        raise HTTPException(
            status_code=422,
            detail=f"Minimum bid is {minimum_bid}",
        )

    bid = Bid(
        auction_id=auction.id,
        bidder_id=current_user.id,
        amount=amount,
    )

    try:
        db.add(bid)
        auction.current_price = amount
        db.commit()
        db.refresh(bid)
        db.refresh(auction)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to place bid",
        )

    return {
        "id": bid.id,
        "auction_id": auction.id,
        "bidder_id": current_user.id,
        "amount": str(bid.amount),
        "current_price": str(auction.current_price),
        "created_at": bid.created_at.isoformat(),
    }
