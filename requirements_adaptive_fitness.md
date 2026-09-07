# 📋 Software Requirements Specification (SRS)
## Ứng Dụng: Adaptive Fitness & Recovery

**Phiên bản:** 1.0.0  
**Ngày:** 26/08/2026 (Cập nhật mới nhất)  
**Trạng thái:** Final / Approved  

---

## 1. Tổng Quan Sản Phẩm

### 1.1 Mục Tiêu
**Adaptive Fitness & Recovery** là ứng dụng thể dục thông minh cá nhân hóa, tự động điều chỉnh kế hoạch tập luyện và phục hồi dựa trên dữ liệu sinh lý thời gian thực, mức độ hiệu suất và phản hồi của người dùng. Ứng dụng kết hợp AI để đưa ra lộ trình tập luyện tối ưu, giảm thiểu nguy cơ chấn thương và tối đa hóa kết quả.

### 1.2 Phạm Vi
- Nền tảng: iOS, Android, Web
- Người dùng mục tiêu: Cá nhân từ 16–65 tuổi, từ người mới bắt đầu đến vận động viên chuyên nghiệp
- Tích hợp: Thiết bị đeo (Garmin, Apple Watch, Fitbit, Whoop), API dinh dưỡng, hệ thống phòng tập

### 1.3 Các Bên Liên Quan
| Bên | Vai Trò |
|-----|---------|
| Người dùng cuối | Tập luyện và theo dõi sức khỏe |
| Huấn luyện viên (PT) | Tạo và giám sát kế hoạch tập |
| Quản trị viên | Quản lý hệ thống và nội dung |
| Chuyên gia Y tế | Cố vấn về bài tập phục hồi |

---

## 2. Yêu Cầu Chức Năng (Functional Requirements)

### 2.1 Quản Lý Tài Khoản & Hồ Sơ

#### FR-001: Đăng ký & Xác thực
- Người dùng có thể đăng ký bằng email, Google, Apple ID hoặc Facebook
- Hỗ trợ xác thực 2 yếu tố (2FA)
- Cho phép đăng nhập sinh trắc học (vân tay, nhận diện khuôn mặt) trên thiết bị di động

#### FR-002: Hồ Sơ Người Dùng
- Thu thập thông tin ban đầu: tuổi, giới tính, chiều cao, cân nặng, % mỡ cơ thể
- Lịch sử chấn thương và các vùng cơ thể cần tránh
- Mục tiêu tập luyện: giảm cân, tăng cơ, cải thiện sức bền, phục hồi, thể thao cụ thể
- Mức độ kinh nghiệm: Người mới / Trung cấp / Nâng cao / Vận động viên
- Thiết bị tập có sẵn: gym đầy đủ, nhà / không thiết bị, thiết bị tối thiểu

---

### 2.2 Đánh Giá Thể Lực Ban Đầu (Fitness Assessment)

#### FR-003: Kiểm Tra Thể Lực
- Bài kiểm tra sức mạnh: push-up tối đa, squat, plank time
- Kiểm tra sức bền: bài test bước 3 phút hoặc chạy 1.5 km
- Kiểm tra linh hoạt: sit-and-reach, đánh giá tầm vận động khớp
- Tính toán tự động VO2Max ước tính, 1RM (1-rep max) theo nhóm cơ

#### FR-004: Điểm Cơ Sở (Baseline Score)
- Hệ thống tính **FitnessScore™** tổng hợp từ các bài kiểm tra
- So sánh với chuẩn dân số cùng độ tuổi, giới tính
- Xác định điểm mạnh/yếu để cá nhân hóa chương trình

---

### 2.3 Tạo Kế Hoạch Tập Thông Minh (Adaptive Plan Engine)

#### FR-005: Kế Hoạch Tập Cá Nhân Hóa
- AI tạo chương trình tập theo tuần/tháng dựa trên hồ sơ và mục tiêu
- Hỗ trợ các phương pháp tập: Strength Training, HIIT, Cardio, Yoga, Pilates, Functional Fitness, Sports-Specific
- Tự động phân bổ khối lượng tập (volume), cường độ (intensity) và thời gian nghỉ ngơi (rest)
- Hỗ trợ lịch tập linh hoạt: 2–7 ngày/tuần

