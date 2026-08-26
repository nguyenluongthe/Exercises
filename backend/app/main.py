"""
FastAPI Backend — Hệ thống AI Gợi ý Bài tập Thể dục Cá nhân hóa.
Endpoints: /predict (phân loại nhóm cơ), /recommend (gợi ý bài tập), /exercises (tra cứu dữ liệu).
"""
from typing import List, Optional
from app.database import engine, Base
from app import auth_routes, user_routes, admin_routes
import logging
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from app import config
from app.ml_service import ml_service
from app.schemas import (
    PredictRequest, PredictResponse,
    RecommendRequest, RecommendResponse,
    ExerciseListResponse, ExerciseOut,
    ErrorResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model 1 lần duy nhất khi server khởi động, tránh load lại mỗi request
    logger.info("Đang load model...")
    ml_service.load()
    Base.metadata.create_all(bind=engine) 
    yield
    logger.info("Server đang tắt.")


app = FastAPI(
    title="Neny Fetness API",
    description=(
        "API phục vụ hệ thống AI gợi ý bài tập thể dục cá nhân hóa **Neny Fetness**. "
        "Sử dụng TF-IDF + Logistic Regression để phân loại nhóm cơ, "
        "và TF-IDF + Cosine Similarity để gợi ý bài tập tương tự."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
)

# Cho phép truy cập file tĩnh (logo) qua đường dẫn /static/...
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)
# Cấu hình CORS để Web/Mobile frontend có thể gọi API từ domain khác
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ensure_model_loaded():
    """Kiểm tra model đã load chưa trước khi xử lý request — tránh lỗi khó hiểu nếu quên train."""
    if not ml_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail=(
                "Model chưa sẵn sàng. Vui lòng chạy `python train_model.py` để tạo "
                "các file model trong thư mục models/ rồi khởi động lại server."
            ),
        )


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Neny Fetness API",
        "status": "ok" if ml_service.is_loaded else "model_not_loaded",
        "logo": "/static/logo.png",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok" if ml_service.is_loaded else "model_not_loaded",
        "model_loaded": ml_service.is_loaded,
        "total_exercises": len(ml_service.exercises_df) if ml_service.is_loaded else 0,
    }


@app.post(
    "/predict",
    response_model=PredictResponse,
    responses={503: {"model": ErrorResponse}},
    tags=["Classification"],
    summary="Phân loại nhóm cơ mục tiêu từ mô tả người dùng",
)
def predict(request: PredictRequest):
    _ensure_model_loaded()
    try:
        result = ml_service.predict_body_part(request.text)
        return result
    except Exception as e:
        logger.exception("Lỗi khi phân loại")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

@app.post(
    "/recommend",
    response_model=RecommendResponse,
    responses={503: {"model": ErrorResponse}},
    tags=["Recommendation"],
    summary="Gợi ý bài tập dựa trên mô tả người dùng (content-based, cosine similarity)",
)
def recommend(request: RecommendRequest, db: Session = Depends(get_db)):
    _ensure_model_loaded()
    try:
        result = ml_service.recommend(
            text=request.text,
            top_k=request.top_k,
            equipment=request.equipment,
            body_part=request.body_part,
            db=db,
        )
        return result
    except Exception as e:
        logger.exception("Lỗi khi gợi ý")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")


@app.get(
    "/exercises",
    response_model=ExerciseListResponse,
    responses={503: {"model": ErrorResponse}},
    tags=["Exercises"],
    summary="Tra cứu danh sách bài tập, hỗ trợ lọc và phân trang",
)
def list_exercises(
    body_part: str = Query(default=None, description="Lọc theo nhóm cơ, ví dụ: chest, back"),
    equipment: str = Query(default=None, description="Lọc theo dụng cụ, ví dụ: 'body weight', dumbbell"),
    target: str = Query(default=None, description="Lọc theo cơ mục tiêu cụ thể, ví dụ: biceps"),
    search: str = Query(default=None, description="Tìm kiếm theo tên bài tập"),
    page: int = Query(default=1, ge=1, description="Số trang"),
    page_size: int = Query(default=config.DEFAULT_PAGE_SIZE, ge=1, le=config.MAX_PAGE_SIZE),
):
    _ensure_model_loaded()
    try:
        return ml_service.list_exercises(
            body_part=body_part, equipment=equipment, target=target,
            search=search, page=page, page_size=page_size,
        )
    except Exception as e:
        logger.exception("Lỗi khi tra cứu danh sách bài tập")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")


@app.get(
    "/exercises/{exercise_id}",
    response_model=ExerciseOut,
    responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    tags=["Exercises"],
    summary="Lấy chi tiết 1 bài tập theo ID",
)
def get_exercise(exercise_id: str):
    _ensure_model_loaded()
    result = ml_service.get_exercise_by_id(exercise_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return result


@app.get(
    "/exercises/{exercise_id}/substitutions",
    response_model=List[ExerciseOut],
    responses={404: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    tags=["Exercises"],
    summary="Gợi ý các bài tập thay thế cùng nhóm cơ / mục tiêu (FR-007 SRS)",
)
def get_exercise_substitutions(
    exercise_id: str,
    top_k: int = Query(default=4, ge=1, le=10, description="Số lượng bài tập thay thế"),
):
    _ensure_model_loaded()
    return ml_service.get_exercise_substitutions(exercise_id=exercise_id, top_k=top_k)

