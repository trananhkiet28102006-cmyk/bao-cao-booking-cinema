# TÀI LIỆU TOÀN DIỆN: LUỒNG DỮ LIỆU HOẠT ĐỘNG (DATA FLOW) HỆ THỐNG CINEBOOKING

Tài liệu này giải thích chi tiết cách dòng dữ liệu di chuyển từ **Giao diện người dùng (Next.js)** qua **Hệ thống xử lý trung gian (Spring Boot)** xuống **Cơ sở dữ liệu (MySQL)** và phản hồi ngược lại, giúp bạn tự tin trả lời bất kỳ câu hỏi vấn đáp nào từ Giảng viên.

---

## 1. KIẾN TRÚC TỔNG THỂ VÀ LUỒNG ĐI DỮ LIỆU CHUNG (HIGH-LEVEL ARCHITECTURE)

Hệ thống được thiết kế theo mô hình **Decoupled Architecture (Kiến trúc phân tách)** chuẩn công nghiệp:

```mermaid
flowchart TD
    subgraph Client ["1. CLIENT TẦNG GIAO DIỆN (Next.js 15 / React 19)"]
        UI["Giao diện người dùng (Browser)"]
        State["React State & LocalStorage (JWT Token)"]
        API_Client["API Service Layer (cineBookingApi / fetch)"]
    end

    subgraph Security ["2. TẦNG BẢO MẬT & BỘ LỌC (Spring Security)"]
        CORS["CORS Filter (Chỉ chấp nhận từ localhost:3000)"]
        JWT_Filter["JwtAuthenticationFilter (Giải mã & Kiểm tra Token)"]
        SecurityContext["SecurityContextHolder (Thiết lập User & Role)"]
    end

    subgraph Backend ["3. TẦNG XỬ LÝ NGHIỆP VỤ (Spring Boot Backend)"]
        Controller["REST Controller (@RestController / DTO Validation)"]
        Service["Service Layer (@Service / @Transactional Nghiệp vụ)"]
        Repo["Repository Layer (Spring Data JPA / Hibernate)"]
    end

    subgraph Database ["4. TẦNG CƠ SỞ DỮ LIỆU (MySQL)"]
        DB[(MySQL Database - 13 Tables)]
    end

    UI -->|"1. Người dùng thao tác (Click, Nhập form)"| State
    State -->|"2. Gửi HTTP Request (JSON + Bearer Token)"| API_Client
    API_Client -->|"3. Gửi Request qua mạng"| CORS
    CORS --> JWT_Filter
    JWT_Filter --> SecurityContext
    SecurityContext -->|"4. Cho phép vào Controller"| Controller
    Controller -->|"5. Chuyển DTO đã validate"| Service
    Service -->|"6. Thực thi quy tắc nghiệp vụ & gọi ORM"| Repo
    Repo -->|"7. Truy vấn SQL Parameterized"| DB
    DB -->|"8. Trả về ResultSet"| Repo
    Repo -->|"9. Map sang Entity"| Service
    Service -->|"10. Chuyển đổi sang Response DTO"| Controller
    Controller -->|"11. Trả về HTTP 200 OK kèm JSON"| API_Client
    API_Client -->|"12. Cập nhật State & Re-render giao diện"| UI
```

---

## 2. LUỒNG 1: XÁC THỰC & PHÂN QUYỀN (AUTHENTICATION & JWT FLOW)

