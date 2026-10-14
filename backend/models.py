
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    bids: Mapped[list["Bid"]] = relationship(back_populates="bidder")


class Auction(Base):
    __tablename__ = "auctions"
    __table_args__ = (
        CheckConstraint("starting_price > 0", name="ck_auction_starting_price"),
        CheckConstraint("current_price >= starting_price", name="ck_auction_current_price"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    make: Mapped[str] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(80))
    year: Mapped[int] = mapped_column(Integer)
    starting_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    current_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    minimum_increment: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("100.00")
    )
    status: Mapped[str] = mapped_column(String(20), default="scheduled", index=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    bids: Mapped[list["Bid"]] = relationship(
        back_populates="auction", cascade="all, delete-orphan"
    )


class Bid(Base):
    __tablename__ = "bids"
    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_bid_amount_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    auction_id: Mapped[int] = mapped_column(
        ForeignKey("auctions.id", ondelete="CASCADE"), index=True
    )
    bidder_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    auction: Mapped["Auction"] = relationship(back_populates="bids")
    bidder: Mapped["User"] = relationship(back_populates="bids")
