"""
Quản lý kết nối Database SQLAlchemy.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency cung cấp session database cho mỗi request và tự đóng sau khi hoàn tất."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
