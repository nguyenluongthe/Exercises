"""
Dịch trước toàn bộ hướng dẫn tập luyện (instructions_en) sang tiếng Việt,
lưu vào field instructions_vi trong data/exercises_merged.json.

Chạy 1 lần duy nhất (mất vài phút vì có 2000+ đoạn văn bản).
Có khả năng LƯU TIẾN ĐỘ và CHẠY LẠI AN TOÀN — nếu bị ngắt giữa chừng
(mất mạng, đóng terminal...), chạy lại lệnh này sẽ bỏ qua các bài đã dịch xong,
chỉ dịch tiếp phần còn thiếu.
"""
import json
import time
from deep_translator import GoogleTranslator

DATA_PATH = "data/exercises_merged.json"
SAVE_EVERY = 50  # Lưu tiến độ sau mỗi 50 bài, tránh mất công nếu bị ngắt giữa chừng

translator = GoogleTranslator(source="en", target="vi")


def translate_text(text: str, retries: int = 3) -> str:
    """Dịch 1 đoạn văn bản, thử lại tối đa `retries` lần nếu lỗi mạng/rate limit."""
    if not text or not text.strip():
        return ""

    # Google Translate (miễn phí) giới hạn ~5000 ký tự/lần gọi — cắt bớt cho an toàn
    text = text[:4500]

    for attempt in range(retries):
        try:
            return translator.translate(text)
        except Exception as e:
            print(f"  ⚠️ Lỗi dịch (thử lại {attempt + 1}/{retries}): {e}")
            time.sleep(2)  # Đợi 2 giây trước khi thử lại, tránh bị chặn do gọi quá nhanh

    print("  ❌ Dịch thất bại sau nhiều lần thử, để trống.")
    return ""


def main():
    print("1. Đang tải dữ liệu...")
    with open(DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)
    print(f"   Tổng số bài tập: {len(data)}")

    already_done = sum(1 for ex in data if ex.get("instructions_vi"))
    print(f"   Đã dịch từ trước: {already_done} bài (sẽ bỏ qua, chỉ dịch phần còn thiếu)")

    print("\n2. Bắt đầu dịch...")
    count_new = 0
    for i, ex in enumerate(data):
        if ex.get("instructions_vi"):
            continue  # Đã dịch rồi, bỏ qua

        instructions_en = ex.get("instructions_en", "")
        translated = translate_text(instructions_en)
        ex["instructions_vi"] = translated
        count_new += 1

        print(f"   [{i + 1}/{len(data)}] {ex.get('name', '')[:40]:40s} -> {'OK' if translated else 'TRỐNG'}")

        # Lưu tạm định kỳ, phòng khi bị ngắt giữa chừng
        if count_new % SAVE_EVERY == 0:
            with open(DATA_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"   💾 Đã lưu tạm tiến độ ({count_new} bài mới dịch xong)")

    # Lưu lần cuối
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Hoàn tất! Đã dịch mới {count_new} bài, tổng cộng {already_done + count_new}/{len(data)} bài có bản tiếng Việt.")


if __name__ == "__main__":
    main()