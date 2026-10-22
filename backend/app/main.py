"""
FastAPI Backend — Hệ thống AI Gợi ý Bài tập Thể dục Cá nhân hóa Neny Fetness.
Kiến trúc phân tầng Clean Layered Architecture:
- Presentation Layer: app/api/v1
- Business Logic Layer: app/services
- Data Access Layer: app/repositories
- Data Entities & DTOs: app/models, app/schemas
- Core Utilities: app/core
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.services.ml_service import ml_service
from app.api.v1.api import api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Đang khởi động hệ thống và nạp ML Model...")
    ml_service.load()
    Base.metadata.create_all(bind=engine)
    logger.info("Hệ thống và CSDL đã sẵn sàng phục vụ.")
    yield
    logger.info("Server đang tắt.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "API phục vụ hệ thống AI gợi ý bài tập thể dục cá nhân hóa **Neny Fetness**. "
        "Sử dụng TF-IDF + Logistic Regression để phân loại nhóm cơ, "
        "và TF-IDF + Cosine Similarity để gợi ý bài tập tương tự. "
        "Thiết kế theo chuẩn Clean Layered Architecture."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
)

# Cho phép truy cập file tĩnh (logo, media) qua đường dẫn /static/...
from pathlib import Path
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn toàn bộ router của API
app.include_router(api_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
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
