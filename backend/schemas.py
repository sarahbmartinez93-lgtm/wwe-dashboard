from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class WrestlerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    brand_id: int | None = None
    debut_date: date | None = None
    status: Literal["active", "inactive"] = "active"

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name cannot be blank")
        return v


class EventCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    date: date
    venue: str | None = Field(default=None, max_length=128)
    brand_id: int | None = None


class MatchCreate(BaseModel):
    event_id: int
    match_type: Literal["singles", "tag", "triple-threat", "fatal-four-way", "royal-rumble"]
    championship_id: int | None = None
    winner_id: int | None = None
    participant_ids: list[int] = Field(min_length=2)
    notes: str | None = None

    @field_validator("participant_ids")
    @classmethod
    def unique_participants(cls, v: list[int]) -> list[int]:
        if len(set(v)) != len(v):
            raise ValueError("participant_ids must be unique")
        return v


class TitleChangeCreate(BaseModel):
    championship_id: int
    new_holder_id: int
    won_at: date
    match_id: int | None = None
