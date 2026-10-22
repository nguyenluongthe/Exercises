"""
Favorite Repository - xử lý lưu trữ bài tập yêu thích.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.favorite import Favorite
from app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    def __init__(self):
        super().__init__(Favorite)

    def get_by_user_and_exercise(self, db: Session, user_id: int, exercise_id: str) -> Optional[Favorite]:
        return db.query(Favorite).filter(
            Favorite.user_id == user_id,
            Favorite.exercise_id == exercise_id,
        ).first()

    def list_by_user(self, db: Session, user_id: int) -> List[Favorite]:
        return db.query(Favorite).filter(Favorite.user_id == user_id).order_by(Favorite.created_at.desc()).all()

    def count_total(self, db: Session) -> int:
        return db.query(Favorite).count()

    def get_most_favorited(self, db: Session, limit: int = 5) -> List[Tuple[str, str, int]]:
        return (
            db.query(
                Favorite.exercise_id,
                Favorite.exercise_name,
                func.count(Favorite.id).label("fav_count"),
            )
            .group_by(Favorite.exercise_id, Favorite.exercise_name)
            .order_by(func.count(Favorite.id).desc())
            .limit(limit)
            .all()
        )


favorite_repo = FavoriteRepository()