Đây là quy trình bảo vệ hệ thống khỏi truy cập trái phép và phân biệt quyền giữa **Khách hàng (Customer)** và **Quản trị viên (Admin)**:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng / Admin
    participant FE as Frontend (Next.js)
    participant AuthCtrl as AuthController
    participant Sec as Spring Security (BCrypt)
    participant TokenProvider as JwtTokenProvider
    participant DB as MySQL Database

    User->>FE: Nhập Email & Mật khẩu -> Bấm "Đăng nhập ngay"
    FE->>AuthCtrl: POST /api/v1/auth/login { email, password }
    AuthCtrl->>Sec: AuthenticationManager.authenticate()
    Sec->>DB: Tìm User theo Email
    DB-->>Sec: Trả về User Entity (Mật khẩu băm BCrypt + Role)
    Sec->>Sec: So khớp mật khẩu người dùng nhập với mật khẩu băm BCrypt
    alt Mật khẩu sai
        Sec-->>FE: Trả về HTTP 401 Unauthorized ("Email hoặc mật khẩu không đúng")
        FE-->>User: Hiện thông báo lỗi màu đỏ (Toast Alert)
    else Mật khẩu đúng
        Sec->>TokenProvider: Tạo JWT Token (Chứa UserId, Email, Role, Hạn dùng)
        TokenProvider-->>AuthCtrl: Trả về chuỗi JWT Access Token
        AuthCtrl-->>FE: HTTP 200 OK { token, user: { id, fullName, role, ... } }
        FE->>FE: Lưu Token vào LocalStorage & cập nhật userProfile State
        FE-->>User: Đăng nhập thành công! Bắn pháo hoa Confetti & mở quyền truy cập
    end
```

> **Điểm mấu chốt khi bảo vệ đồ án**:
> - Mọi request sau khi đăng nhập đều tự động đính kèm header: `Authorization: Bearer <token>`.
> - Backend không lưu session trong RAM (Stateless), giúp hệ thống mở rộng linh hoạt và tiết kiệm tài nguyên máy chủ.

---

## 3. LUỒNG 2: NGHIỆP VỤ ĐẶT VÉ & THANH TOÁN (BOOKING & PAYMENT FLOW)

Đây là **luồng nghiệp vụ phức tạp và quan trọng nhất** của toàn bộ đề tài:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant FE as Next.js Booking Page
    participant BookingCtrl as BookingController
    participant BookingSvc as BookingService
    participant ZaloPay as Cổng ZaloPay / Mock Gateway
    participant DB as MySQL Database

    Customer->>FE: 1. Chọn Phim -> Chọn Rạp -> Chọn Suất chiếu
    FE->>DB: Lấy sơ đồ phòng chiếu & danh sách ghế đã bán
    Customer->>FE: 2. Chọn ghế (VIP/Thường) + Chọn Combo Bắp Nước + Nhập mã giảm giá
    Customer->>FE: 3. Bấm "Đặt vé & Hiện mã QR thanh toán"
    
    FE->>BookingCtrl: POST /api/v1/bookings (ShowtimeId, Danh sách ghế, F&B, CouponCode)
    Note over BookingCtrl,BookingSvc: Bắt đầu giao dịch @Transactional
    
    BookingSvc->>DB: Kiểm tra: Các ghế được chọn ĐÃ BỊ AI ĐẶT TRƯỚC CHƯA?
    alt Ghế đã bị trùng
        BookingSvc-->>FE: HTTP 409 Conflict ("Ghế C04 đã được đặt, vui lòng chọn lại!")
        FE-->>Customer: Cảnh báo ghế bị trùng và reload sơ đồ ghế
    else Ghế hoàn toàn trống
        BookingSvc->>DB: Kiểm tra tính hợp lệ của Mã giảm giá (Hạn dùng, số lượt)
        BookingSvc->>BookingSvc: Tính tổng tiền: (Tiền vé + Bắp nước - Giảm giá Coupon)
        BookingSvc->>DB: Lưu bản ghi `Booking` với trạng thái = PENDING (Chờ thanh toán)
        BookingSvc->>DB: Khóa tạm các ghế trong bảng `booking_seats`
        BookingSvc->>ZaloPay: Tạo đơn hàng thanh toán & sinh mã QR động
        ZaloPay-->>BookingSvc: Trả về QR Code Data & Transaction Id
        BookingSvc-->>FE: HTTP 200 OK { bookingId, qrCode, totalAmount, status: "PENDING" }
        
        FE-->>Customer: Hiển thị Modal quét mã QR ZaloPay và đếm ngược thời gian
        Customer->>FE: Quét mã QR thanh toán thành công (hoặc xác nhận giả lập)
        
        FE->>BookingCtrl: PUT /api/v1/bookings/{id}/pay (Xác nhận đã thanh toán)
        BookingSvc->>DB: Cập nhật trạng thái Booking = PAID
        BookingSvc->>DB: Tích lũy 10% giá trị đơn hàng vào `loyalty_points` của User
        BookingSvc->>DB: Tự động trừ 1 lượt sử dụng của Coupon
        BookingSvc->>DB: Tạo bản ghi Lịch sử trạng thái (`booking_history`)
        BookingSvc->>DB: Tạo mã vé điện tử QR Code Check-in
        BookingSvc-->>FE: HTTP 200 OK { status: "PAID", ticketQrCode }
        FE-->>Customer: Hiển thị Vé Điện Tử QR Check-in hoàn tất!
    end
```

