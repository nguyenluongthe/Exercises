"""Kết nối database SQLite — file .db sẽ tự tạo, không cần cài server riêng."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./fitness_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Mở 1 kết nối database cho mỗi request, tự đóng lại sau khi xong."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()