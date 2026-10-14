
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from pydantic import BaseModel, ConfigDict, Field, model_validator


class AuctionCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(default="", max_length=5000)
    make: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    year: int = Field(ge=1885, le=2100)
    starting_price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    minimum_increment: Decimal = Field(
        default=Decimal("100.00"),
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    starts_at: datetime
    ends_at: datetime

    @model_validator(mode="after")
    def validate_schedule(self):
        if self.starts_at.tzinfo is None or self.ends_at.tzinfo is None:
            raise ValueError("Auction times must include a timezone")

        if self.ends_at <= self.starts_at:
            raise ValueError("Auction end time must be after start time")

        return self


class AuctionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    make: str
    model: str
    year: int
    starting_price: Decimal
    current_price: Decimal
    minimum_increment: Decimal
    status: str
    starts_at: datetime
    ends_at: datetime
class BidCreate(BaseModel):
    amount: Decimal = Field(gt=0)