#### FR-006: Điều Chỉnh Thích Nghi (Adaptive Adjustment)
- Sau mỗi buổi tập, ứng dụng thu thập:
  - Mức độ khó cảm nhận (RPE 1–10)
  - Chất lượng giấc ngủ đêm trước
  - Mức độ đau nhức cơ (DOMS score)
  - Nhịp tim phục hồi (HRV nếu có thiết bị đeo)
- Thuật toán tự điều chỉnh buổi tập tiếp theo: tăng/giảm volume, thay thế bài tập, điều chỉnh cường độ
- Cảnh báo overtraining và đề xuất ngày nghỉ ngơi bắt buộc

#### FR-007: Thư Viện Bài Tập
- Hơn 1.000 bài tập với video hướng dẫn HD
- Phân loại: nhóm cơ, thiết bị, mức độ, loại hình
- Hướng dẫn kỹ thuật chi tiết và lỗi thường gặp
- Tùy chọn bài tập thay thế (substitution) cùng mục tiêu cơ

---

### 2.4 Theo Dõi Buổi Tập (Workout Tracking)

#### FR-008: Ghi Lại Buổi Tập
- Giao diện theo dõi tập theo thời gian thực: set, rep, kg/lb, thời gian
- Hỗ trợ nhập tay và tự động gợi ý dựa trên lịch sử
- Tích hợp đồng hồ đếm ngược nghỉ giữa set
- Ghi âm/ghi hình tư thế tập để phân tích kỹ thuật (tùy chọn)

#### FR-009: Phân Tích Sau Buổi Tập
- Tóm tắt: tổng khối lượng (volume load), calo đốt, nhóm cơ đã kích thích
- Biểu đồ so sánh với buổi tập trước
- Chỉ số tiến độ: 1RM cập nhật, personal record (PR) thông báo

---

### 2.5 Theo Dõi Phục Hồi (Recovery Monitoring)

#### FR-010: Chỉ Số Phục Hồi
- Thu thập dữ liệu từ thiết bị đeo: HRV (Heart Rate Variability), nhịp tim lúc nghỉ (RHR), chất lượng và thời lượng giấc ngủ
- Thu thập thủ công: mức độ mệt mỏi (1–10), căng thẳng tâm lý, chế độ dinh dưỡng
- **Recovery Score** hàng ngày (0–100) được tính và hiển thị nổi bật

#### FR-011: Đề Xuất Phục Hồi
- Phân loại ngày: **Full Training / Modified Training / Active Recovery / Complete Rest**
- Đề xuất bài tập phục hồi chủ động: foam rolling, giãn cơ, yoga nhẹ, bơi lội nhẹ
- Hướng dẫn kỹ thuật thở và thiền định để giảm căng thẳng thần kinh (CNS)
- Nhắc nhở uống nước và dinh dưỡng phục hồi sau tập

#### FR-012: Theo Dõi Chấn Thương
- Ghi nhận chấn thương và vùng đau
- Điều chỉnh kế hoạch tập tự động để tránh vùng bị ảnh hưởng
- Bài tập phục hồi chấn thương (rehabilitation exercises) được cá nhân hóa
- Đề xuất khi nào nên gặp chuyên gia y tế

---

### 2.6 Dinh Dưỡng & Thuỷ Hóa (Nutrition & Hydration)

#### FR-013: Theo Dõi Dinh Dưỡng
- Tích hợp với ứng dụng dinh dưỡng (MyFitnessPal, Cronometer)
- Tính toán nhu cầu macro (protein, carb, fat) theo mục tiêu và lịch tập ngày hôm đó
- Gợi ý thực phẩm phù hợp với mục tiêu và thời điểm trong ngày (pre/post workout)

#### FR-014: Theo Dõi Nước Uống
- Nhắc nhở uống nước thông minh dựa trên cường độ tập và thời tiết
- Ghi nhận lượng nước đã uống trong ngày

---

### 2.7 Tiến Độ & Phân Tích (Progress & Analytics)

#### FR-015: Dashboard Tổng Quan
- Biểu đồ xu hướng: cân nặng, body composition, sức mạnh, sức bền theo thời gian
- Chuỗi tập liên tục (streak), huy hiệu thành tích (badges)
- Báo cáo tuần/tháng tự động gửi qua email

