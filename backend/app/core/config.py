"""
Module quản lý cấu hình hệ thống (Settings & Environments).
"""
import os
from typing import List
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")


class Settings(BaseModel):
    APP_NAME: str = "Neny Fetness API"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fitness_app.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "day-la-khoa-bi-mat-cua-do-an-DACN2-doi-lai-neu-can")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Paths to ML Artifacts
    CLASSIFIER_MODEL_PATH: str = os.path.join(MODELS_DIR, "classifier_model.pkl")
    CLASSIFIER_VECTORIZER_PATH: str = os.path.join(MODELS_DIR, "classifier_vectorizer.pkl")
    RECOMMENDER_VECTORIZER_PATH: str = os.path.join(MODELS_DIR, "recommender_vectorizer.pkl")
    RECOMMENDER_MATRIX_PATH: str = os.path.join(MODELS_DIR, "recommender_matrix.pkl")
    EXERCISES_DATA_PATH: str = os.path.join(MODELS_DIR, "exercises_processed.pkl")
    DATASET_JSON_PATH: str = os.path.join(DATA_DIR, "exercises_merged.json")
    
    # CORS
    CORS_ALLOW_ORIGINS: List[str] = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
    
    # Pagination & Defaults
    DEFAULT_RECOMMEND_TOP_K: int = 5
    MAX_RECOMMEND_TOP_K: int = 20
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100


settings = Settings()
