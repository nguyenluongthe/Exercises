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

print("=" * 65)
print("🚀 KIỂM THỬ LUỒNG ONBOARDING & ADAPTIVE FITNESS CHO NGƯỜI MỚI")
print("=" * 65)

# 1. Đăng ký người dùng mới
test_email = f"athlete_{uuid.uuid4().hex[:6]}@example.com"
test_password = "password123"

status, reg = api_request("POST", "/auth/register", {
    "email": test_email,
    "password": test_password,
    "name": "Tran Hoang Nam"
})
print(f"\n[1] Đăng ký tài khoản: {test_email} -> Status: {status}")
print(f"    onboarding_completed mặc định: {reg.get('onboarding_completed')}")
assert status == 200
assert reg.get("onboarding_completed") is False

# 2. Đăng nhập
status, token_res = api_request("POST_FORM", "/auth/login", {
    "username": test_email,
    "password": test_password
})
token = token_res["access_token"]
print(f"\n[2] Đăng nhập nhận JWT Token thành công.")

# 3. Lấy hồ sơ ban đầu
status, init_profile = api_request("GET", "/user/profile", token=token)
print(f"\n[3] Hồ sơ ban đầu (chưa khảo sát):")
print(f"    onboarding_completed: {init_profile.get('onboarding_completed')}")
print(f"    Readiness Score: {init_profile.get('daily_readiness_score')}")

# 4. Người dùng làm khảo sát Onboarding: Chiều cao 175cm, Cân nặng 70kg, Mục tiêu Tăng cơ, Dụng cụ Tạ đơn
status, updated_profile = api_request("PUT", "/user/profile", {
    "age": 25,
    "gender": "male",
    "height": 175.0,
    "weight": 70.0,
    "fitness_goal": "muscle_gain",
    "experience_level": "beginner",
    "available_equipment": "dumbbell",
    "avoid_injury": "knee",
    "onboarding_completed": True
}, token=token)

print(f"\n[4] Khảo sát Onboarding hoàn tất -> Status: {status}")
print(f"    Họ tên: {updated_profile.get('name')}")
print(f"    BMI tính được: {updated_profile.get('bmi')} ({updated_profile.get('bmi_category')})")
print(f"    Điểm FitnessScore™ cơ sở: {updated_profile.get('fitness_score')}/100")
print(f"    onboarding_completed: {updated_profile.get('onboarding_completed')}")
assert updated_profile.get("bmi") == 22.9
assert updated_profile.get("onboarding_completed") is True

# 5. AI tạo Buổi tập thích nghi đề xuất hôm nay (Adaptive Daily Workout)
status, daily_plan = api_request("GET", "/adaptive/daily-workout", token=token)
print(f"\n[5] AI Adaptive Daily Workout:")
print(f"    Tên buổi tập: {daily_plan.get('routine_title_vi')} ({daily_plan.get('routine_title')})")
print(f"    Trạng thái thể trạng: {daily_plan.get('readiness_status_vi')}")
print(f"    Danh sách bài tập ({len(daily_plan.get('exercises', []))} bài):")
for ex in daily_plan.get("exercises", []):
    print(f"     • {ex['name']} [{ex['equipment']}] -> Target: {ex['target']} (Nhóm: {ex['body_part']})")

assert len(daily_plan.get("exercises", [])) > 0

# 6. Người dùng thay đổi mục tiêu sang Giảm mỡ & Dụng cụ Không tạ (Home Bodyweight)
status, updated_profile2 = api_request("PUT", "/user/profile", {
    "fitness_goal": "weight_loss",
    "available_equipment": "body_weight",
}, token=token)
status, daily_plan2 = api_request("GET", "/adaptive/daily-workout", token=token)
print(f"\n[6] Cập nhật mục tiêu sang 'Giảm mỡ & Không tạ' -> Buổi tập mới:")
print(f"    Tên buổi tập mới: {daily_plan2.get('routine_title_vi')} ({daily_plan2.get('routine_title')})")
for ex in daily_plan2.get("exercises", []):
    print(f"     • {ex['name']} [{ex['equipment']}] -> Target: {ex['target']}")

print("\n" + "=" * 65)
print("🎉 TOÀN BỘ LUỒNG ONBOARDING & ADAPTIVE FITNESS HOÀN TOÀN THÀNH CÔNG 100%!")
print("=" * 65)
