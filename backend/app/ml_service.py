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
from deep_translator import GoogleTranslator
logger = logging.getLogger("ml_service")

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

    def predict_body_part(self, text: str, top_n: int = 3):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        translated_text = translate_query(text)
        cleaned = clean_text(translated_text)
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
        db=None,
    ):
        if not self.is_loaded:
            raise RuntimeError("Model chưa được load.")

        if db is not None:
            self._log_search(db, text)

        top_k = min(top_k, config.MAX_RECOMMEND_TOP_K)

        translated_text = translate_query(text)
        cleaned: str = clean_text(translated_text)
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
