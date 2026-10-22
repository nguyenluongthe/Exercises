"""
Exercise Repository - Quản lý truy xuất dữ liệu bài tập và bộ nhớ DataFrame.
"""
import os
import logging
import uuid
from typing import Optional, List, Dict, Any
import joblib
import pandas as pd
from app.core.config import settings

logger = logging.getLogger("exercise_repo")


class ExerciseRepository:
    """Repository quản lý danh mục bài tập (In-Memory DataFrame + Persistent Pickled Dataset)."""

    def __init__(self):
        self.exercises_df: pd.DataFrame = pd.DataFrame()
        self.is_loaded: bool = False

    def load(self, df: Optional[pd.DataFrame] = None) -> None:
        """Nạp dữ liệu bài tập vào bộ nhớ."""
        if df is not None:
            self.exercises_df = df
            self.is_loaded = True
            logger.info(f"Loaded {len(self.exercises_df)} exercises into ExerciseRepository.")
            return

        if os.path.exists(settings.EXERCISES_DATA_PATH):
            self.exercises_df = joblib.load(settings.EXERCISES_DATA_PATH)
            self.is_loaded = True
            logger.info(f"Loaded {len(self.exercises_df)} exercises from {settings.EXERCISES_DATA_PATH}")
        else:
            logger.warning(f"File {settings.EXERCISES_DATA_PATH} not found.")

    def count(self) -> int:
        return len(self.exercises_df) if self.is_loaded else 0

    def get_by_id(self, exercise_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_loaded or self.exercises_df.empty:
            return None
        row = self.exercises_df[self.exercises_df["id"] == exercise_id]
        if row.empty:
            return None
        return self._row_to_dict(row.iloc[0])

    def list_exercises(
        self,
        body_part: Optional[str] = None,
        equipment: Optional[str] = None,
        target: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = settings.DEFAULT_PAGE_SIZE,
    ) -> Dict[str, Any]:
        if not self.is_loaded or self.exercises_df.empty:
            return {"total": 0, "page": page, "page_size": page_size, "results": []}

        page_size = min(page_size, settings.MAX_PAGE_SIZE)
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
            match_vi = df["name_vi"].str.lower().str.contains(keyword, na=False) if "name_vi" in df.columns else False
            df = df[match_en | match_vi]

        total = len(df)
        start = (page - 1) * page_size
        end = start + page_size
        page_df = df.iloc[start:end]

        results = [self._row_to_dict(row) for _, row in page_df.iterrows()]
        return {"total": total, "page": page, "page_size": page_size, "results": results}

    def get_substitutions(self, exercise_id: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Gợi ý các bài tập thay thế cùng nhóm cơ / mục tiêu (FR-007 SRS)."""
        if not self.is_loaded or self.exercises_df.empty:
            return []

        target_row = self.exercises_df[self.exercises_df["id"] == exercise_id]
        if target_row.empty:
            return []

        target_exercise = target_row.iloc[0]
        body_part = target_exercise["body_part"]
        target = target_exercise["target"]

        df_same = self.exercises_df[
            (self.exercises_df["id"] != exercise_id) &
            (self.exercises_df["body_part"] == body_part)
        ].copy()

        if df_same.empty:
            return []

        df_same["target_match"] = df_same["target"] == target
        df_same = df_same.sort_values(by=["target_match"], ascending=False).head(top_k)

        return [self._row_to_dict(row) for _, row in df_same.iterrows()]

    def filter_adaptive_candidates(
        self,
        target_body_parts: List[str],
        equipment: str,
        injury: str,
    ) -> List[Dict[str, Any]]:
        """Lọc danh sách bài tập cho thuật toán tạo buổi tập thích nghi hàng ngày."""
        if not self.is_loaded or self.exercises_df.empty:
            return []

        df = self.exercises_df.copy()
        filtered = df[df["body_part"].isin(target_body_parts)].copy()

        # Lọc theo dụng cụ
        if equipment in ["body_weight", "body weight"]:
            filtered = filtered[filtered["equipment"].isin(["body weight", "body only", "assisted"])]
        elif equipment in ["dumbbell"]:
            filtered = filtered[filtered["equipment"].isin(["dumbbell", "body weight"])]
        elif equipment in ["band", "bands"]:
            filtered = filtered[filtered["equipment"].isin(["band", "body weight"])]

        # Loại bỏ vùng chấn thương
        if injury == "knee":
            filtered = filtered[~filtered["target"].str.contains("quads|knee", case=False, na=False)]
        elif injury == "lower_back":
            filtered = filtered[~filtered["target"].str.contains("lower back|spine", case=False, na=False)]
        elif injury == "shoulder":
            filtered = filtered[~filtered["body_part"].str.contains("shoulder", case=False, na=False)]

        if filtered.empty:
            filtered = df.head(5)

        # Lấy 5 bài tập phân bổ
        sample_df = filtered.sample(n=min(5, len(filtered)), random_state=42) if len(filtered) > 5 else filtered
        return [self._row_to_dict(row) for _, row in sample_df.iterrows()]

    def add_exercise(self, exercise_data: dict) -> dict:
        new_id = f"admin_{uuid.uuid4().hex[:8]}"
        new_row = {
            "id": new_id,
            "name": exercise_data["name"],
            "name_vi": exercise_data.get("name_vi", ""),
            "body_part": exercise_data["body_part"].strip().lower(),
            "equipment": exercise_data["equipment"].strip().lower(),
            "target": exercise_data.get("target", "").strip().lower(),
            "muscle_group": exercise_data.get("muscle_group", "").strip().lower(),
            "secondary_muscles": exercise_data.get("secondary_muscles", []),
            "instructions_en": exercise_data.get("instructions_en", ""),
            "instructions_vi": exercise_data.get("instructions_vi", ""),
            "image": exercise_data.get("image", "") or "",
            "gif_url": exercise_data.get("gif_url", "") or "",
        }

        self.exercises_df = pd.concat(
            [self.exercises_df, pd.DataFrame([new_row])], ignore_index=True
        )
        self.save()
        return new_row

    def update_exercise(self, exercise_id: str, updates: dict) -> Optional[dict]:
        idx = self.exercises_df.index[self.exercises_df["id"] == exercise_id]
        if len(idx) == 0:
            return None

        for key, value in updates.items():
            if value is not None and key in self.exercises_df.columns:
                self.exercises_df.loc[idx, key] = (
                    value.strip().lower() if isinstance(value, str) and key in
                    ["body_part", "equipment", "target", "muscle_group"] else value
                )

        self.save()
        return self._row_to_dict(self.exercises_df.loc[idx].iloc[0])

    def delete_exercise(self, exercise_id: str) -> bool:
        idx = self.exercises_df.index[self.exercises_df["id"] == exercise_id]
        if len(idx) == 0:
            return False

        self.exercises_df = self.exercises_df.drop(idx).reset_index(drop=True)
        self.save()
        return True

    def save(self) -> None:
        """Lưu lại DataFrame vào file .pkl."""
        joblib.dump(self.exercises_df, settings.EXERCISES_DATA_PATH)
        logger.info(f"Đã lưu lại dữ liệu bài tập. Tổng số: {len(self.exercises_df)}")

    @staticmethod
    def _row_to_dict(row: pd.Series) -> Dict[str, Any]:
        return {
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
        }


exercise_repo = ExerciseRepository()
