"""
ML Service - Tầng xử lý mô hình AI: Phân loại nhóm cơ & Gợi ý bài tập tương tự.
"""
import os
import re
import logging
from typing import List, Tuple, Dict, Any, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from deep_translator import GoogleTranslator

from app.core.config import settings
from app.core.exceptions import ModelNotReadyException
from app.repositories.exercise_repo import exercise_repo
from app.models.search_log import SearchLog

logger = logging.getLogger("ml_service")

# =====================================================================
# BỘ TỪ ĐIỂN THUẬT NGỮ GYM / THỂ HÌNH TIẾNG VIỆT -> TIẾNG ANH CHUẨN
# =====================================================================
GYM_THESAURUS_RULES: List[Tuple[str, str, str]] = [
    # Lưng / Xô (Back / Lats)
    (r"\b(lưng xô|kéo xô|tập xô|cơ xô|cơ lưng|lưng trên|lưng dưới|kéo xà|hít xà|lats|xô)\b", "back lats latissimus upper back pull up", "Lưng xô ➔ Back/Lats"),
    # Tay trước / Bắp chuột (Biceps)
    (r"\b(tay trước|bắp tay trước|chuột|bắp chuột|cơ tay trước|gập tay|cuốn tạ tay|bicep|biceps)\b", "biceps upper arms arm curl", "Tay trước ➔ Biceps"),
    # Tay sau / Cơ tam đầu (Triceps)
    (r"\b(tay sau|bắp tay sau|cơ tam đầu|cơ tay sau|duỗi tay sau|đá tay sau|tricep|triceps)\b", "triceps upper arms pushdown extension", "Tay sau ➔ Triceps"),
    # Cẳng tay (Forearms)
    (r"\b(cẳng tay|cổ tay|cơ cẳng tay|forearm|forearms)\b", "forearms lower arms wrist curl", "Cẳng tay ➔ Forearms"),
    # Ngực (Chest)
    (r"\b(bơm ngực|ngực trên|ngực dưới|ngực giữa|ép ngực|hít đất|chống đẩy|đẩy ngực|cơ ngực|ngực|chest)\b", "chest pectorals push up bench press", "Cơ ngực ➔ Chest"),
    # Vai & Cổ (Shoulders / Neck)
    (r"\b(cơ vai|bờ vai|vai trước|vai sau|vai ngang|cơ delta|nhấc vai|đẩy vai|vai|shoulder|shoulders)\b", "shoulders deltoids shoulder press lateral raise", "Cơ vai ➔ Shoulders"),
    (r"\b(cơ cổ|tập cổ|gập cổ|cổ|neck)\b", "neck neck flex", "Cơ cổ ➔ Neck"),
    # Bụng & Eo (Waist / Abs / Core)
    (r"\b(cơ bụng|6 múi|sáu múi|gập bụng|siết mỡ bụng|siết eo|eo thon|bụng dưới|bụng trên|plank|bụng|abs|core|abdominals)\b", "waist abs abdominals core crunch plank", "Cơ bụng ➔ Abs/Core"),
    # Đùi & Mông (Upper Legs / Quads / Hamstrings / Glutes)
    (r"\b(đùi trước|đùi sau|cơ đùi|gánh đùi|gánh tạ|squat|mông|cơ mông|tăng vòng 3|chân mông|chân|đùi|quads|glutes|hamstrings)\b", "upper legs quadriceps hamstrings glutes squat lunge", "Đùi & Mông ➔ Legs/Glutes"),
    # Bắp chân (Lower Legs / Calves)
    (r"\b(bắp chuối|bắp chân|cơ bắp chân|nhón bắp chân|calves|calf)\b", "lower legs calves calf raise", "Bắp chân ➔ Calves"),
    # Cardio & Thể lực
    (r"\b(cardio|chạy bộ|nhảy dây|đốt mỡ|giảm mỡ|giảm cân|hiit|thể lực|sức bền)\b", "cardio endurance burning fat jumping rope hiit", "Cardio ➔ Cardio"),
    # Dụng cụ (Equipment)
    (r"\b(tạ đơn|tạ tay|dumbbell|dumbbells)\b", "dumbbell", "Tạ đơn ➔ Dumbbell"),
    (r"\b(tạ đòn|thanh đòn|barbell)\b", "barbell", "Tạ đòn ➔ Barbell"),
    (r"\b(dây kháng lực|dây thun|dây đàn hồi|band|bands)\b", "band resistance band", "Dây kháng lực ➔ Band"),
    (r"\b(tạ bình|tạ bình vôi|kettlebell)\b", "kettlebell", "Tạ bình ➔ Kettlebell"),
    (r"\b(không tạ|tại nhà|bodyweight|không dụng cụ|tự do)\b", "body weight home workout", "Không tạ ➔ Bodyweight"),
    (r"\b(máy tập|kéo cáp|dây cáp|khối tạ|cable|machine)\b", "cable machine", "Máy/Cáp ➔ Machine/Cable"),
]


