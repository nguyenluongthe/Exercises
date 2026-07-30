"""
Training pipeline cho hệ thống AI gợi ý bài tập thể dục.
Nguồn dữ liệu: https://github.com/hasaneyldrm/exercises-dataset (1,324 bài tập)

Output (lưu vào models/):
    - classifier_model.pkl       : LogisticRegression phân loại body_part
    - classifier_vectorizer.pkl  : TfidfVectorizer dùng cho classifier
    - recommender_vectorizer.pkl : TfidfVectorizer dùng cho recommender
    - recommender_matrix.pkl     : Ma trận TF-IDF toàn bộ exercise (dùng cho cosine similarity)
    - exercises_processed.pkl    : DataFrame đã làm sạch, dùng để trả kết quả cho API
"""
import json
import re
import joblib
import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

DATA_PATH = "data/exercises_merged.json"
MODELS_DIR = "models"

import os
os.makedirs(MODELS_DIR, exist_ok=True)


def clean_text(text: str) -> str:
    """Chuẩn hóa văn bản: chữ thường, bỏ ký tự đặc biệt, chuẩn hóa khoảng trắng."""
    text = str(text).lower().strip()
    text = re.sub(r"[\n\t]", " ", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def build_text_field(ex: dict) -> str:
    """Gộp các trường liên quan thành 1 văn bản đại diện cho bài tập (dùng cho cả phân loại & gợi ý)."""
    parts = [
        ex.get("name", ""),
        ex.get("target", ""),
        ex.get("muscle_group", ""),
        " ".join(ex.get("secondary_muscles", []) or []),
        ex.get("instructions_en", ""),
    ]
    return clean_text(" ".join(p for p in parts if p))


def main():
    print("1. Đang tải dữ liệu...")
    with open(DATA_PATH, encoding="utf-8") as f:
        raw_data = json.load(f)
    print(f"   Tổng số bài tập: {len(raw_data)}")

    print("\n2. Tiền xử lý & chuẩn hóa dữ liệu...")
    records = []
    for ex in raw_data:
        records.append({
            "id": ex.get("id"),
            "name": ex.get("name", ""),
            "name_vi": ex.get("name_vi", ""),
            "body_part": (ex.get("body_part") or "").strip().lower(),
            "equipment": (ex.get("equipment") or "").strip().lower(),
            "target": (ex.get("target") or "").strip().lower(),
            "muscle_group": (ex.get("muscle_group") or "").strip().lower(),
            "secondary_muscles": ex.get("secondary_muscles", []) or [],
            "instructions_en": ex.get("instructions_en", ""),
            "instructions_vi": ex.get("instructions_vi", ""),
            "image": ex.get("image", ""),
            "gif_url": ex.get("gif_url", ""),
            "source": ex.get("source", "unknown"),
            "text_clean": build_text_field(ex),
        })

    df = pd.DataFrame(records)
    df = df[df["text_clean"].str.len() > 0].reset_index(drop=True)  # bỏ bản ghi thiếu text
    print(f"   Số bản ghi hợp lệ sau làm sạch: {len(df)}")
    print("\n   Phân bố nhãn body_part:")
    print(df["body_part"].value_counts())

    print("\n3. Vector hóa TF-IDF cho bài toán phân loại...")
    clf_vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=2, stop_words="english")
    X = clf_vectorizer.fit_transform(df["text_clean"])
    y = df["body_part"]

    # Nhãn "neck" chỉ có 2 mẫu -> stratify vẫn chạy được nhưng rất mỏng, cảnh báo người dùng trong báo cáo
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\n4. Huấn luyện Logistic Regression...")
    clf = LogisticRegression(max_iter=2000, class_weight="balanced", C=5.0)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print(f"\n   Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\n   Classification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print("\n5. Xây dựng chỉ mục recommender (TF-IDF trên toàn bộ dữ liệu)...")
    rec_vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=1, stop_words="english")
    rec_matrix = rec_vectorizer.fit_transform(df["text_clean"])
    print(f"   Kích thước ma trận recommender: {rec_matrix.shape}")

    print("\n6. Lưu các artifact...")
    joblib.dump(clf, f"{MODELS_DIR}/classifier_model.pkl")
    joblib.dump(clf_vectorizer, f"{MODELS_DIR}/classifier_vectorizer.pkl")
    joblib.dump(rec_vectorizer, f"{MODELS_DIR}/recommender_vectorizer.pkl")
    joblib.dump(rec_matrix, f"{MODELS_DIR}/recommender_matrix.pkl")
    joblib.dump(df, f"{MODELS_DIR}/exercises_processed.pkl")

    print("\n✅ Hoàn tất. Các file model đã lưu trong thư mục 'models/':")
    for fname in ["classifier_model.pkl", "classifier_vectorizer.pkl",
                  "recommender_vectorizer.pkl", "recommender_matrix.pkl", "exercises_processed.pkl"]:
        print(f"   - {MODELS_DIR}/{fname}")


if __name__ == "__main__":
    main()
