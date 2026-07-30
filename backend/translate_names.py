"""
Dịch trước toàn bộ tên bài tập (name) sang tiếng Việt,
lưu vào field name_vi trong data/exercises_merged.json.

Cùng cơ chế với translate_instructions.py: có thể chạy lại an toàn,
tự bỏ qua các bài đã dịch xong.
"""
import json
import time
from deep_translator import GoogleTranslator

DATA_PATH = "data/exercises_merged.json"
SAVE_EVERY = 100  # Tên bài tập ngắn, dịch nhanh hơn nhiều so với instructions -> lưu thưa hơn cũng ổn

translator = GoogleTranslator(source="en", target="vi")


def translate_text(text: str, retries: int = 3) -> str:
    if not text or not text.strip():
        return ""

    for attempt in range(retries):
        try:
            return translator.translate(text)
        except Exception as e:
            print(f"  ⚠️ Lỗi dịch (thử lại {attempt + 1}/{retries}): {e}")
            time.sleep(2)

    print("  ❌ Dịch thất bại sau nhiều lần thử, để trống.")
    return ""


def main():
    print("1. Đang tải dữ liệu...")
    with open(DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)
    print(f"   Tổng số bài tập: {len(data)}")

    already_done = sum(1 for ex in data if ex.get("name_vi"))
    print(f"   Đã dịch từ trước: {already_done} bài (sẽ bỏ qua, chỉ dịch phần còn thiếu)")

    print("\n2. Bắt đầu dịch tên bài tập...")
    count_new = 0
    for i, ex in enumerate(data):
        if ex.get("name_vi"):
            continue

        name_en = ex.get("name", "")
        translated = translate_text(name_en)
        ex["name_vi"] = translated
        count_new += 1

        print(f"   [{i + 1}/{len(data)}] {name_en[:35]:35s} -> {translated[:35] if translated else 'TRỐNG'}")
        time.sleep(0.3)  # Nghỉ nhẹ giữa các lần gọi, tránh bị chặn do gọi quá nhanh

        if count_new % SAVE_EVERY == 0:
            with open(DATA_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"   💾 Đã lưu tạm tiến độ ({count_new} bài mới dịch xong)")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Hoàn tất! Đã dịch mới {count_new} tên bài tập, tổng cộng {already_done + count_new}/{len(data)} bài có tên tiếng Việt.")


if __name__ == "__main__":
    main()