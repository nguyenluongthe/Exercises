# 🧭 TÀI LIỆU SƠ ĐỒ LUỒNG NGƯỜI DÙNG TOÀN DIỆN (MERMAID USER FLOWS)
**Dự án:** NTRevo - Adaptive Fitness & Recovery Platform  
**Học phần:** Chương 4 - AI trong Thiết kế Sản phẩm & UI/UX  
**Người thực hiện:** Dev 2 (`Dev2-FrontendQA`)  
**Tiêu chuẩn:** Agile UX, Thiết kế lấy người dùng làm trung tâm (UCD), Tuân thủ chuẩn tiếp cận WCAG 2.1 AA  

---

## 1. TỔNG QUAN HÀNH TRÌNH NGƯỜI DÙNG (END-TO-END ATHLETE JOURNEY)

Sơ đồ thể hiện toàn bộ vòng đời tương tác hàng ngày của vận động viên / người tập thể hình với nền tảng NTRevo: từ thức dậy đo chỉ số sinh học, tiếp nhận điểm sẵn sàng (Readiness Score), thực hiện bài tập thích ứng hoặc phục hồi chủ động, đến theo dõi tiến độ dài hạn.

```mermaid
flowchart TD
    Start([🌅 Buổi sáng: Thức dậy]) --> A1[Mở ứng dụng NTRevo]
    A1 --> A2{Đã đồng bộ Wearable?}
    
    A2 -- Có (Apple Watch/Garmin) --> A3[Tự động nạp dữ liệu HRV & Giấc ngủ]
    A2 -- Chưa / Thủ công --> A4[Nhập thời lượng ngủ & Nhịp tim nghỉ RHR]
    
    A3 --> A5[Hiển thị Bản đồ Cơ thể tương tác - DOMS Map]
    A4 --> A5
    
    A5 --> A6[Người dùng chạm chọn các vùng cơ căng mỏi & mức độ đau 1-10]
    A6 --> A7[Bấm: 🧠 Tính toán Readiness Score]
    
    A7 --> B1{Điểm Readiness Score}
    
    B1 -- "Xanh (80 - 100): Phục hồi tối ưu" --> C1[Đề xuất: Bài tập cường độ cao High Intensity / Heavy Day]
    B1 -- "Vàng (50 - 79): Phục hồi trung bình" --> C2[Đề xuất: Điều chỉnh giảm 20% Volume / RPE Max 7]
    B1 -- "Đỏ (< 50): Nguy cơ Overtraining" --> C3[Kích hoạt Giao thức Phục hồi Thích ứng Active Recovery / Rest]
    
    C1 --> D1[Bắt đầu Buổi tập thích ứng]
    C2 --> D1
    C3 --> D2[Thực hiện 15p Giãn cơ Foam Rolling & Hít thở điều hòa]
    
    D1 --> E1[Ghi nhận tải lượng từng Set: Weight, Reps, RPE]
    E1 --> E2{Phát hiện kiệt sức đột ngột RPE >= 9?}
    E2 -- Có --> E3[AI gợi ý ngắt set cuối, tăng thời gian nghỉ giữa set]
    E2 -- Không --> E4[Hoàn thành buổi tập]
    E3 --> E4
    
    D2 --> E4
    E4 --> F1[Tổng kết Tải lượng Training Load & Cập nhật xu hướng tuần]
    F1 --> End([🌙 Kết thúc chu kỳ ngày])
```

---

## 2. LUỒNG CHI TIẾT: ĐO CHỈ SỐ SINH HỌC & BẢN ĐỒ CƠ BẮP (MORNING BIOMETRICS & DOMS)

```mermaid
sequenceDiagram
    autonumber
    actor VDV as Vận động viên
    participant UI as Giao diện NTRevo Check-in
    participant State as Frontend Reactive Store
    participant AI as AI Recovery Engine
    participant DB as PostgreSQL Database

    VDV->>UI: Mở tab "Morning Check-in"
    UI->>VDV: Hiển thị thanh trượt Thời gian ngủ (mặc định 7.0h), ô nhập RHR (bpm)
    VDV->>UI: Kéo chọn 6.5h ngủ, nhập RHR = 62 bpm
    VDV->>UI: Tương tác trên Mô hình 3D/SVG Cơ thể người
    VDV->>UI: Click chọn "Cơ đùi trước (Quadriceps)" -> Mức 6/10
    VDV->>UI: Click chọn "Cơ lưng dưới (Lower Back)" -> Mức 4/10
    
    UI->>State: Cập nhật state cục bộ {sleep: 6.5, rhr: 62, doms: [{muscle: 'quads', pain: 6}, {muscle: 'lower_back', pain: 4}]}
    State-->>UI: Kích hoạt hiển thị vùng cơ sáng màu Cam (#FF4500)
    
    VDV->>UI: Nhấn "Phân tích Thể lực Hôm nay"
    UI->>AI: POST /api/v1/recovery/calculate-readiness
    Note over AI: Trọng số: HRV (40%) + Ngủ (30%) + DOMS (15%) + Stress (15%)
    AI->>DB: Lấy ACWR (Acute:Chronic Workload Ratio) 7 ngày gần nhất
    DB-->>AI: Trả về ACWR = 1.35 (Cận ngưỡng quá tải)
    AI-->>UI: Trả về: Readiness = 64/100 (Vàng - Cần cảnh giác nhóm Đùi và Lưng)
    UI->>VDV: Hiển thị Card khuyến nghị thích ứng kèm nút "Xem bài tập điều chỉnh"
```

