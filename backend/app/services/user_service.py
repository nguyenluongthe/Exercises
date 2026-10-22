"""
User Service - Quản lý hồ sơ thể lực, tính chỉ số BMI, tính Readiness Score.
"""
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.favorite import Favorite
from app.models.workout_log import WorkoutLog
from app.schemas.user import UserProfileUpdate, UserProfileOut
from app.schemas.favorite import FavoriteCreate
from app.schemas.workout_log import WorkoutLogCreate
from app.repositories.favorite_repo import favorite_repo
from app.repositories.workout_repo import workout_repo
from fastapi import HTTPException


class UserService:
    @staticmethod
    def compute_bmi_and_category(height_cm: Optional[float], weight_kg: Optional[float]) -> Tuple[Optional[float], Optional[str]]:
        if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
            return None, None
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m * height_m), 1)
        if bmi < 18.5:
            category = "Gầy / Thiếu cân (Underweight)"
        elif bmi < 24.9:
            category = "Cân đối / Chuẩn (Normal)"
        elif bmi < 29.9:
            category = "Thừa cân (Overweight)"
        else:
            category = "Béo phì (Obese)"
        return bmi, category

    def get_profile(self, db: Session, user: User) -> Dict[str, Any]:
        bmi, bmi_category = self.compute_bmi_and_category(user.height, user.weight)
        recent_logs_count = workout_repo.count_by_user(db, user.id)
        readiness = min(98, max(60, 85 + (5 if recent_logs_count > 0 else 0) - (2 if (user.age or 25) > 50 else 0)))

        return {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "age": user.age,
            "gender": user.gender or "male",
            "height": user.height,
            "weight": user.weight,
            "bmi": bmi,
            "bmi_category": bmi_category,
            "fitness_goal": user.fitness_goal or "muscle_gain",
            "experience_level": user.experience_level or "beginner",
            "available_equipment": user.available_equipment or "dumbbell",
            "avoid_injury": user.avoid_injury or "none",
            "fitness_score": user.fitness_score or 70,
            "daily_readiness_score": readiness,
            "onboarding_completed": bool(user.onboarding_completed),
        }

    def update_profile(self, db: Session, user: User, profile_in: UserProfileUpdate) -> Dict[str, Any]:
        if profile_in.name is not None:
            user.name = profile_in.name
        if profile_in.age is not None:
            user.age = profile_in.age
        if profile_in.gender is not None:
            user.gender = profile_in.gender
        if profile_in.height is not None:
            user.height = profile_in.height
        if profile_in.weight is not None:
            user.weight = profile_in.weight
        if profile_in.fitness_goal is not None:
            user.fitness_goal = profile_in.fitness_goal
        if profile_in.experience_level is not None:
            user.experience_level = profile_in.experience_level
        if profile_in.available_equipment is not None:
            user.available_equipment = profile_in.available_equipment
        if profile_in.avoid_injury is not None:
            user.avoid_injury = profile_in.avoid_injury
        if profile_in.onboarding_completed is not None:
            user.onboarding_completed = profile_in.onboarding_completed

        # Tính toán Baseline FitnessScore™
        bmi, _ = self.compute_bmi_and_category(user.height, user.weight)
        base_score = 75
        if bmi:
            deviation = abs(bmi - 22.0)
            base_score = max(50, int(base_score - deviation * 1.5))
        if user.experience_level == "intermediate":
            base_score += 8
        elif user.experience_level == "advanced":
            base_score += 15
        user.fitness_score = min(98, max(50, base_score))

        db.commit()
        db.refresh(user)
        return self.get_profile(db, user)

    # Favorites
    def add_favorite(self, db: Session, user: User, fav_in: FavoriteCreate) -> Favorite:
        existing = favorite_repo.get_by_user_and_exercise(db, user.id, fav_in.exercise_id)
        if existing:
            raise HTTPException(status_code=400, detail="Bài tập này đã có trong danh sách yêu thích")

        new_fav = Favorite(
            user_id=user.id,
            exercise_id=fav_in.exercise_id,
            exercise_name=fav_in.exercise_name,
        )
        return favorite_repo.create(db, new_fav)

    def list_favorites(self, db: Session, user: User) -> List[Favorite]:
        return favorite_repo.list_by_user(db, user.id)

    def remove_favorite(self, db: Session, user: User, exercise_id: str) -> None:
        fav = favorite_repo.get_by_user_and_exercise(db, user.id, exercise_id)
        if not fav:
            raise HTTPException(status_code=404, detail="Không tìm thấy trong danh sách yêu thích")
        favorite_repo.delete(db, fav)

    # Workout Logs
    def log_workout(self, db: Session, user: User, log_in: WorkoutLogCreate) -> Dict[str, Any]:
        new_log = WorkoutLog(
            user_id=user.id,
            exercise_id=log_in.exercise_id,
            exercise_name=log_in.exercise_name,
            sets=log_in.sets,
            reps=log_in.reps,
        )
        saved = workout_repo.create(db, new_log)
        return {
            "id": saved.id,
            "exercise_id": saved.exercise_id,
            "exercise_name": saved.exercise_name,
            "sets": saved.sets,
            "reps": saved.reps,
            "logged_at": saved.logged_at.strftime("%Y-%m-%d %H:%M") if saved.logged_at else "",
        }

    def list_workout_logs(self, db: Session, user: User) -> List[Dict[str, Any]]:
        logs = workout_repo.list_by_user(db, user.id)
        return [
            {
                "id": log.id,
                "exercise_id": log.exercise_id,
                "exercise_name": log.exercise_name,
                "sets": log.sets,
                "reps": log.reps,
                "logged_at": log.logged_at.strftime("%Y-%m-%d %H:%M") if log.logged_at else "",
            }
            for log in logs
        ]


user_service = UserService()
