# HƯỚNG DẪN CÀI ĐẶT & CHẠY ĐỒ ÁN CINEBOOKING

Đề tài: **Hệ thống đặt vé xem phim trực tuyến & Quản trị rạp chiếu phim (CineBooking)**  
Sinh viên: Nguyễn Thành Nhân - MSSV: 2124110299

---

## 1. CẤU TRÚC THƯ MỤC DỰ ÁN
```text
bao cao  java/
├── backend/                             # Mã nguồn Backend (Java Spring Boot 3)
├── fontend/                             # Mã nguồn Frontend (Next.js 15, React 19, TypeScript)
├── database_cinebooking.sql             # Bản sao lưu toàn bộ Cơ sở dữ liệu MySQL (13 bảng + Dữ liệu mẫu)
├── BaoCao_QuanLyGia_DatVeXemPhim.docx   # File Báo cáo đồ án Word
├── PHIẾU CHẤM ĐIỂM ĐỒ ÁN CUỐI MÔN HỌC.docx # Phiếu chấm điểm chính thức của trường
├── danh_gia_do_an_cinebooking.md        # Đánh giá chi tiết theo rubric (Dự kiến 10/10)
├── luong_du_lieu_cinebooking.md         # Sơ đồ và thuyết minh toàn bộ luồng dữ liệu (Data Flow)
└── HUONG_DAN_CHAY_DO_AN.md              # File hướng dẫn chạy dự án này
```

---

## 2. CƠ SỞ DỮ LIỆU (DATABASE MYSQL)
1. Mở **XAMPP** hoặc **MySQL Server** (Cổng 3306).
2. Tạo cơ sở dữ liệu mới mang tên:
   ```sql
   CREATE DATABASE nguyenthanhnhan_2124110299 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import file `database_cinebooking.sql` vào database vừa tạo.

---

## 3. KHỞI CHẠY BACKEND (SPRING BOOT)
1. Mở Terminal / PowerShell tại thư mục `backend`:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
2. Backend sẽ khởi chạy tại: **http://localhost:8080**
3. Tài liệu API Swagger UI: **http://localhost:8080/swagger-ui.html**

---

## 4. KHỞI CHẠY FRONTEND (NEXT.JS)
1. Mở Terminal / PowerShell tại thư mục `fontend`:
   ```powershell
   cd fontend
   npm install
   npm run dev
   ```
   *(Hoặc chạy bản tối ưu production: `npm run build` rồi `npm start`)*
2. Frontend sẽ mở tại: **http://localhost:3000**
3. Trang Quản trị Admin: **http://localhost:3000/admin**

---

## 5. TÀI KHOẢN TRUY CẬP KIỂM THỬ
* **Tài khoản Quản trị viên (Admin)**:
  * Email: `admin@cinema.com`
  * Mật khẩu: `Admin@123`
  * Quyền hạn: Truy cập toàn bộ 6 phân hệ CRUD, quản lý lịch chiếu, duyệt vé, xem biểu đồ doanh thu.
* **Tài khoản Khách hàng (User)**:
  * Email: `khachhang@gmail.com`
  * Mật khẩu: `Customer@123`
  * Quyền hạn: Đặt vé, chọn ghế, áp mã giảm giá, thanh toán QR ZaloPay, xem vé QR Code, tích điểm CineClub.
