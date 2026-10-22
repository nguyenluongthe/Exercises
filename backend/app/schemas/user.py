"""
Pydantic Schemas cho Hồ sơ thể lực & Buổi tập thích nghi (User Profile & Adaptive DTOs).
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.exercise import ExerciseOut


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=10, le=100)
    gender: Optional[str] = "male"
    height: Optional[float] = Field(default=None, ge=50, le=250)
    weight: Optional[float] = Field(default=None, ge=20, le=300)
    fitness_goal: Optional[str] = "muscle_gain"  # muscle_gain, weight_loss, endurance, recovery
    experience_level: Optional[str] = "beginner"  # beginner, intermediate, advanced
    available_equipment: Optional[str] = "dumbbell"  # body_weight, dumbbell, full_gym, bands
    avoid_injury: Optional[str] = "none"  # none, knee, lower_back, shoulder, wrist
    onboarding_completed: Optional[bool] = True


class UserProfileOut(BaseModel):
    user_id: int
    email: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "male"
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None
    fitness_goal: str = "muscle_gain"
    experience_level: str = "beginner"
    available_equipment: str = "dumbbell"
    avoid_injury: str = "none"
    fitness_score: int = 70
    daily_readiness_score: int = 85
    onboarding_completed: bool = False


class DailyAdaptiveWorkout(BaseModel):
    routine_title: str
    routine_title_vi: str
    focus_goal: str
    target_body_parts: List[str]
    readiness_score: int
    readiness_status: str
    readiness_status_vi: str
    exercises: List[ExerciseOut]
