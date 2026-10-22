"""
User Repository - xử lý toàn bộ truy vấn liên quan đến User.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def count_users(self, db: Session) -> int:
        return db.query(User).count()

    def get_all_users(self, db: Session) -> List[User]:
        return db.query(User).all()


user_repo = UserRepository()
