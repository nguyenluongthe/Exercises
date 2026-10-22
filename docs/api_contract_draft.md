# 📜 DỰ THẢO HỢP ĐỒNG API (INITIAL API CONTRACT)
## Phân hệ: Authentication & Fitness Assessment Modules
**Tác giả:** Dev 1 (`Dev1-BackendLead`)  
**Sprint:** 1 (Tuần 1 - Chương 3)  
**Phiên bản:** 0.1.0-DRAFT  

---

## 1. PHÂN HỆ XÁC THỰC (AUTHENTICATION)

### 1.1 Đăng nhập lấy Bearer JWT
* **Endpoint:** `POST /api/v1/auth/login`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "email": "athlete@ntrevo.io",
  "password": "SecurePassword123!"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "usr-101",
    "email": "athlete@ntrevo.io",
    "full_name": "Nguyen The Long",
    "role": "athlete"
  }
}
```

---

## 2. PHÂN HỆ ĐÁNH GIÁ THỂ LỰC (FITNESS ASSESSMENT)

### 2.1 Lấy kết quả đánh giá thể lực gần nhất
* **Endpoint:** `GET /api/v1/assessment/latest`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
```json
{
  "assessment_id": "asm-889",
  "user_id": "usr-101",
  "completed_at": "2026-09-08T08:00:00Z",
  "fitness_score": 78.5,
  "metrics": {
    "estimated_vo2max": 47.2,
    "pushups_max": 38,
    "plank_seconds": 125,
    "resting_hr": 58
  },
  "strengths": [
    "Upper body endurance",
    "Cardiorespiratory recovery"
  ],
  "weaknesses": [
    "Core posterior chain stabilization"
  ]
}
```

### 2.2 Ghi nhận bài đánh giá mới
* **Endpoint:** `POST /api/v1/assessment/record`
* **Request Body:**
```json
{
  "pushups_count": 40,
  "plank_duration_sec": 130,
  "resting_heart_rate": 56,
  "one_mile_run_sec": 410
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "assessment_id": "asm-890",
  "calculated_fitness_score": 80.0,
  "message": "Assessment recorded and analyzed successfully"
}
```
