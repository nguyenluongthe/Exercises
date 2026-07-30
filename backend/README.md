# Fitness Exercise Recommendation API

FastAPI Backend cho hệ thống AI gợi ý bài tập thể dục cá nhân hóa — Đồ án Chuyên ngành 2.

Dữ liệu: gộp từ 2 nguồn mở để tăng số lượng và cân bằng nhãn hơn:
- [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (1.324 bài tập, đa ngôn ngữ, có GIF)
- [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (873 bài tập, Public Domain, phân loại cơ chi tiết hơn)
- **Sau khi gộp và loại trùng: 2.079 bài tập, 10 nhóm `body_part`**

## 1. Cài đặt

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Chuẩn bị dữ liệu & huấn luyện model

Dữ liệu gốc (`data/exercises.json`, `data/free_exercise_db.json`) đã có sẵn. Chạy 2 lệnh theo thứ tự:

```bash
python merge_datasets.py    # Gộp 2 nguồn -> data/exercises_merged.json (2.079 bài tập)
python train_model.py       # Huấn luyện trên dữ liệu đã gộp -> models/*.pkl
```

`train_model.py` sẽ:
- Làm sạch dữ liệu, gộp `name + target + muscle_group + secondary_muscles + instructions_en` thành văn bản đại diện.
- Huấn luyện Logistic Regression phân loại `body_part` — đạt **94.95% accuracy**, với tất cả 10 nhãn đều có mặt trong tập test (kể cả nhãn hiếm như `neck`, trước khi gộp dữ liệu gần như không đủ mẫu để đánh giá).
- Xây chỉ mục TF-IDF cho recommender (cosine similarity).
- Lưu 5 file vào `models/`: `classifier_model.pkl`, `classifier_vectorizer.pkl`, `recommender_vectorizer.pkl`, `recommender_matrix.pkl`, `exercises_processed.pkl`.

> Nếu sau này bạn huấn luyện lại trên Kaggle (theo đúng đề cương), chỉ cần tải 5 file `.pkl` này về và đặt vào thư mục `models/` — không cần sửa code backend.

### Phân bố nhãn sau khi gộp

| body_part | Số lượng |
|---|---|
| upper legs | 454 |
| upper arms | 407 |
| back | 297 |
| shoulders | 259 |
| waist | 237 |
| chest | 235 |
| lower legs | 80 |
| lower arms | 57 |
| cardio | 43 |
| neck | 10 |

## 3. Chạy server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Mở trình duyệt tại `http://localhost:8000/docs` để xem tài liệu API tương tác (Swagger UI) và thử trực tiếp từng endpoint.

## 4. Các endpoint

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra server và model đã sẵn sàng chưa |
| POST | `/predict` | Phân loại nhóm cơ mục tiêu từ mô tả người dùng |
| POST | `/recommend` | Gợi ý bài tập tương tự (content-based, cosine similarity), có lọc theo dụng cụ/nhóm cơ |
| GET | `/exercises` | Tra cứu danh sách bài tập, lọc + phân trang |
| GET | `/exercises/{id}` | Chi tiết 1 bài tập theo ID |

### Ví dụ dùng `curl`

```bash
# Phân loại nhóm cơ
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I want to train my chest with dumbbell press exercises"}'

# Gợi ý bài tập, lọc theo dụng cụ
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"text": "chest press with dumbbell", "top_k": 5, "equipment": "dumbbell"}'

# Tra cứu danh sách, lọc theo nhóm cơ + dụng cụ, phân trang
curl "http://localhost:8000/exercises?body_part=chest&equipment=body%20weight&page=1&page_size=10"

# Chi tiết 1 bài tập
curl http://localhost:8000/exercises/0001
```

## 5. ⚠️ Lưu ý quan trọng — Giới hạn ngôn ngữ hiện tại

Model đang được huấn luyện trên văn bản **tiếng Anh** (`instructions.en` trong dataset gốc). Dataset gốc có 9 ngôn ngữ (`en, es, hi, it, ko, pl, ru, tr, zh`) nhưng **không có tiếng Việt**.

**Hệ quả:** nếu người dùng nhập mô tả bằng **tiếng Việt**, độ chính xác của `/predict` và `/recommend` sẽ giảm mạnh (model không nhận ra từ vựng tiếng Việt vì TF-IDF vocabulary được xây từ văn bản tiếng Anh) — đã kiểm chứng thực tế:

- Query tiếng Anh `"I want to train my chest with dumbbell press exercises"` → dự đoán đúng **"chest"** với độ tin cậy 26%.
- Query tiếng Việt tương đương `"tôi muốn tập cơ ngực với tạ đơn"` → dự đoán sai **"upper legs"**, độ tin cậy chỉ 15.7% (gần như đoán ngẫu nhiên giữa 9 nhãn).

**Hướng xử lý đề xuất** (chưa triển khai trong bản này, cần xác nhận từ bạn):
1. **Dịch tự động Việt → Anh** ở tầng backend trước khi đưa vào model (dùng thư viện dịch, ví dụ `deep-translator` hoặc `argos-translate` chạy offline) — ít thay đổi kiến trúc nhất, giữ nguyên model đã train.
2. **Mở rộng vocabulary đa ngôn ngữ**: gộp thêm các bản dịch có sẵn trong dataset (`tr`, `es`, ...) vào text huấn luyện để model "quen" với nhiều ngôn ngữ hơn — nhưng dataset **không có sẵn tiếng Việt** nên cách này không giải quyết được vấn đề gốc.
3. **Dùng embedding đa ngôn ngữ** (ví dụ multilingual Sentence-BERT) thay cho TF-IDF — hiểu ngữ nghĩa xuyên ngôn ngữ tốt hơn nhiều, nhưng cần đổi hẳn phương pháp huấn luyện đã có trong đề cương (TF-IDF + Logistic Regression).

## 6. Cấu trúc thư mục

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, định nghĩa endpoints
│   ├── ml_service.py         # Logic load model, phân loại, gợi ý
│   ├── schemas.py            # Pydantic models cho request/response
│   └── config.py             # Đường dẫn model, cấu hình CORS
├── data/
│   └── exercises.json        # Dữ liệu gốc (1.324 bài tập)
├── models/                    # Tạo ra sau khi chạy train_model.py
│   ├── classifier_model.pkl
│   ├── classifier_vectorizer.pkl
│   ├── recommender_vectorizer.pkl
│   ├── recommender_matrix.pkl
│   └── exercises_processed.pkl
├── train_model.py             # Script huấn luyện
├── requirements.txt
└── README.md
```
