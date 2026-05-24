from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, ForeignKey, Table, Text
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

match_participants = Table(
    "match_participants",
    Base.metadata,
    Column("match_id", Integer, ForeignKey("matches.id", ondelete="CASCADE"), primary_key=True),
    Column("wrestler_id", Integer, ForeignKey("wrestlers.id", ondelete="CASCADE"), primary_key=True),
    Column("team", String(16), nullable=True),
)


class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True, nullable=False)

    wrestlers = relationship("Wrestler", back_populates="brand")
    championships = relationship("Championship", back_populates="brand")
    events = relationship("Event", back_populates="brand")


class Wrestler(Base):
    __tablename__ = "wrestlers"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), unique=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    debut_date = Column(Date, nullable=True)
    status = Column(String(16), default="active", nullable=False)

    brand = relationship("Brand", back_populates="wrestlers")
    matches = relationship("Match", secondary=match_participants, back_populates="participants")
    wins = relationship("Match", foreign_keys="Match.winner_id", back_populates="winner")
    title_reigns = relationship("TitleReign", back_populates="wrestler")


class Championship(Base):
    __tablename__ = "championships"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), unique=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    weight_class = Column(String(32), nullable=True)

    brand = relationship("Brand", back_populates="championships")
    reigns = relationship("TitleReign", back_populates="championship")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    name = Column(String(128), nullable=False)
    date = Column(Date, nullable=False)
    venue = Column(String(128), nullable=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)

    brand = relationship("Brand", back_populates="events")
    matches = relationship("Match", back_populates="event", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    match_type = Column(String(32), nullable=False)
    championship_id = Column(Integer, ForeignKey("championships.id"), nullable=True)
    winner_id = Column(Integer, ForeignKey("wrestlers.id"), nullable=True)
    notes = Column(Text, nullable=True)

    event = relationship("Event", back_populates="matches")
    championship = relationship("Championship")
    winner = relationship("Wrestler", foreign_keys=[winner_id], back_populates="wins")
    participants = relationship("Wrestler", secondary=match_participants, back_populates="matches")


class TitleReign(Base):
    __tablename__ = "title_reigns"
    id = Column(Integer, primary_key=True)
    championship_id = Column(Integer, ForeignKey("championships.id"), nullable=False)
    wrestler_id = Column(Integer, ForeignKey("wrestlers.id"), nullable=False)
    won_at = Column(Date, nullable=False)
    lost_at = Column(Date, nullable=True)

    championship = relationship("Championship", back_populates="reigns")
    wrestler = relationship("Wrestler", back_populates="title_reigns")
