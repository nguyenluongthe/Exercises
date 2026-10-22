"""
Endpoints tra cứu thư viện bài tập, chi tiết và bài tập thay thế.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException

from app.core.config import settings
from app.schemas.exercise import ExerciseListResponse, ExerciseOut
from app.schemas.auth import ErrorResponse
from app.repositories.exercise_repo import exercise_repo
from app.api.deps import ensure_model_loaded

router = APIRouter(tags=["Exercises"])


@router.get(
    "/exercises",
    response_model=ExerciseListResponse,
    responses={503: {"model": ErrorResponse}},
    summary="Tra cứu danh sách bài tập, hỗ trợ lọc và phân trang",
)
def list_exercises(
    body_part: Optional[str] = Query(default=None, description="Lọc theo nhóm cơ, ví dụ: chest, back"),
    equipment: Optional[str] = Query(default=None, description="Lọc theo dụng cụ, ví dụ: 'body weight', dumbbell"),
    target: Optional[str] = Query(default=None, description="Lọc theo cơ mục tiêu cụ thể, ví dụ: biceps"),
    search: Optional[str] = Query(default=None, description="Tìm kiếm theo tên bài tập"),
    page: int = Query(default=1, ge=1, description="Số trang"),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
):
    ensure_model_loaded()
    return exercise_repo.list_exercises(
        body_part=body_part,
        equipment=equipment,
        target=target,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/exercises/{exercise_id}",
    response_model=ExerciseOut,
    responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Lấy chi tiết 1 bài tập theo ID",
)
def get_exercise(exercise_id: str):
    ensure_model_loaded()
    result = exercise_repo.get_by_id(exercise_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return result


@router.get(
    "/exercises/{exercise_id}/substitutions",
    response_model=List[ExerciseOut],
    responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Gợi ý các bài tập thay thế cùng nhóm cơ / mục tiêu (FR-007 SRS)",
)
def get_exercise_substitutions(
    exercise_id: str,
    top_k: int = Query(default=4, ge=1, le=10, description="Số lượng bài tập thay thế"),
):
    ensure_model_loaded()
    return exercise_repo.get_substitutions(exercise_id=exercise_id, top_k=top_k)
