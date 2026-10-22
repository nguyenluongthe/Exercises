"""
Endpoints quản lý hồ sơ người dùng, bài tập yêu thích và nhật ký tập luyện.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserProfileOut
from app.schemas.favorite import FavoriteCreate, FavoriteOut
from app.schemas.workout_log import WorkoutLogCreate, WorkoutLogOut
from app.services.user_service import user_service
from app.api.deps import get_current_user

router = APIRouter(tags=["User Data"])


# ---------- User Profile & Onboarding ----------

@router.get("/user/profile", response_model=UserProfileOut, summary="Xem hồ sơ thể lực và chỉ số cá nhân")
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.get_profile(db, current_user)


@router.put("/user/profile", response_model=UserProfileOut, summary="Cập nhật hồ sơ thể lực (Onboarding & Chỉnh sửa)")
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.update_profile(db, current_user, profile_in)


# ---------- Favorites ----------

@router.post("/favorites", response_model=FavoriteOut, summary="Lưu 1 bài tập vào danh sách yêu thích")
def add_favorite(
    fav_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.add_favorite(db, current_user, fav_in)


@router.get("/favorites", response_model=List[FavoriteOut], summary="Xem danh sách bài tập yêu thích")
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.list_favorites(db, current_user)


@router.delete("/favorites/{exercise_id}", summary="Bỏ yêu thích 1 bài tập")
def remove_favorite(
    exercise_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_service.remove_favorite(db, current_user, exercise_id)
    return {"detail": "Đã xóa khỏi danh sách yêu thích"}


# ---------- Workout Logs ----------

@router.post("/workout-logs", response_model=WorkoutLogOut, summary="Ghi lại 1 lần tập luyện")
def add_workout_log(
    log_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.log_workout(db, current_user, log_in)


@router.get("/workout-logs", response_model=List[WorkoutLogOut], summary="Xem lịch sử tập luyện")
def list_workout_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.list_workout_logs(db, current_user)
