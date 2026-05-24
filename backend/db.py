from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from pathlib import Path

DB_PATH = Path(__file__).parent / "wwe.db"
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False))


def init_db():
    from models import Base
    Base.metadata.create_all(bind=engine)
