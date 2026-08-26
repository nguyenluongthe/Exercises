"""
Service layer chứa toàn bộ logic ML: load artifact, tiền xử lý, phân loại, gợi ý.
Tách riêng khỏi main.py để dễ test và dễ thay thế model sau này.
"""
import re
import logging
from typing import List, Optional, Tuple, Dict, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from app import config
from deep_translator import GoogleTranslator

logger = logging.getLogger("ml_service")

# =====================================================================
# BỘ TỪ ĐIỂN THUẬT NGỮ GYM / THỂ HÌNH TIẾNG VIỆT -> TIẾNG ANH CHUẨN
# Giải quyết bài toán đa dạng từ ngữ, tiếng lóng, từ địa phương của người dùng
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
    """
    Phân tích câu nhập của người dùng:
    1. Bóc tách các từ khóa thể hình / tiếng lóng tiếng Việt
    2. Trả về: (danh sách token tiếng Anh chuẩn cần bổ sung, danh sách nhãn hiển thị giải thích AI)
    """
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
    """Tự động phát hiện ngôn ngữ và dịch sang tiếng Anh trước khi đưa vào model.
    Nếu dịch lỗi (mất mạng...), dùng tạm văn bản gốc để không làm gián đoạn trải nghiệm."""
    try:
        translated = GoogleTranslator(source="auto", target="en").translate(text)
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Dịch truy vấn thất bại, dùng văn bản gốc: {e}")
        return text


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

    def predict_body_part(self, text: str, top_n: int = 3) -> Dict[str, Any]:
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        # 1. Bóc tách từ khóa thể hình và tiếng lóng
        enriched_tokens, interpreted_keywords = extract_and_enrich_fitness_query(text)

        # 2. Dịch câu gốc sang tiếng Anh
        translated_text = translate_query(text)

        # 3. Ghép các token domain tiếng Anh chuẩn vào câu dịch trước khi tạo vector
        if enriched_tokens:
            combined_text = f"{translated_text} {' '.join(enriched_tokens)}"
        else:
            combined_text = translated_text

        cleaned = clean_text(combined_text)
        vector = self.classifier_vectorizer.transform([cleaned])

        probabilities = self.classifier_model.predict_proba(vector)[0]
        classes = self.classifier_model.classes_

        # Sắp xếp giảm dần theo xác suất, lấy top_n
        ranked_idx = np.argsort(probabilities)[::-1][:top_n]
        top_results = [
            {"body_part": classes[i], "confidence": round(float(probabilities[i]), 4)}
            for i in ranked_idx
        ]

        top_confidence = top_results[0]["confidence"]
        # Phân loại cấp độ tin cậy
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

    # ---------- /recommend ----------

    def recommend(
        self,
        text: str,
        top_k: int = config.DEFAULT_RECOMMEND_TOP_K,
        equipment: Optional[str] = None,
        body_part: Optional[str] = None,
        db=None,
    ) -> Dict[str, Any]:
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        if db is not None:
            self._log_search(db, text)

        top_k = min(top_k, config.MAX_RECOMMEND_TOP_K)

        # 1. Bóc tách từ khóa & làm giàu văn bản
        enriched_tokens, interpreted_keywords = extract_and_enrich_fitness_query(text)

        # 2. Dịch truy vấn và tạo vector TF-IDF
        translated_text = translate_query(text)
        if enriched_tokens:
            combined_text = f"{translated_text} {' '.join(enriched_tokens)}"
        else:
            combined_text = translated_text

        cleaned: str = clean_text(combined_text)
        query_vector = self.recommender_vectorizer.transform([cleaned])

        similarity_scores = cosine_similarity(query_vector, self.recommender_matrix)[0]

        df = self.exercises_df.copy()
        df["similarity_score"] = similarity_scores

        # Áp dụng bộ lọc theo dụng cụ / nhóm cơ nếu có
        if equipment:
            df = df[df["equipment"].str.lower() == equipment.strip().lower()]
        if body_part:
            df = df[df["body_part"].str.lower() == body_part.strip().lower()]

        df = df.sort_values("similarity_score", ascending=False).head(top_k)

        results = []
        for _, row in df.iterrows():
            sim_score = float(row["similarity_score"])
            # Tính toán match score (%) thực tế trực quan từ cosine similarity
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
                "similarity_score": round(sim_score, 4),
                "match_score": match_score,
                "match_level": match_level,
            })

        return {
            "input_text": text,
            "interpreted_keywords": interpreted_keywords,
            "results": results,
        }

    # ---------- Gợi ý bài tập thay thế (Substitution - FR-007 SRS) ----------

    def get_exercise_substitutions(self, exercise_id: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Gợi ý các bài tập thay thế cùng nhóm cơ / mục tiêu (FR-007 trong SRS)."""
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        target_row = self.exercises_df[self.exercises_df["id"] == exercise_id]
        if target_row.empty:
            return []

        target_exercise = target_row.iloc[0]
        body_part = target_exercise["body_part"]
        target = target_exercise["target"]

        # Lọc các bài cùng nhóm cơ và mục tiêu, loại bỏ chính bài đó
        df_same = self.exercises_df[
            (self.exercises_df["id"] != exercise_id) &
            (self.exercises_df["body_part"] == body_part)
        ].copy()

        if df_same.empty:
            return []

        # Ưu tiên các bài có cùng target cơ cụ thể
        df_same["target_match"] = df_same["target"] == target
        df_same = df_same.sort_values(by=["target_match"], ascending=False).head(top_k)

        substitutions = []
        for _, row in df_same.iterrows():
            substitutions.append({
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

        return substitutions

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

# ---------- Admin: quản lý dữ liệu bài tập ----------

    def add_exercise(self, exercise_data: dict) -> dict:
        """Thêm 1 bài tập mới vào dữ liệu. Lưu ý: KHÔNG cập nhật ngay vector TF-IDF
        (mô hình AI cần chạy lại train_model.py để 'học' bài tập mới) — bài tập mới
        vẫn hiển thị được ở /exercises ngay lập tức, chỉ chưa xuất hiện trong /recommend."""
        import uuid
        new_id = f"admin_{uuid.uuid4().hex[:8]}"

        new_row = {
            "id": new_id,
            "name": exercise_data["name"],
            "name_vi": "",
            "body_part": exercise_data["body_part"].strip().lower(),
            "equipment": exercise_data["equipment"].strip().lower(),
            "target": exercise_data.get("target", "").strip().lower(),
            "muscle_group": exercise_data.get("muscle_group", "").strip().lower(),
            "secondary_muscles": exercise_data.get("secondary_muscles", []),
            "instructions_en": exercise_data.get("instructions_en", ""),
            "instructions_vi": "",
            "image": exercise_data.get("image", "") or "",
            "gif_url": exercise_data.get("gif_url", "") or "",
            "text_clean": clean_text(
                f"{exercise_data['name']} {exercise_data.get('target','')} "
                f"{exercise_data.get('muscle_group','')} {exercise_data.get('instructions_en','')}"
            ),
        }

        self.exercises_df = pd.concat(
            [self.exercises_df, pd.DataFrame([new_row])], ignore_index=True
        )
        self._save_exercises_df()
        return new_row

    def update_exercise(self, exercise_id: str, updates: dict) -> Optional[dict]:
        """Sửa thông tin 1 bài tập đã có."""
        idx = self.exercises_df.index[self.exercises_df["id"] == exercise_id]
        if len(idx) == 0:
            return None

        for key, value in updates.items():
            if value is not None and key in self.exercises_df.columns:
                self.exercises_df.loc[idx, key] = (
                    value.strip().lower() if isinstance(value, str) and key in
                    ["body_part", "equipment", "target", "muscle_group"] else value
                )

        self._save_exercises_df()
        return self.exercises_df.loc[idx].iloc[0].to_dict()

    def delete_exercise(self, exercise_id: str) -> bool:
        """Xóa 1 bài tập khỏi dữ liệu."""
        idx = self.exercises_df.index[self.exercises_df["id"] == exercise_id]
        if len(idx) == 0:
            return False

        self.exercises_df = self.exercises_df.drop(idx).reset_index(drop=True)
        self._save_exercises_df()
        return True

    def _save_exercises_df(self):
        """Lưu lại DataFrame vào file .pkl để thay đổi tồn tại qua các lần khởi động server."""
        joblib.dump(self.exercises_df, config.EXERCISES_DATA_PATH)
        logger.info(f"Đã lưu lại dữ liệu bài tập. Tổng số: {len(self.exercises_df)}")

    def get_admin_stats(self, db) -> dict:
        """Thống kê tổng quan hệ thống, dùng cho Admin Dashboard."""
        from app.db_models import User, Favorite, WorkoutLog, SearchLog
        from sqlalchemy import func
        from datetime import datetime, timedelta

        total_users = db.query(User).count()
        total_favorites = db.query(Favorite).count()
        total_workout_logs = db.query(WorkoutLog).count()

        top_favorites = (
            db.query(Favorite.exercise_name, func.count(Favorite.id).label("count"))
            .group_by(Favorite.exercise_name)
            .order_by(func.count(Favorite.id).desc())
            .limit(5)
            .all()
        )

        # Lượt tìm kiếm theo tuần (4 tuần gần nhất)
        weekly_searches = []
        today = datetime.utcnow()
        for i in range(3, -1, -1):
            week_end = today - timedelta(weeks=i)
            week_start = week_end - timedelta(weeks=1)
            count = (
                db.query(SearchLog)
                .filter(SearchLog.created_at >= week_start, SearchLog.created_at < week_end)
                .count()
            )
            weekly_searches.append({
                "label": f"W-{i}" if i > 0 else "Tuần này",
                "count": count,
            })

        # Người dùng mới theo tháng (6 tháng gần nhất)
        monthly_new_users = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30 * i)
            month_label = month_date.strftime("%m/%Y")
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            count = (
                db.query(User)
                .filter(User.created_at >= month_start, User.created_at < next_month)
                .count()
            )
            monthly_new_users.append({"label": month_label, "count": count})

        return {
            "total_users": total_users,
            "total_exercises": len(self.exercises_df),
            "total_favorites": total_favorites,
            "total_workout_logs": total_workout_logs,
            "most_favorited_exercises": [
                {"exercise_name": name, "count": count} for name, count in top_favorites
            ],
            "weekly_searches": weekly_searches,
            "monthly_new_users": monthly_new_users,
        }
    def _log_search(self, db, query_text: str):
            """Ghi lại mỗi lượt tìm kiếm để phục vụ thống kê Admin."""
            from app.db_models import SearchLog
            try:
                log_entry = SearchLog(query_text=query_text[:500])  # Giới hạn độ dài, tránh log quá dài
                db.add(log_entry)
                db.commit()
            except Exception as e:
                logger.warning(f"Không ghi được search log: {e}")
# Instance dùng chung toàn app (singleton pattern đơn giản)
ml_service = MLService()
