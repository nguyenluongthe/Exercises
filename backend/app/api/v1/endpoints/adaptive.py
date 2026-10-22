"""
Endpoint tạo buổi tập thích nghi thông minh hàng ngày (FR-005, FR-006 SRS).
"""
from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import DailyAdaptiveWorkout
from app.services.adaptive_service import adaptive_service
from app.api.deps import get_current_user

router = APIRouter(tags=["Adaptive Workout"])


@router.get(
    "/adaptive/daily-workout",
    response_model=DailyAdaptiveWorkout,
    summary="Tạo buổi tập đề xuất thích nghi hôm nay theo thể trạng và mục tiêu",
)
def get_daily_adaptive_workout(current_user: User = Depends(get_current_user)):
    return adaptive_service.generate_daily_workout(current_user)