---

## 4. LUỒNG 3: QUẢN TRỊ ADMIN (CRUD, BÁO CÁO DOANH THU & ĐỒNG BỘ HAI CHIỀU)

Khi Quản trị viên thao tác trên trang Admin Console:

```mermaid
flowchart LR
    subgraph AdminActions ["Thao tác Quản trị"]
        A1["Thêm / Sửa Phim mới"]
        A2["Tạo Suất Chiếu mới"]
        A3["Duyệt / Hủy Đơn Vé"]
        A4["Tạo Mã Giảm Giá"]
    end

    subgraph ValidationSec ["Bảo mật & Kiểm tra"]
        V1["Kiểm tra Quyền: hasRole('ADMIN')"]
        V2["Validate Dữ liệu nhập"]
        V3["Ràng buộc: Không xóa Phim đang chiếu"]
    end

    subgraph Persistence ["Lưu trữ & Thống kê"]
        P1["Lưu MySQL Database"]
        P2["Tính toán lại Doanh thu 7 ngày"]
        P3["Tính tỷ lệ lấp đầy phòng chiếu"]
    end

    subgraph ClientSync ["Đồng bộ tức thì lên Client"]
        S1["Cập nhật bảng dữ liệu 60fps"]
        S2["GSAP re-animate biểu đồ cột"]
        S3["Bắn Toast thông báo thành công"]
    end

    AdminActions --> ValidationSec
    ValidationSec --> Persistence
    Persistence --> ClientSync
```

---

## 5. TỔNG KẾT BẢNG TÓM TẮT DÀNH CHO BÁO CÁO VẤN ĐÁP

| Câu hỏi của Giảng viên | Câu trả lời trọng tâm (Keywords) |
|:---|:---|
| **1. Frontend và Backend giao tiếp qua giao thức nào?** | Qua **RESTful API (JSON)** thông qua giao thức HTTP/HTTPS với các phương thức chuẩn: `GET` (lấy dữ liệu), `POST` (tạo mới/đặt vé), `PUT` (cập nhật trạng thái/thanh toán), `DELETE` (xóa). |
| **2. Làm thế nào để Backend biết ai đang gửi yêu cầu?** | Thông qua **JWT (JSON Web Token)** nằm trong Header `Authorization: Bearer <token>`. Lớp `JwtAuthenticationFilter` tại Backend sẽ giải mã token để lấy User ID và quyền hạn (Role) mà không cần truy vấn lại bảng mật khẩu. |
| **3. Làm sao chống đặt trùng ghế khi hai người bấm cùng lúc?** | Sử dụng **Database Transaction (`@Transactional`)** kết hợp kiểm tra trạng thái ghế `AVAILABLE` tại tầng Service trước khi tạo đơn và khóa ghế tạm thời ở trạng thái `PENDING`. |
| **4. Dữ liệu thay đổi trên Admin có tác động đến Khách hàng không?** | Có, dữ liệu được lưu tập trung duy nhất tại **MySQL Database**. Khi Admin tạo phim mới hoặc đổi giá vé, người dùng tải lại hoặc chuyển tab sẽ lập tức nhận dữ liệu mới nhất từ API. |