def extract_and_enrich_fitness_query(text: str) -> Tuple[List[str], List[str]]:
    cleaned_lower = text.lower()
    interpreted_labels = []
    enriched_tokens = []

    for pattern, english_expansion, label in GYM_THESAURUS_RULES:
        if re.search(pattern, cleaned_lower, re.IGNORECASE):
            if label not in interpreted_labels:
                interpreted_labels.append(label)
            enriched_tokens.append(english_expansion)

    return enriched_tokens, interpreted_labels


def translate_query(text: str) -> str:
    try:
        translated = GoogleTranslator(source="auto", target="en").translate(text)
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Dịch truy vấn thất bại, dùng văn bản gốc: {e}")
        return text


def clean_text(text: str) -> str:
    text = str(text).lower().strip()
    text = re.sub(r"[\n\t]", " ", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class MLService:
    def __init__(self):
        self.classifier_model = None
        self.classifier_vectorizer = None
        self.recommender_vectorizer = None
        self.recommender_matrix = None
        self.is_loaded: bool = False

    def load(self) -> None:
        """Nạp các artifact mô hình và dataset."""
        logger.info("Đang nạp ML Models...")
        self.classifier_model = joblib.load(settings.CLASSIFIER_MODEL_PATH)
        self.classifier_vectorizer = joblib.load(settings.CLASSIFIER_VECTORIZER_PATH)
        self.recommender_vectorizer = joblib.load(settings.RECOMMENDER_VECTORIZER_PATH)
        self.recommender_matrix = joblib.load(settings.RECOMMENDER_MATRIX_PATH)
        
        # Nạp dữ liệu bài tập vào ExerciseRepository
        exercise_repo.load()
        self.is_loaded = True
        logger.info("ML Models và ExerciseRepository đã sẵn sàng.")

    @property
    def exercises_df(self) -> pd.DataFrame:
        """Thuộc tính tương thích ngược cho các file gọi trực tiếp `ml_service.exercises_df`."""
        return exercise_repo.exercises_df

    @exercises_df.setter
    def exercises_df(self, val: pd.DataFrame):
        exercise_repo.exercises_df = val

    def predict_body_part(self, text: str) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ModelNotReadyException()

        enriched_tokens, interpreted_keywords = extract_and_enrich_fitness_query(text)
        translated_text = translate_query(text)
        
        if enriched_tokens:
            combined_text = f"{translated_text} {' '.join(enriched_tokens)}"
        else:
            combined_text = translated_text

        cleaned: str = clean_text(combined_text)
        vector = self.classifier_vectorizer.transform([cleaned])
        probabilities = self.classifier_model.predict_proba(vector)[0]
        classes = self.classifier_model.classes_

        ranked_idx = np.argsort(probabilities)[::-1][:3]
        top_results = [
            {"body_part": classes[i], "confidence": round(float(probabilities[i]), 4)}
            for i in ranked_idx
        ]

        top_confidence = top_results[0]["confidence"]
        if top_confidence >= 0.70:
            confidence_level = "high"
        elif top_confidence >= 0.45:
            confidence_level = "medium"
        else:
            confidence_level = "low"

        clarification_needed = top_confidence < 0.45 and len(interpreted_keywords) == 0

        return {
            "input_text": text,
            "predicted_body_part": top_results[0]["body_part"],
            "confidence": top_confidence,
            "confidence_level": confidence_level,
            "interpreted_keywords": interpreted_keywords,
            "clarification_needed": clarification_needed,
            "top_3": top_results,
        }

    def recommend(
        self,
        text: str,
        top_k: int = settings.DEFAULT_RECOMMEND_TOP_K,
        equipment: Optional[str] = None,
        body_part: Optional[str] = None,
        db=None,
    ) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ModelNotReadyException()

        if db is not None:
            self._log_search(db, text)

        top_k = min(top_k, settings.MAX_RECOMMEND_TOP_K)

        enriched_tokens, interpreted_keywords = extract_and_enrich_fitness_query(text)
        translated_text = translate_query(text)
        if enriched_tokens:
            combined_text = f"{translated_text} {' '.join(enriched_tokens)}"
        else:
            combined_text = translated_text

        cleaned: str = clean_text(combined_text)
        query_vector = self.recommender_vectorizer.transform([cleaned])

        similarity_scores = cosine_similarity(query_vector, self.recommender_matrix)[0]

        df = exercise_repo.exercises_df.copy()
        df["similarity_score"] = similarity_scores

        if equipment:
            df = df[df["equipment"].str.lower() == equipment.strip().lower()]
        if body_part:
            df = df[df["body_part"].str.lower() == body_part.strip().lower()]

        df = df.sort_values("similarity_score", ascending=False).head(top_k)

        results = []
        for _, row in df.iterrows():
            sim_score = float(row["similarity_score"])
            if sim_score <= 0.05:
                match_score = round(max(35.0, sim_score * 300), 1)
            else:
                match_score = round(min(98.5, 45.0 + (sim_score ** 0.6) * 55.0), 1)

            if match_score >= 80.0:
                match_level = "high"
            elif match_score >= 60.0:
                match_level = "medium"
            else:
                match_level = "low"

            results.append({
                "id": str(row["id"]),
                "name": str(row["name"]),
                "name_vi": row["name_vi"] if "name_vi" in row and pd.notna(row["name_vi"]) else None,
                "body_part": str(row["body_part"]),
                "equipment": str(row["equipment"]),
                "target": str(row["target"]),
                "muscle_group": str(row["muscle_group"]) if "muscle_group" in row and pd.notna(row["muscle_group"]) else "",
                "secondary_muscles": row["secondary_muscles"] if isinstance(row.get("secondary_muscles"), list) else [],
                "image": row["image"] if "image" in row and pd.notna(row["image"]) else None,
                "gif_url": row["gif_url"] if "gif_url" in row and pd.notna(row["gif_url"]) else None,
                "instructions_en": row["instructions_en"] if "instructions_en" in row and pd.notna(row["instructions_en"]) else None,
                "instructions_vi": row["instructions_vi"] if "instructions_vi" in row and pd.notna(row["instructions_vi"]) else None,
                "similarity_score": round(sim_score, 4),
                "match_score": match_score,
                "match_level": match_level,
            })

        return {
            "input_text": text,
            "interpreted_keywords": interpreted_keywords,
            "results": results,
        }

    # Proxy delegates to exercise_repo for backwards compatibility
    def list_exercises(self, **kwargs):
        return exercise_repo.list_exercises(**kwargs)

    def get_exercise_by_id(self, exercise_id: str):
        return exercise_repo.get_by_id(exercise_id)

    def get_exercise_substitutions(self, exercise_id: str, top_k: int = 4):
        return exercise_repo.get_substitutions(exercise_id, top_k)

    def add_exercise(self, data: dict):
        return exercise_repo.add_exercise(data)

    def update_exercise(self, exercise_id: str, updates: dict):
        return exercise_repo.update_exercise(exercise_id, updates)

    def delete_exercise(self, exercise_id: str):
        return exercise_repo.delete_exercise(exercise_id)

    def get_admin_stats(self, db):
        from app.services.admin_service import admin_service
        return admin_service.get_stats(db)

    def _log_search(self, db, query_text: str):
        try:
            log_entry = SearchLog(query_text=query_text[:500])
            db.add(log_entry)
            db.commit()
        except Exception as e:
            logger.warning(f"Không ghi được search log: {e}")


ml_service = MLService()
