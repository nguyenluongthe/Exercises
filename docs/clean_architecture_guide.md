# 🏛️ HƯỚNG DẪN KIẾN TRÚC PHÂN TẦNG CLEAN ARCHITECTURE
## NTRevo Adaptive Fitness & Recovery Platform
**Tác giả:** Dev 1 - Backend Lead (`Dev1-BackendLead`)  
**Sprint:** 3 (Chương 5: AI trong Thiết kế & Kiến trúc Phần mềm)  
**Tiêu chuẩn đáp ứng:** SOLID, NFR-Maintainability, Clean Code  

---

## 1. NGUYÊN TẮC PHÂN TẦNG (THE DEPENDENCY RULE)

Hệ thống NTRevo Backend tuân thủ nghiêm ngặt **Quy tắc Phụ thuộc (Dependency Rule)** của Robert C. Martin:
> *Mã nguồn ở các tầng bên trong (Core Domain) tuyệt đối không được phụ thuộc hoặc biết bất kỳ điều gì về các tầng bên ngoài (Frameworks, Web Server, Database Driver).*

```
+-------------------------------------------------------------+
| 4. Frameworks & Drivers (HTTP Server, SQLite/PostgreSQL)    |
|   +-------------------------------------------------------+ |
|   | 3. Interface Adapters (Controllers, Repositories Impl) | |
|   |   +-------------------------------------------------+ | |
|   |   | 2. Application Business Rules (Use Cases)       | | |
|   |   |   +-------------------------------------------+ | | |
|   |   |   | 1. Enterprise Business Rules (Entities)   | | | |
|   |   |   +-------------------------------------------+ | | |
|   |   +-------------------------------------------------+ | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
               Tầng ngoài ---> phụ thuộc vào ---> Tầng trong
```

---

## 2. CHI TIẾT 4 PHÂN TẦNG TRONG MÃ NGUỒN

### 2.1 Tầng 1: Domain Entities (`backend/domain/`)
- Chứa các đối tượng nghiệp vụ cốt lõi không phụ thuộc vào bất kỳ thư viện ngoài nào (Pure Python Dataclasses).
- Ví dụ: `Athlete`, `BiometricSample`, `WorkoutSession`, `Exercise`.
- Chứa các quy tắc nghiệp vụ bất biến: Giới hạn nhịp tim sinh học, công thức chuyển đổi 1RM, điều kiện phát hiện kiệt sức Overtraining.

### 2.2 Tầng 2: Application Use Cases (`backend/use_cases/`)
- Điều phối dòng chảy dữ liệu thực hiện các ca sử dụng nghiệp vụ:
  - `CalculateReadinessUseCase`: Lấy dữ liệu sinh trắc học -> chuyển qua AI Engine -> cập nhật trạng thái phục hồi.
  - `GenerateAdaptiveWorkoutUseCase`: Đọc hồ sơ thể lực và điểm phục hồi -> điều chỉnh volume/intensity -> xuất giáo án.
- Định nghĩa các **Giao tiếp trừu tượng (Abstract Interfaces / Ports)** cho Repository và Cache.

### 2.3 Tầng 3: Interface Adapters (`backend/adapters/`)
- Chuyển đổi dữ liệu giữa định dạng tối ưu của Use Case và định dạng của các công cụ bên ngoài:
  - **Repositories:** `SqliteUserRepository`, `PostgresRecoveryLogRepository`.
  - **Presenters / Serializers:** Chuyển đổi Entity sang JSON theo đặc tả [openapi_spec.yaml](file:///c:/Users/dinhn/.gemini/antigravity-ide/scratch/ntrevo-adaptive-fitness/api/openapi_spec.yaml).

### 2.4 Tầng 4: Frameworks & Infrastructure (`backend/infra/`)
- Chứa web server framework (BaseHTTPRequestHandler / FastAPI), DB connection pool, Redis cache driver.

---

## 3. LỢI ÍCH KIỂM THỬ (TESTABILITY)
Nhờ việc tách biệt hoàn toàn Domain & Use Case khỏi Database và HTTP Server:
- Tốc độ chạy Unit Tests đạt dưới **10ms/test case** do có thể dùng In-Memory Mock Repository.
- Dễ dàng thay thế cơ sở dữ liệu từ SQLite sang PostgreSQL hoặc Cloud Spanner mà không cần sửa đổi dù chỉ 1 dòng mã nghiệp vụ tính điểm.
