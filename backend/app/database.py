"""
Proxy tương thích ngược cho app.database.
"""
from app.core.database import engine, SessionLocal, Base, get_db

__all__ = ["engine", "SessionLocal", "Base", "get_db"]