#### FR-016: Phân Tích Nâng Cao
- Biểu đồ tải lượng tập (training load) theo tuần và phát hiện xu hướng overtraining
- Tương quan giữa chất lượng giấc ngủ và hiệu suất tập
- Dự báo ngày đạt mục tiêu dựa trên tiến độ hiện tại

---

### 2.8 Tính Năng Xã Hội & Cộng Đồng

#### FR-017: Thách Đấu & Leaderboard
- Tham gia thử thách (challenges) cộng đồng hoặc tự tạo với bạn bè
- Bảng xếp hạng tuần/tháng theo nhóm

#### FR-018: Chia Sẻ Thành Tích
- Chia sẻ workout summary lên mạng xã hội
- Kết nối với bạn bè trong ứng dụng và xem tiến độ của nhau (nếu được phép)

#### FR-019: Huấn Luyện Viên Trực Tuyến
- Người dùng có thể kết nối với HLV được chứng nhận
- HLV có thể xem dữ liệu tập luyện, chỉnh sửa kế hoạch và nhắn tin với học viên

---

### 2.9 Thông Báo & Nhắc Nhở

#### FR-020: Hệ Thống Thông Báo Thông Minh
- Nhắc nhở buổi tập theo lịch đã cài đặt
- Thông báo khi Recovery Score thấp (cảnh báo overtraining)
- Nhắc nhở uống nước, ngủ đúng giờ
- Chúc mừng khi đạt personal record hoặc cột mốc

---

## 3. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

### 3.1 Hiệu Năng (Performance)

| ID | Yêu Cầu | Ngưỡng |
|----|---------|--------|
| NFR-P01 | Thời gian tải màn hình chính | < 2 giây |
| NFR-P02 | Thời gian tạo kế hoạch tập AI | < 5 giây |
| NFR-P03 | Đồng bộ dữ liệu thiết bị đeo | < 30 giây |
| NFR-P04 | Tải video bài tập (tốc độ 4G) | < 3 giây |

### 3.2 Độ Tin Cậy & Khả Dụng (Reliability & Availability)
- **Uptime:** ≥ 99.5% (trừ bảo trì có lịch)
- Chế độ offline: theo dõi buổi tập không cần internet, đồng bộ khi có kết nối
- Sao lưu dữ liệu tự động mỗi 24 giờ
- Thời gian phục hồi sự cố (RTO): < 4 giờ

### 3.3 Bảo Mật & Quyền Riêng Tư (Security & Privacy)

| ID | Yêu Cầu |
|----|---------|
| NFR-S01 | Mã hóa dữ liệu lưu trữ: AES-256 |
| NFR-S02 | Mã hóa truyền tải: TLS 1.3 |
| NFR-S03 | Tuân thủ GDPR, CCPA và PDPA (Việt Nam) |
| NFR-S04 | Người dùng có quyền xuất và xóa toàn bộ dữ liệu |
| NFR-S05 | Không bán dữ liệu cá nhân cho bên thứ ba |
| NFR-S06 | Nhật ký kiểm toán (audit log) đầy đủ |

### 3.4 Khả Năng Mở Rộng (Scalability)
- Kiến trúc microservices hỗ trợ mở rộng ngang (horizontal scaling)
- Hỗ trợ đồng thời ≥ 100,000 người dùng hoạt động
- Database sharding sẵn sàng cho ≥ 10 triệu người dùng

### 3.5 Khả Năng Sử Dụng & Giao Diện (Usability & UI/UX)
- Giao diện đạt chuẩn WCAG 2.1 AA (hỗ trợ người khiếm khuyết)
- **Thiết kế chủ đạo (Design System):** Phong cách **Premium Dark Mode** hiện đại, cao cấp.
  - Màu nền chính (Background): Deep Zinc/Black (`#09090B`)
  - Màu nền phụ (Surface/Cards): Elevated Dark (`#18181B`)
  - Màu nhấn (Primary/Accent): Cam nổi bật (`#FF4500`) tạo sự năng động, thể thao.
  - Typography: Rõ ràng, tối giản với màu chữ chủ đạo là trắng (`#FAFAFA`) và xám (`#A1A1AA`).
- Tối ưu cho màn hình 4" – 13" (phone, tablet)
- Ứng dụng công nghệ Glassmorphism và viền tinh tế (`#27272A`) cho các thành phần UI.
- Đa ngôn ngữ: Tiếng Việt, Tiếng Anh (giai đoạn 1), mở rộng thêm sau

