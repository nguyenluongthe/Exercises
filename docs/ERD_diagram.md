# 🗄️ SƠ ĐỒ QUAN HỆ THỰC THỂ CƠ SỞ DỮ LIỆU (MERMAID ERD)
## NTRevo 3NF Normalized Relational Architecture
**Tác giả:** Dev 1 - Backend Lead (`Dev1-BackendLead`)  
**Sprint:** 3 (Chương 5: AI trong Thiết kế & Kiến trúc Phần mềm)  
**Tiêu chuẩn đáp ứng:** 3NF, Foreign Key Integrity, OpenAPI Data Mapping  

---

## 1. SƠ ĐỒ THỰC THỂ LIÊN KẾT (MERMAID ER DIAGRAM)

```mermaid
erDiagram
    USERS ||--|| USER_PROFILES : "has profile (1:1)"
    USERS ||--o{ FITNESS_ASSESSMENTS : "takes (1:N)"
    USERS ||--o{ TRAINING_PLANS : "enrolls in (1:N)"
    USERS ||--o{ WORKOUTS : "performs (1:N)"
    USERS ||--o{ RECOVERY_LOGS : "logs daily (1:N)"
    USERS ||--o{ PROGRESS_METRICS : "tracks (1:N)"

    TRAINING_PLANS ||--o{ WORKOUTS : "contains (1:N)"
    WORKOUTS ||--o{ EXERCISE_SETS : "composed of (1:N)"
    EXERCISES ||--o{ EXERCISE_SETS : "referenced by (1:N)"
    EXERCISES ||--o{ EXERCISE_SECONDARY_MUSCLES : "has synergists (1:N)"

    USERS {
        string id PK "UUIDv4"
        string email UK "Unique email address"
        string password_hash "Bcrypt hash"
        string role "athlete | coach | admin"
        timestamp created_at
        timestamp updated_at
    }

    USER_PROFILES {
        string id PK "UUIDv4"
        string user_id FK "References USERS.id"
        string full_name "User display name"
        int age "Age 16-100"
        string gender "male | female | other"
        float height_cm "100.0 - 250.0 cm"
        float weight_kg "30.0 - 300.0 kg"
        string fitness_level "beginner | intermediate | advanced | elite"
        string primary_goal "Goal tag"
        timestamp updated_at
    }

    FITNESS_ASSESSMENTS {
        string id PK "UUIDv4"
        string user_id FK "References USERS.id"
        timestamp assessment_date
        float estimated_vo2max "ml/kg/min"
        int pushups_count "reps"
        int plank_duration_sec "seconds"
        float squat_1rm_kg "kg"
        int resting_heart_rate "bpm"
        float fitness_score "0.0 - 100.0"
    }

    TRAINING_PLANS {
        string id PK "UUIDv4"
        string user_id FK "References USERS.id"
        string title "Plan title"
        date start_date
        date end_date
        int total_weeks "1-52 weeks"
        string status "draft | active | completed | paused"
    }

    WORKOUTS {
        string id PK "UUIDv4"
        string plan_id FK "References TRAINING_PLANS.id"
        string user_id FK "References USERS.id"
        date scheduled_date
        string title "Workout session title"
        string intensity_target "Deload | Standard | Overload | Active Recovery"
        string session_type "Strength | HIIT | Cardio | Mobility"
        string status "pending | in_progress | completed | skipped"
        timestamp completed_at
    }

    EXERCISES {
        string id PK "e.g. 0001 (Zero-padded)"
        string name "Exercise title"
        string category "Body part category"
        string body_part "waist | chest | back | shoulders..."
        string equipment "barbell | dumbbell | body weight..."
        string target_muscle "Primary agonist muscle"
        string image_url "Thumbnail image path"
        string gif_url "Animated demo GIF path"
        string instructions_en "Step-by-step cues"
        timestamp created_at
    }

    EXERCISE_SECONDARY_MUSCLES {
        string id PK "UUIDv4"
        string exercise_id FK "References EXERCISES.id"
        string muscle_name "Synergist muscle name"
    }

    EXERCISE_SETS {
        string id PK "UUIDv4"
        string workout_id FK "References WORKOUTS.id"
        string exercise_id FK "References EXERCISES.id (Nullable)"
        string exercise_name "Name of exercise"
        int set_order "1, 2, 3..."
        int target_reps
        int actual_reps
        float target_weight_kg
        float actual_weight_kg
        float rpe_actual "Borg CR10 (1-10)"
    }

    RECOVERY_LOGS {
        string id PK "UUIDv4"
        string user_id FK "References USERS.id"
        date log_date "Daily record"
        float hrv_rmssd "ms"
        float sleep_hours "hours"
        float deep_sleep_ratio "0.0 - 1.0"
        int doms_score "1 - 10"
        float rpe_previous_day "1.0 - 10.0"
        float readiness_score "0.0 - 100.0"
        string classification "Optimal | Modified | Active Recovery | Rest"
    }

    PROGRESS_METRICS {
        string id PK "UUIDv4"
        string user_id FK "References USERS.id"
        date recorded_date
        float weight_kg
        float body_fat_percentage
        float recovery_avg_7d "0.0 - 100.0"
        float training_load_7d "AU (Arbitrary Units)"
    }
```

---

## 2. NGUYÊN TẮC CHUẨN HÓA 3NF ĐÃ ÁP DỤNG

1. **Chuẩn 1 (1NF):** Tất cả các thuộc tính đều mang giá trị nguyên tố (Atomic values). Không có danh sách mảng lồng nhau (Nested Arrays) trong các bảng giao dịch; các bài tập và set tập được chuẩn hóa ra bảng riêng `exercise_sets`.
2. **Chuẩn 2 (2NF):** Toàn bộ các thuộc tính phi khóa đều phụ thuộc hàm đầy đủ vào toàn bộ khóa chính (Không có phụ thuộc bộ phận).
3. **Chuẩn 3 (3NF):** Loại bỏ hoàn toàn phụ thuộc bắc cầu (Transitive Dependencies). Dữ liệu hồ sơ người dùng không lưu lẫn vào bảng đăng nhập mà tách sang `user_profiles`. Kế hoạch tập không lưu trực tiếp set tập mà đi qua `workouts`.
