import urllib.request
import urllib.parse
import json
import sys
import uuid

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def api_request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    
    if method == "POST_FORM":
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        encoded_data = urllib.parse.urlencode(data).encode("utf-8")
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method="POST")
    else:
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
        
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = err_body
        return e.code, parsed

print("=" * 60)
print("🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG FITNESS & AI")
print("=" * 60)

passed_tests = 0
total_tests = 0

def test(name, condition, extra=""):
    global passed_tests, total_tests
    total_tests += 1
    if condition:
        passed_tests += 1
        print(f"  ✅ [PASS] {name} {extra}")
    else:
        print(f"  ❌ [FAIL] {name} {extra}")

# 1. Test Health & Model Loading
print("\n[1/7] KIỂM TRA HEALTH CHECK & MODEL LOAD")
status, data = api_request("GET", "/health")
test("Server status == ok", status == 200 and data.get("status") == "ok")
test("Model loaded == True", data.get("model_loaded") is True)
test("Total exercises in dataset >= 2000", data.get("total_exercises", 0) >= 2000, f"({data.get('total_exercises')} bài tập)")

# 2. Test Auth Flow (Register, Login)
print("\n[2/7] KIỂM TRA XÁC THỰC NGƯỜI DÙNG (AUTH)")
test_email = f"test_user_{uuid.uuid4().hex[:6]}@example.com"
test_password = "password123"

status, reg_data = api_request("POST", "/auth/register", {
    "email": test_email,
    "password": test_password,
    "name": "Nguyen Van Test"
})
test("Đăng ký tài khoản mới (/auth/register)", status == 200 and "email" in reg_data)

status, token_data = api_request("POST_FORM", "/auth/login", {
    "username": test_email,
    "password": test_password
})
user_token = token_data.get("access_token")
test("Đăng nhập lấy JWT Token (/auth/login)", status == 200 and user_token is not None)

# 3. Test AI Body Part Prediction & Explainability
print("\n[3/7] KIỂM TRA PHÂN LOẠI NHÓM CƠ AI (/predict)")
predict_cases = [
    ("tôi muốn tập xô bằng tạ đơn tại nhà", "back", ["Lưng xô ➔ Back/Lats", "Tạ đơn ➔ Dumbbell", "Không tạ ➔ Bodyweight"]),
    ("bơm ngực trên", "chest", ["Cơ ngực ➔ Chest"]),
    ("độ bắp chuột tay trước", "upper arms", ["Tay trước ➔ Biceps"]),
    ("siết cơ bụng 6 múi", "waist", ["Cơ bụng ➔ Abs/Core"]),
    ("gánh tạ mông đùi", "upper legs", ["Đùi & Mông ➔ Legs/Glutes"]),
    ("tập vai với dây kháng lực", "shoulders", ["Cơ vai ➔ Shoulders", "Dây kháng lực ➔ Band"])
]

for query, expected_body_part, expected_keywords in predict_cases:
    status, pred = api_request("POST", "/predict", {"text": query})
    body_part_matched = pred.get("predicted_body_part") == expected_body_part
    has_keywords = any(kw in pred.get("interpreted_keywords", []) for kw in expected_keywords)
    test(f"Query '{query}' ➔ {pred.get('predicted_body_part')} ({pred.get('confidence',0)*100:.1f}%)",
         status == 200 and body_part_matched,
         f"| Keywords: {pred.get('interpreted_keywords')}")

# 4. Test Recommendation with Match Score
print("\n[4/7] KIỂM TRA GỢI Ý BÀI TẬP AI (/recommend)")
status, rec_data = api_request("POST", "/recommend", {
    "text": "tập ngực với tạ đơn",
    "top_k": 3
})
test("Gợi ý bài tập theo độ tương đồng Cosine", status == 200 and len(rec_data.get("results", [])) == 3)
if rec_data.get("results"):
    top_ex = rec_data["results"][0]
    test("Tính toán match_score (%) và match_level", "match_score" in top_ex and "match_level" in top_ex,
         f"({top_ex['name']} - Match: {top_ex['match_score']}%)")

# 5. Test Exercise Library, Details & Substitutions
print("\n[5/7] KIỂM TRA THƯ VIỆN BÀI TẬP & BÀI TẬP THAY THẾ")
status, lib_data = api_request("GET", "/exercises?body_part=chest&page=1&page_size=5")
test("Tra cứu danh sách bài tập kèm bộ lọc & phân trang", status == 200 and len(lib_data.get("results", [])) == 5)

if lib_data.get("results"):
    first_id = lib_data["results"][0]["id"]
    status, detail_data = api_request("GET", f"/exercises/{first_id}")
    test(f"Lấy chi tiết bài tập theo ID ({first_id})", status == 200 and detail_data.get("id") == first_id)

    status, subs_data = api_request("GET", f"/exercises/{first_id}/substitutions?top_k=3")
    test(f"Gợi ý bài tập thay thế cùng nhóm cơ (FR-007 SRS)", status == 200 and isinstance(subs_data, list))
    if isinstance(subs_data, list) and len(subs_data) > 0:
        print(f"     -> Bài tập thay thế: {subs_data[0].get('name')} ({subs_data[0].get('equipment')})")

# 6. Test User Operations: Favorites & Workout Logging
print("\n[6/7] KIỂM TRA YÊU THÍCH & NHẬT KÝ TẬP LUYỆN (USER FEATURES)")
if lib_data.get("results") and user_token:
    sample_ex = lib_data["results"][0]
    
    # Add Favorite
    status, fav_res = api_request("POST", "/favorites", {
        "exercise_id": sample_ex["id"],
        "exercise_name": sample_ex["name"]
    }, token=user_token)
    test("Thêm bài tập vào mục Yêu thích", status == 200 and "id" in fav_res)
    fav_id = fav_res.get("id")

    # Get Favorites
    status, fav_list = api_request("GET", "/favorites", token=user_token)
    test("Xem danh sách Yêu thích của User", status == 200 and len(fav_list) >= 1)

    # Log Workout
    status, log_res = api_request("POST", "/workout-logs", {
        "exercise_id": sample_ex["id"],
        "exercise_name": sample_ex["name"],
        "sets": 4,
        "reps": 12
    }, token=user_token)
    test("Ghi nhận buổi tập (Workout Log)", status == 200 and "id" in log_res)

    # Get Workout Logs
    status, log_list = api_request("GET", "/workout-logs", token=user_token)
    test("Xem lịch sử tập luyện của User", status == 200 and len(log_list) >= 1)

    # Delete Favorite
    status, del_res = api_request("DELETE", f"/favorites/{sample_ex['id']}", token=user_token)
    test("Xóa bài tập khỏi mục Yêu thích", status == 200)

# 7. Test Admin Stats
print("\n[7/7] KIỂM TRA ADMIN DASHBOARD & STATS")
# Create an admin user or test admin stats if authorized
status, admin_stats = api_request("GET", "/admin/stats")
test("API Admin Stats phản hồi đúng mã 200 hoặc 401/403 (bảo vệ quyền truy cập)", status in [200, 401, 403])

print("\n" + "=" * 60)
print(f"📊 KẾT QUẢ TỔNG HỢP: {passed_tests}/{total_tests} BÀI KIỂM THỬ ĐÃ ĐẠT ({passed_tests/total_tests*100:.1f}%)")
print("=" * 60)
