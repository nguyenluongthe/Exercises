"""
Gộp 2 nguồn dữ liệu bài tập thể dục thành 1 dataset lớn hơn, cân bằng hơn:
  1. exercises-dataset (hasaneyldrm) - 1,324 bài tập, đa ngôn ngữ, có GIF minh họa
  2. free-exercise-db (yuhonas)      -   873 bài tập, Public Domain, phân loại cơ chi tiết hơn

Output: data/exercises_merged.json - schema thống nhất, dùng chung cho train_model.py
"""
import json

MAIN_PATH = "data/exercises.json"
SECONDARY_PATH = "data/free_exercise_db.json"
OUTPUT_PATH = "data/exercises_merged.json"

# Map từ 17 nhóm cơ chi tiết (free-exercise-db) -> 10 nhóm body_part (khớp dataset chính)
MUSCLE_TO_BODYPART = {
    "quadriceps": "upper legs",
    "hamstrings": "upper legs",
    "glutes": "upper legs",
    "adductors": "upper legs",
    "abductors": "upper legs",
    "calves": "lower legs",
    "shoulders": "shoulders",
    "abdominals": "waist",
    "chest": "chest",
    "triceps": "upper arms",
    "biceps": "upper arms",
    "forearms": "lower arms",
    "lats": "back",
    "middle back": "back",
    "lower back": "back",
    "traps": "back",
    "neck": "neck",
}

# Chuẩn hóa tên dụng cụ cho khớp giữa 2 nguồn
EQUIPMENT_MAP = {
    "body only": "body weight",
    "kettlebells": "kettlebell",
    "bands": "band",
    None: "body weight",
}


def normalize_name(name: str) -> str:
    return name.strip().lower()


def load_main_dataset():
    with open(MAIN_PATH, encoding="utf-8") as f:
        data = json.load(f)

    records = []
    for ex in data:
        records.append({
            "id": f"main_{ex.get('id')}",
            "name": ex.get("name", ""),
            "body_part": (ex.get("body_part") or "").strip().lower(),
            "equipment": (ex.get("equipment") or "").strip().lower(),
            "target": (ex.get("target") or "").strip().lower(),
            "muscle_group": (ex.get("muscle_group") or "").strip().lower(),
            "secondary_muscles": ex.get("secondary_muscles", []) or [],
            "instructions_en": (ex.get("instructions", {}) or {}).get("en", ""),
            "image": f"https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/{ex.get('image', '')}" if ex.get("image") else "",
            "gif_url": f"https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/{ex.get('gif_url', '')}" if ex.get("gif_url") else "",
            "source": "exercises-dataset",
        })
    return records


def load_secondary_dataset():
    with open(SECONDARY_PATH, encoding="utf-8") as f:
        data = json.load(f)

    records = []
    for ex in data:
        primary_muscles = ex.get("primaryMuscles", []) or []
        secondary_muscles = ex.get("secondaryMuscles", []) or []
        category = (ex.get("category") or "").strip().lower()

        # Ưu tiên: nếu category là cardio -> body_part = cardio (khớp nhóm hiếm trong dataset chính)
        if category == "cardio":
            body_part = "cardio"
        elif primary_muscles:
            body_part = MUSCLE_TO_BODYPART.get(primary_muscles[0].strip().lower(), "waist")
        else:
            body_part = "waist"  # fallback mặc định

        equipment_raw = ex.get("equipment")
        equipment = EQUIPMENT_MAP.get(equipment_raw, equipment_raw or "body weight")

        instructions = ex.get("instructions", []) or []
        images = ex.get("images", []) or []

        records.append({
            "id": f"fdb_{ex.get('id', normalize_name(ex.get('name', '')))}",
            "name": ex.get("name", ""),
            "body_part": body_part,
            "equipment": str(equipment).strip().lower(),
            "target": primary_muscles[0].strip().lower() if primary_muscles else "",
            "muscle_group": primary_muscles[0].strip().lower() if primary_muscles else "",
            "secondary_muscles": secondary_muscles,
            "instructions_en": " ".join(instructions),
            "image": f"https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{images[0]}" if images else "",
            "gif_url": "",  # nguồn này không có GIF, chỉ có ảnh tĩnh
            "source": "free-exercise-db",
        })
    return records


def main():
    print("1. Đang tải dataset chính (exercises-dataset)...")
    main_records = load_main_dataset()
    print(f"   Số bài tập: {len(main_records)}")

    print("\n2. Đang tải dataset phụ (free-exercise-db)...")
    secondary_records = load_secondary_dataset()
    print(f"   Số bài tập: {len(secondary_records)}")

    print("\n3. Gộp 2 dataset & loại bỏ trùng lặp theo tên...")
    all_records = main_records + secondary_records
    seen_names = set()
    merged = []
    duplicates = 0

    for rec in all_records:
        key = normalize_name(rec["name"])
        if key in seen_names:
            duplicates += 1
            continue
        seen_names.add(key)
        merged.append(rec)

    print(f"   Số bài tập trùng tên đã loại bỏ: {duplicates}")
    print(f"   Tổng số bài tập sau khi gộp: {len(merged)}")

    print("\n4. Phân bố body_part sau khi gộp:")
    from collections import Counter
    bp_counter = Counter(r["body_part"] for r in merged)
    for bp, count in bp_counter.most_common():
        print(f"   {bp}: {count}")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Đã lưu dataset gộp vào: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
