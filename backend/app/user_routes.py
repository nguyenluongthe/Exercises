"""Endpoint cho Favorites và Workout Log — đều yêu cầu đăng nhập (get_current_user)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import User, Favorite, WorkoutLog
from app.schemas import FavoriteCreate, FavoriteOut, WorkoutLogCreate, WorkoutLogOut
from app.auth import get_current_user

router = APIRouter(tags=["User Data"])


# ---------- Favorites ----------

@router.post("/favorites", response_model=FavoriteOut, summary="Lưu 1 bài tập vào danh sách yêu thích")
def add_favorite(
    fav_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.exercise_id == fav_in.exercise_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bài tập này đã có trong danh sách yêu thích")

    new_fav = Favorite(
        user_id=current_user.id,
        exercise_id=fav_in.exercise_id,
        exercise_name=fav_in.exercise_name,
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav


@router.get("/favorites", response_model=List[FavoriteOut], summary="Xem danh sách bài tập yêu thích")
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()


@router.delete("/favorites/{exercise_id}", summary="Bỏ yêu thích 1 bài tập")
def remove_favorite(
    exercise_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.exercise_id == exercise_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Không tìm thấy trong danh sách yêu thích")

    db.delete(fav)
    db.commit()
    return {"detail": "Đã xóa khỏi danh sách yêu thích"}


# ---------- Workout Log ----------

@router.post("/workout-logs", response_model=WorkoutLogOut, summary="Ghi lại 1 lần tập luyện")
def add_workout_log(
    log_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_log = WorkoutLog(
        user_id=current_user.id,
        exercise_id=log_in.exercise_id,
        exercise_name=log_in.exercise_name,
        sets=log_in.sets,
        reps=log_in.reps,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/workout-logs", response_model=List[WorkoutLogOut], summary="Xem lịch sử tập luyện")
def list_workout_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.logged_at.desc())
        .all()
    )
    # Chuyển datetime thành string để khớp schema (tránh lỗi serialize)
    return [
        {
            "id": log.id,
            "exercise_id": log.exercise_id,
            "exercise_name": log.exercise_name,
            "sets": log.sets,
            "reps": log.reps,
            "logged_at": log.logged_at.strftime("%Y-%m-%d %H:%M"),
        }
        for log in logs
    ]