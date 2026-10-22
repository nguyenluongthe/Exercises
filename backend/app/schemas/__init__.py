"""
Pydantic Schemas Package.
Re-exports all DTOs for clean and backwards-compatible imports.
"""
from app.schemas.exercise import (
    ExerciseOut,
    RecommendedExercise,
    RecommendRequest,
    RecommendResponse,
    ExerciseListResponse,
    ExerciseCreate,
    ExerciseUpdate,
)
from app.schemas.prediction import (
    PredictRequest,
    LabelScore,
    PredictResponse,
)
from app.schemas.auth import (
    UserCreate,
    UserOut,
    Token,
    ErrorResponse,
)
from app.schemas.user import (
    UserProfileUpdate,
    UserProfileOut,
    DailyAdaptiveWorkout,
)
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteOut,
)
from app.schemas.workout_log import (
    WorkoutLogCreate,
    WorkoutLogOut,
)
from app.schemas.admin import (
    AdminStats,
)

__all__ = [
    "ExerciseOut",
    "RecommendedExercise",
    "RecommendRequest",
    "RecommendResponse",
    "ExerciseListResponse",
    "ExerciseCreate",
    "ExerciseUpdate",
    "PredictRequest",
    "LabelScore",
    "PredictResponse",
    "UserCreate",
    "UserOut",
    "Token",
    "ErrorResponse",
    "UserProfileUpdate",
    "UserProfileOut",
    "DailyAdaptiveWorkout",
    "FavoriteCreate",
    "FavoriteOut",
    "WorkoutLogCreate",
    "WorkoutLogOut",
    "AdminStats",
]
