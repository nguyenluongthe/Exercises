"""
Workout Log Repository - quản lý nhật ký tập luyện của người dùng.
"""
from typing import List
from sqlalchemy.orm import Session
from app.models.workout_log import WorkoutLog
from app.repositories.base import BaseRepository


class WorkoutLogRepository(BaseRepository[WorkoutLog]):
    def __init__(self):
        super().__init__(WorkoutLog)

    def list_by_user(self, db: Session, user_id: int) -> List[WorkoutLog]:
        return (
            db.query(WorkoutLog)
            .filter(WorkoutLog.user_id == user_id)
            .order_by(WorkoutLog.logged_at.desc())
            .all()
        )

    def count_by_user(self, db: Session, user_id: int) -> int:
        return db.query(WorkoutLog).filter(WorkoutLog.user_id == user_id).count()

    def count_total(self, db: Session) -> int:
        return db.query(WorkoutLog).count()


workout_repo = WorkoutLogRepository()
