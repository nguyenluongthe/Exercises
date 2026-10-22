"""
Admin Service - Quản lý số liệu thống kê tổng quan hệ thống và các báo cáo.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.favorite import Favorite
from app.models.workout_log import WorkoutLog
from app.models.search_log import SearchLog
from app.repositories.exercise_repo import exercise_repo


class AdminService:
    def get_stats(self, db: Session) -> Dict[str, Any]:
        total_users = db.query(User).count()
        total_favorites = db.query(Favorite).count()
        total_workout_logs = db.query(WorkoutLog).count()
        total_exercises = exercise_repo.count()

        top_favorites = (
            db.query(Favorite.exercise_name, func.count(Favorite.id).label("count"))
            .group_by(Favorite.exercise_name)
            .order_by(func.count(Favorite.id).desc())
            .limit(5)
            .all()
        )

        # Lượt tìm kiếm theo tuần (4 tuần gần nhất)
        weekly_searches: List[Dict[str, Any]] = []
        today = datetime.utcnow()
        for i in range(3, -1, -1):
            week_end = today - timedelta(weeks=i)
            week_start = week_end - timedelta(weeks=1)
            count = (
                db.query(SearchLog)
                .filter(SearchLog.created_at >= week_start, SearchLog.created_at < week_end)
                .count()
            )
            weekly_searches.append({
                "label": f"W-{i}" if i > 0 else "Tuần này",
                "count": count,
            })

        # Người dùng mới theo tháng (6 tháng gần nhất)
        monthly_new_users: List[Dict[str, Any]] = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_label = month_date.strftime("%m/%Y")
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            count = (
                db.query(User)
                .filter(User.created_at >= month_start, User.created_at < next_month)
                .count()
            )
            monthly_new_users.append({"label": month_label, "count": count})

        return {
            "total_users": total_users,
            "total_exercises": total_exercises,
            "total_favorites": total_favorites,
            "total_workout_logs": total_workout_logs,
            "most_favorited_exercises": [
                {"exercise_name": name, "count": count} for name, count in top_favorites
            ],
            "weekly_searches": weekly_searches,
            "monthly_new_users": monthly_new_users,
        }


admin_service = AdminService()
