"""
Service layer chứa toàn bộ logic ML: load artifact, tiền xử lý, phân loại, gợi ý.
Tách riêng khỏi main.py để dễ test và dễ thay thế model sau này.
"""
import re
import logging
from typing import List, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from app import config

logger = logging.getLogger("ml_service")


def clean_text(text: str) -> str:
    """Chuẩn hóa văn bản đầu vào — PHẢI giống hệt hàm dùng lúc train (train_model.py),
    nếu không vectorizer sẽ hiểu sai vì vocabulary được xây trên văn bản đã làm sạch."""
    text = str(text).lower().strip()
    text = re.sub(r"[\n\t]", " ", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class MLService:
    """Singleton nắm giữ toàn bộ model/dữ liệu đã load, dùng chung cho mọi request."""

    def __init__(self):
        self.classifier_model = None
        self.classifier_vectorizer = None
        self.recommender_vectorizer = None
        self.recommender_matrix = None
        self.exercises_df: Optional[pd.DataFrame] = None
        self.is_loaded = False

    def load(self):
        """Load toàn bộ artifact từ thư mục models/. Gọi 1 lần lúc app khởi động."""
        try:
            self.classifier_model = joblib.load(config.CLASSIFIER_MODEL_PATH)
            self.classifier_vectorizer = joblib.load(config.CLASSIFIER_VECTORIZER_PATH)
            self.recommender_vectorizer = joblib.load(config.RECOMMENDER_VECTORIZER_PATH)
            self.recommender_matrix = joblib.load(config.RECOMMENDER_MATRIX_PATH)
            self.exercises_df = joblib.load(config.EXERCISES_DATA_PATH)
            self.is_loaded = True
            logger.info(f"Đã load model thành công. Số bài tập: {len(self.exercises_df)}")
        except FileNotFoundError as e:
            self.is_loaded = False
            logger.error(
                f"Không tìm thấy file model: {e}. "
                f"Hãy chạy `python train_model.py` trước để tạo các artifact trong thư mục models/."
            )

    # ---------- /predict ----------

    def predict_body_part(self, text: str, top_n: int = 3):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        cleaned = clean_text(text)
        vector = self.classifier_vectorizer.transform([cleaned])

        probabilities = self.classifier_model.predict_proba(vector)[0]
        classes = self.classifier_model.classes_

        # Sắp xếp giảm dần theo xác suất, lấy top_n
        ranked_idx = np.argsort(probabilities)[::-1][:top_n]
        top_results = [
            {"body_part": classes[i], "confidence": round(float(probabilities[i]), 4)}
            for i in ranked_idx
        ]

        return {
            "input_text": text,
            "predicted_body_part": top_results[0]["body_part"],
            "confidence": top_results[0]["confidence"],
            "top_3": top_results,
        }

    # ---------- /recommend ----------

    def recommend(
        self,
        text: str,
        top_k: int = config.DEFAULT_RECOMMEND_TOP_K,
        equipment: Optional[str] = None,
        body_part: Optional[str] = None,
    ):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        top_k = min(top_k, config.MAX_RECOMMEND_TOP_K)

        cleaned = clean_text(text)
        query_vector = self.recommender_vectorizer.transform([cleaned])

        similarity_scores = cosine_similarity(query_vector, self.recommender_matrix)[0]

        df = self.exercises_df.copy()
        df["similarity_score"] = similarity_scores

        # Áp dụng bộ lọc theo dụng cụ / nhóm cơ nếu có (đúng như đề cương: "kết hợp bộ lọc theo dụng cụ sẵn có")
        if equipment:
            df = df[df["equipment"].str.lower() == equipment.strip().lower()]
        if body_part:
            df = df[df["body_part"].str.lower() == body_part.strip().lower()]

        df = df.sort_values("similarity_score", ascending=False).head(top_k)

        results = []
        for _, row in df.iterrows():
            results.append({
                "id": row["id"],
                "name": row["name"],
                "name_vi": row["name_vi"],
                "body_part": row["body_part"],
                "equipment": row["equipment"],
                "target": row["target"],
                "muscle_group": row["muscle_group"],
                "secondary_muscles": row["secondary_muscles"],
                "image": row["image"],
                "gif_url": row["gif_url"],
               "instructions_en": row["instructions_en"],
                "instructions_vi": row["instructions_vi"],
                "similarity_score": round(float(row["similarity_score"]), 4),
            })

        return {"input_text": text, "results": results}

    # ---------- /exercises ----------

    def list_exercises(
        self,
        body_part: Optional[str] = None,
        equipment: Optional[str] = None,
        target: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = config.DEFAULT_PAGE_SIZE,
    ):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        page_size = min(page_size, config.MAX_PAGE_SIZE)
        df = self.exercises_df.copy()

        if body_part:
            df = df[df["body_part"].str.lower() == body_part.strip().lower()]
        if equipment:
            df = df[df["equipment"].str.lower() == equipment.strip().lower()]
        if target:
            df = df[df["target"].str.lower() == target.strip().lower()]
        if search:
            keyword = search.strip().lower()
            match_en = df["name"].str.lower().str.contains(keyword, na=False)
            match_vi = df["name_vi"].str.lower().str.contains(keyword, na=False)
            df = df[match_en | match_vi]

        total = len(df)
        start = (page - 1) * page_size
        end = start + page_size
        page_df = df.iloc[start:end]

        results = []
        for _, row in page_df.iterrows():
            results.append({
                "id": row["id"],
                "name": row["name"],
                "name_vi": row["name_vi"],
                "body_part": row["body_part"],
                "equipment": row["equipment"],
                "target": row["target"],
                "muscle_group": row["muscle_group"],
                "secondary_muscles": row["secondary_muscles"],
               "image": row["image"],
                "gif_url": row["gif_url"],
                "instructions_en": row["instructions_en"],
                "instructions_vi": row["instructions_vi"],
            })
        return {"total": total, "page": page, "page_size": page_size, "results": results}

    def get_exercise_by_id(self, exercise_id: str):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        row = self.exercises_df[self.exercises_df["id"] == exercise_id]
        if row.empty:
            return None

        row = row.iloc[0]
        return {
            "id": row["id"],
            "name": row["name"],
            "name_vi": row["name_vi"],
            "body_part": row["body_part"],
            "equipment": row["equipment"],
            "target": row["target"],
            "muscle_group": row["muscle_group"],
            "secondary_muscles": row["secondary_muscles"],
          "image": row["image"],
            "gif_url": row["gif_url"],
            "instructions_en": row["instructions_en"],
            "instructions_vi": row["instructions_vi"],
        }


# Instance dùng chung toàn app (singleton pattern đơn giản)
ml_service = MLService()