---

## 3. LUỒNG QUYẾT ĐỊNH THÍCH ỨNG BÀI TẬP (ADAPTIVE WORKOUT DECISION MATRIX)

Luồng kiểm tra điều kiện logic mà AI Recovery Engine thực thi để quyết định bài tập thay thế nhằm ngăn ngừa chấn thương:

```mermaid
flowchart TD
    subgraph Input ["Chỉ số đầu vào"]
        I1[Điểm Sẵn sàng Readiness Score]
        I2[Danh sách Cơ Đau mỏi DOMS Pain >= 6]
        I3[Chỉ số Quá tải ACWR]
    end

    subgraph DecisionEngine ["Bộ Phân Loại Quyết Định AI"]
        D1{ACWR > 1.5 HOẶC Readiness < 45?}
        D2{Có nhóm cơ chính đau >= 7?}
        D3{Readiness trong khoảng 45 - 75?}
    end

    subgraph Prescription ["Đơn Thuốc Luyện Tập (Prescription)"]
        P1["🛑 Complete Rest (Nghỉ ngơi hoàn toàn, tắm nước ấm, ngủ sớm)"]
        P2["🧘 Active Recovery (15-20 min Mobility, Foam Rolling cho cơ đau)"]
        P3["⚡ Modified Workout (Đổi bài tập cô lập nhóm cơ đau, giảm 30% Volume)"]
        P4["🔥 Full Training (Tiếp tục giáo án nâng tạ/Cardio bình thường)"]
    end

    I1 & I2 & I3 --> D1
    D1 -- Đúng (Cực kỳ nguy hiểm) --> P1
    D1 -- Sai --> D2
    
    D2 -- Đúng (Cơ cụ thể tổn thương) --> D3
    D2 -- Sai --> D3
    
    D3 -- Đúng & Có cơ đau --> P3
    D3 -- Đúng & Không có cơ đau --> P2
    D3 -- Sai (Readiness > 75 & ACWR an toàn) --> P4
```

---

## 4. LUỒNG PHÒNG NGỪA CHẤN THƯƠNG & CẢNH BÁO QUÁ TẢI (OVERTRAINING PROTOCOL)

```mermaid
flowchart LR
    subgraph Monitor ["Giám sát Liên tục"]
        M1[HRV giảm > 20% liên tiếp 3 ngày]
        M2[Khối lượng tập tăng đột ngột > 30%/tuần]
        M3[Điểm RPE trung bình mỗi buổi > 8.5]
    end

    subgraph AlertSystem ["Hệ thống Cảnh báo Thông minh"]
        A1{Phát hiện bất thường?}
        A2[Popup Cảnh báo Đỏ: Nguy cơ Chấn thương Cơ / Gân]
        A3[Thông báo tới Huấn luyện viên Coach Dashboard]
        A4[Khóa bài tập tạ nặng Compound (Squat/Deadlift) trong 48h]
    end

    subgraph Resolution ["Giải pháp Can thiệp"]
        R1[Đề xuất giáo án Deload Week tự động]
        R2[Bài tập bổ trợ vật lý trị liệu khớp gối/cột sống]
    end

    M1 & M2 & M3 --> A1
    A1 -- Phát hiện rủi ro cao --> A2 & A3 & A4
    A2 --> R1
    A4 --> R2
```

---

## 5. TỔNG KẾT TIÊU CHUẨN UX & TRẢI NGHIỆM TƯƠNG TÁC
- **Nguyên lý Giảm thiểu Tải nhận thức (Cognitive Load Reduction):** Mọi thao tác ghi nhận chỉ số buổi sáng được tối ưu hóa chỉ trong **3 bước / dưới 45 giây**.
- **Phản hồi Thị giác Tức thì (Visual Feedback):** Bản đồ cơ thể tự động chuyển màu gradient từ Vàng (`#F59E0B`) sang Đỏ cam (`#FF4500`) tương ứng theo mức độ đau khi người dùng chạm.
- **Tiếp cận Đa phương thức:** Toàn bộ thông báo nguy cơ quá tải đều sử dụng cả biểu tượng cảnh báo hình học kèm màu sắc có độ tương phản $\ge 4.5:1$ nhằm hỗ trợ người khiếm thị màu (Color blindness).