### 3.6 Khả Năng Bảo Trì (Maintainability)
- Độ bao phủ kiểm thử (test coverage): ≥ 80%
- CI/CD pipeline tự động
- Tài liệu API đầy đủ theo chuẩn OpenAPI 3.0

---

## 4. Yêu Cầu Tích Hợp (Integration Requirements)

### 4.1 Thiết Bị & Nền Tảng Sức Khỏe
| Tích Hợp | Dữ Liệu Thu Thập | Ưu Tiên |
|----------|------------------|---------|
| Apple HealthKit | HRV, giấc ngủ, steps, nhịp tim | Must Have |
| Google Fit | Steps, hoạt động, nhịp tim | Must Have |
| Garmin Connect | HRV, giấc ngủ chi tiết, GPS | Should Have |
| Whoop | Recovery score, strain | Should Have |
| Fitbit | Giấc ngủ, nhịp tim, steps | Should Have |
| Polar | HRV, nhịp tim tập luyện | Could Have |
| Oura Ring | HRV, giấc ngủ, nhiệt độ cơ thể | Could Have |

### 4.2 Dịch Vụ Bên Thứ Ba
- **Thanh toán:** Stripe, Apple Pay, Google Pay, VNPay
- **Phân tích:** Firebase Analytics, Mixpanel
- **Push Notification:** Firebase Cloud Messaging, APNs
- **Lưu trữ media:** AWS S3 / Cloudflare R2
- **AI/ML:** Google Vertex AI hoặc OpenAI API cho engine gợi ý

---

## 5. Mô Hình Dữ Liệu Chính (Core Data Entities)

```
User ──────────────── UserProfile
  │                       │
  ├── FitnessAssessment    ├── InjuryHistory
  │                       │
  ├── TrainingPlan ────────┤
  │     └── Workout        │
  │           └── ExerciseSet
  │
  ├── RecoveryLog ─────── SleepData
  │     └── HRVData            └── WearableSync
  │
  ├── NutritionLog
  └── ProgressMetric
```

---

## 6. Yêu Cầu Mô Hình AI (AI Engine Requirements)

### 6.1 Thuật Toán Thích Nghi
- **Input:** Recovery Score, RPE lịch sử, tiến độ sức mạnh, dữ liệu HRV, lịch sử chấn thương
- **Output:** Kế hoạch tập điều chỉnh, cường độ bài tập, khuyến nghị nghỉ ngơi
- **Model:** Reinforcement Learning + Collaborative Filtering kết hợp
- **Chu kỳ học:** Cập nhật mô hình mỗi 7 ngày dựa trên phản hồi người dùng

### 6.2 Phân Tích Kỹ Thuật Tập (Computer Vision - Giai Đoạn 2)
- Phân tích video tập luyện để phát hiện lỗi kỹ thuật
- Cảnh báo tư thế sai theo thời gian thực
- Độ chính xác nhận diện tư thế: ≥ 85%

### 6.3 Dự Báo Rủi Ro Chấn Thương
- Phân tích xu hướng tải lượng tập để cảnh báo nguy cơ chấn thương
- Dự đoán trước 3–5 ngày khi nguy cơ vượt ngưỡng an toàn

---

## 7. Mô Hình Kinh Doanh & Gói Dịch Vụ (Monetization)

| Tính Năng | Free | Premium (\$9.99/tháng) | Elite (\$19.99/tháng) |
|-----------|------|------------------------|------------------------|
| Kế hoạch tập cơ bản | ✅ | ✅ | ✅ |
| Theo dõi buổi tập | ✅ | ✅ | ✅ |
| Thư viện bài tập (200 bài) | ✅ | ❌ | ❌ |
| Thư viện bài tập đầy đủ | ❌ | ✅ | ✅ |
| Kế hoạch tập AI thích nghi | ❌ | ✅ | ✅ |
| Recovery Monitoring | ❌ | ✅ | ✅ |
| Phân tích nâng cao | ❌ | ❌ | ✅ |
| Kết nối HLV cá nhân | ❌ | ❌ | ✅ |
| Phân tích kỹ thuật AI (CV) | ❌ | ❌ | ✅ |

---

