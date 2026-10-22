"""
Adaptive Workout Service - Thuật toán sinh buổi tập thích nghi hàng ngày (FR-005, FR-006 SRS).
"""
from typing import Dict, Any
from app.models.user import User
from app.repositories.exercise_repo import exercise_repo


class AdaptiveWorkoutService:
    def generate_daily_workout(self, user: User) -> Dict[str, Any]:
        goal = user.fitness_goal or "muscle_gain"
        equipment = (user.available_equipment or "dumbbell").lower()
        injury = (user.avoid_injury or "none").lower()

        # Xác định nhóm cơ mục tiêu theo mục tiêu tập luyện
        if goal == "weight_loss":
            routine_title = "Fat Burn & Full Body Tone"
            routine_title_vi = "Đốt Mỡ & Săn Chắc Toàn Thân"
            target_body_parts = ["cardio", "waist", "upper legs"]
        elif goal == "endurance":
            routine_title = "Cardio & Core Endurance"
            routine_title_vi = "Sức Bền & Thể Lực Tim Mạch"
            target_body_parts = ["cardio", "waist", "back"]
        elif goal == "recovery":
            routine_title = "Active Recovery & Mobility"
            routine_title_vi = "Phục Hồi Chủ Động & Giãn Cơ"
            target_body_parts = ["back", "waist", "neck"]
        else:  # muscle_gain / strength
            routine_title = "Chest, Arms & Core Hypertrophy"
            routine_title_vi = "Tăng Cơ Ngực, Tay & Cơ Lõi"
            target_body_parts = ["chest", "upper arms", "waist"]

        exercises = exercise_repo.filter_adaptive_candidates(
            target_body_parts=target_body_parts,
            equipment=equipment,
            injury=injury,
        )

        return {
            "routine_title": routine_title,
            "routine_title_vi": routine_title_vi,
            "focus_goal": goal,
            "target_body_parts": target_body_parts,
            "readiness_score": 88,
            "readiness_status": "Optimal for Training",
            "readiness_status_vi": "Thể trạng tối ưu sẵn sàng tập luyện",
            "exercises": exercises,
        }


adaptive_service = AdaptiveWorkoutService()
