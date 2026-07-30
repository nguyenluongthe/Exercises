"""Cấu hình chung cho ứng dụng."""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CLASSIFIER_MODEL_PATH = os.path.join(MODELS_DIR, "classifier_model.pkl")
CLASSIFIER_VECTORIZER_PATH = os.path.join(MODELS_DIR, "classifier_vectorizer.pkl")
RECOMMENDER_VECTORIZER_PATH = os.path.join(MODELS_DIR, "recommender_vectorizer.pkl")
RECOMMENDER_MATRIX_PATH = os.path.join(MODELS_DIR, "recommender_matrix.pkl")
EXERCISES_DATA_PATH = os.path.join(MODELS_DIR, "exercises_processed.pkl")

# CORS: cho phép tất cả origin khi phát triển (dev). Khi deploy thật,
# nên giới hạn lại thành domain cụ thể của Web/Mobile app.
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

# Số kết quả gợi ý mặc định nếu client không truyền top_k
DEFAULT_RECOMMEND_TOP_K = 5
MAX_RECOMMEND_TOP_K = 20

# Số bản ghi mặc định mỗi trang cho endpoint /exercises
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