## 8. Lộ Trình Phát Triển (Development Roadmap)

### Phase 1 – MVP (Tháng 1–4)
- [ ] Xác thực, hồ sơ người dùng
- [ ] Thư viện bài tập cơ bản (200 bài)
- [ ] Tạo kế hoạch tập theo quy tắc (rule-based)
- [ ] Theo dõi buổi tập thủ công
- [ ] Tích hợp Apple Health & Google Fit
- [ ] Báo cáo tiến độ cơ bản

### Phase 2 – Core AI (Tháng 5–8)
- [ ] Engine thích nghi AI (Adaptive Plan Engine)
- [ ] Recovery Score từ dữ liệu thiết bị đeo
- [ ] Tích hợp Garmin, Whoop, Fitbit
- [ ] Thông báo thông minh
- [ ] Tính năng cộng đồng & thử thách

### Phase 3 – Advanced (Tháng 9–12)
- [ ] Computer Vision phân tích kỹ thuật tập
- [ ] Dự báo rủi ro chấn thương
- [ ] Tính năng HLV trực tuyến
- [ ] Mở rộng ngôn ngữ & thị trường quốc tế

---

## 9. Ràng Buộc & Giả Định (Constraints & Assumptions)

### Ràng Buộc
- Ứng dụng phải hoạt động trên iOS 15+ và Android 10+
- Dữ liệu y tế phải tuân thủ các quy định địa phương (GDPR, PDPA).
- Ngân sách phát triển Phase 1: Theo kế hoạch dự án khởi tạo (Project Charter).
- Team phát triển ban đầu: Đội ngũ 4-6 thành viên (gồm Project Manager, Backend/AI Dev, Mobile Dev, UI/UX Designer).

### Giả Định
- Người dùng đồng ý chia sẻ dữ liệu sức khỏe để nhận gợi ý cá nhân hóa
- Kết nối internet khả dụng ít nhất trong lần đầu thiết lập
- Ứng dụng không thay thế tư vấn y tế chuyên nghiệp
- Dữ liệu từ thiết bị đeo là chính xác theo thông số kỹ thuật của nhà sản xuất

---

## 10. Bảng Chú Giải Thuật Ngữ

| Thuật Ngữ | Giải Thích |
|-----------|------------|
| HRV | Heart Rate Variability – Biến thiên nhịp tim, chỉ số phục hồi thần kinh |
| RPE | Rate of Perceived Exertion – Mức độ khó cảm nhận chủ quan (1–10) |
| DOMS | Delayed Onset Muscle Soreness – Đau nhức cơ khởi phát muộn |
| 1RM | One-Rep Maximum – Khối lượng tối đa cho 1 lần lặp |
| VO2Max | Lượng oxy tối đa cơ thể sử dụng được – chỉ số sức bền tim mạch |
| CNS | Central Nervous System – Hệ thần kinh trung ương |
| HIIT | High-Intensity Interval Training – Tập luyện cường độ cao ngắt quãng |
| PR | Personal Record – Kỷ lục cá nhân |
| RHR | Resting Heart Rate – Nhịp tim lúc nghỉ ngơi |

---

## 11. Các Ca Sử Dụng Chính (Core Use Cases)

| Use Case | Mô tả ngắn gọn |
|----------|----------------|
| **UC01: Khởi tạo hồ sơ** | Người dùng mới nhập dữ liệu cơ thể, mục tiêu và hoàn thành bài kiểm tra thể lực để AI phân tích. |
| **UC02: Tạo kế hoạch tập**| Hệ thống AI tự động sinh ra lịch tập luyện hàng tuần dựa trên Fitness Score và mục tiêu. |
| **UC03: Ghi nhận buổi tập**| Người dùng đánh dấu hoàn thành các bài tập, nhập số Reps/Weights thực tế và RPE. |
| **UC04: Điều chỉnh tự động**| Sau khi ghi nhận buổi tập và dữ liệu phục hồi (giấc ngủ/DOMS), AI điều chỉnh lịch trình của ngày hôm sau. |
| **UC05: Quản trị hệ thống**| Admin đăng nhập vào Dashboard để thêm/sửa bài tập, xem thống kê người dùng và quản lý phản hồi. |

---

*Tài liệu này là nền tảng chuẩn thức để tiến hành lập trình và nghiệm thu sản phẩm.*
