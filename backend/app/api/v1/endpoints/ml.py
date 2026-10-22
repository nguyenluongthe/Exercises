"""
Endpoints trí tuệ nhân tạo: Phân loại nhóm cơ & Gợi ý bài tập tương tự.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.prediction import PredictRequest, PredictResponse
from app.schemas.exercise import RecommendRequest, RecommendResponse
from app.schemas.auth import ErrorResponse
from app.services.ml_service import ml_service
from app.api.deps import ensure_model_loaded

router = APIRouter(tags=["AI"])


@router.post(
    "/predict",
    response_model=PredictResponse,
    responses={503: {"model": ErrorResponse}},
    summary="Phân loại nhóm cơ mục tiêu từ mô tả người dùng bằng AI",
)
def predict(request: PredictRequest):
    ensure_model_loaded()
    return ml_service.predict_body_part(request.text)


@router.post(
    "/recommend",
    response_model=RecommendResponse,
    responses={503: {"model": ErrorResponse}},
    summary="Gợi ý bài tập dựa trên mô tả người dùng (TF-IDF + Cosine Similarity)",
)
def recommend(request: RecommendRequest, db: Session = Depends(get_db)):
    ensure_model_loaded()
    return ml_service.recommend(
        text=request.text,
        top_k=request.top_k,
        equipment=request.equipment,
        body_part=request.body_part,
        db=db,
    )
