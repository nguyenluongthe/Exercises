"""
Comprehensive Automated Test Suite cho Backend Adaptive Fitness & Recovery.
Kiểm thử toàn bộ các tầng: Core, Repositories, Services, Routers.
"""
import os
import sys
import uuid

# Đảm bảo import được module app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app


def test_full_system_suite():
    with TestClient(app) as client:
        # 1. Health Check & Model Load
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == "ok"
        assert data.get("model_loaded") is True
        assert data.get("total_exercises", 0) >= 2000
        print(f"✅ [PASS] Health check: {data.get('total_exercises')} exercises loaded.")

        # 2. Auth Flow (Register, Login, Me)
        test_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
        test_pass = "password123"

        reg_res = client.post("/auth/register", json={
            "email": test_email,
            "password": test_pass,
            "name": "Architect Tester",
        })
        assert reg_res.status_code == 200
        assert reg_res.json()["email"] == test_email
        assert reg_res.json()["onboarding_completed"] is False
        print("✅ [PASS] User Registration successful.")

        login_res = client.post("/auth/login", data={
            "username": test_email,
            "password": test_pass,
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        assert token is not None
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ [PASS] User Login & JWT issuance successful.")

        me_res = client.get("/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == test_email
        print("✅ [PASS] Auth verification /auth/me successful.")

        # 3. AI Predict Body Part & Thesaurus Enrichment
        predict_cases = [
            ("tôi muốn tập xô bằng tạ đơn tại nhà", "back"),
            ("bơm ngực trên", "chest"),
            ("độ bắp chuột tay trước", "upper arms"),
            ("siết cơ bụng 6 múi", "waist"),
            ("gánh tạ mông đùi", "upper legs"),
            ("tập vai với dây kháng lực", "shoulders"),
        ]

        for query, expected_body_part in predict_cases:
            pred_res = client.post("/predict", json={"text": query})
            assert pred_res.status_code == 200
            pred_data = pred_res.json()
            assert pred_data["predicted_body_part"] == expected_body_part
            assert len(pred_data["top_3"]) == 3
            assert pred_data["confidence"] > 0
            print(f"✅ [PASS] AI Predict '{query}' ➔ {pred_data['predicted_body_part']} ({pred_data['confidence']*100:.1f}%)")

        # 4. AI Recommendation with Cosine Similarity
        rec_res = client.post("/recommend", json={"text": "tập ngực với tạ đơn", "top_k": 3})
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert len(rec_data["results"]) == 3
        top_ex = rec_data["results"][0]
        assert "match_score" in top_ex
        assert "match_level" in top_ex
        print(f"✅ [PASS] AI Recommendation: {top_ex['name']} (Match: {top_ex['match_score']}%)")

        # 5. Exercises Library & Substitutions
        lib_res = client.get("/exercises?body_part=chest&page=1&page_size=5")
        assert lib_res.status_code == 200
        lib_data = lib_res.json()
        assert len(lib_data["results"]) == 5
        sample_id = lib_data["results"][0]["id"]

        detail_res = client.get(f"/exercises/{sample_id}")
        assert detail_res.status_code == 200
        assert detail_res.json()["id"] == sample_id

        subs_res = client.get(f"/exercises/{sample_id}/substitutions?top_k=3")
        assert subs_res.status_code == 200
        assert isinstance(subs_res.json(), list)
        print(f"✅ [PASS] Exercise library, detail, and substitutions verified.")

        # 6. User Profile, Onboarding & Real-time BMI
        prof_res = client.get("/user/profile", headers=headers)
        assert prof_res.status_code == 200
        assert prof_res.json()["onboarding_completed"] is False

        update_res = client.put("/user/profile", json={
            "age": 25,
            "gender": "male",
            "height": 175.0,
            "weight": 70.0,
            "fitness_goal": "muscle_gain",
            "experience_level": "beginner",
            "available_equipment": "dumbbell",
            "avoid_injury": "knee",
            "onboarding_completed": True,
        }, headers=headers)
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["bmi"] == 22.9
        assert updated["onboarding_completed"] is True
        print(f"✅ [PASS] User Onboarding completed. BMI: {updated['bmi']} ({updated['bmi_category']})")

        # 7. AI Adaptive Daily Workout
        adaptive_res = client.get("/adaptive/daily-workout", headers=headers)
        assert adaptive_res.status_code == 200
        routine = adaptive_res.json()
        assert len(routine["exercises"]) > 0
        assert "Chest" in routine["routine_title"] or "Tăng Cơ" in routine["routine_title_vi"]
        print(f"✅ [PASS] AI Adaptive Daily Workout: {routine['routine_title_vi']} ({len(routine['exercises'])} exercises)")

        # 8. User Favorites CRUD
        fav_add = client.post("/favorites", json={
            "exercise_id": sample_id,
            "exercise_name": lib_data["results"][0]["name"],
        }, headers=headers)
        assert fav_add.status_code == 200

        fav_list = client.get("/favorites", headers=headers)
        assert fav_list.status_code == 200
        assert len(fav_list.json()) >= 1

        fav_del = client.delete(f"/favorites/{sample_id}", headers=headers)
        assert fav_del.status_code == 200
        print("✅ [PASS] User Favorites CRUD operations passed.")

        # 9. Workout Logging
        log_add = client.post("/workout-logs", json={
            "exercise_id": sample_id,
            "exercise_name": lib_data["results"][0]["name"],
            "sets": 4,
            "reps": 12,
        }, headers=headers)
        assert log_add.status_code == 200

        log_list = client.get("/workout-logs", headers=headers)
        assert log_list.status_code == 200
        assert len(log_list.json()) >= 1
        print("✅ [PASS] Workout Logging operations passed.")

        # 10. Admin Stats
        # Authenticate as admin or verify endpoint protection
        admin_res = client.get("/admin/stats")
        assert admin_res.status_code in [401, 403]
        print("✅ [PASS] Admin endpoints access control verified.")


if __name__ == "__main__":
    print("=" * 65)
    print("🚀 BẮT ĐẦU CHẠY KIỂM THỬ TOÀN BỘ HỆ THỐNG MỚI (CLEAN ARCHITECTURE)")
    print("=" * 65)
    test_full_system_suite()
    print("=" * 65)
    print("🎉 100% CÁC BÀI KIỂM THỬ HỆ THỐNG ĐÃ ĐẠT (PASS) HOÀN HẢO!")
    print("=" * 65)
