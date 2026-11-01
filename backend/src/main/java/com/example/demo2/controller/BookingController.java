package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.booking.*;
import com.example.demo2.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking & Ticket", description = "Quản lý đặt vé, giữ ghế 5 phút, chống trùng ghế/rạp, xuất vé QR và soát vé (Check-in)")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Tạo đơn đặt vé mới (giữ ghế 5 phút, chống trùng ghế & sai phòng/rạp, áp mã giảm giá)")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO dto) {
        BookingResponseDTO result = bookingService.createBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo đơn đặt vé và giữ ghế (5 phút) thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn đặt vé (hỗ trợ lọc theo userId, showtimeId, status)")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long showtimeId,
            @RequestParam(required = false) String status) {
        List<BookingResponseDTO> list = bookingService.getAllBookings(userId, showtimeId, status);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách đơn đặt vé thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết đơn đặt vé theo ID (kèm vé QR, bắp nước và lịch sử trạng thái)")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingById(@PathVariable Long id) {
        BookingResponseDTO result = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết đơn đặt vé thành công"));
    }

    @GetMapping("/code/{bookingCode}")
    @Operation(summary = "Tra cứu đơn đặt vé theo mã Booking Code (ví dụ: BK-100001)")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingByCode(@PathVariable String bookingCode) {
        BookingResponseDTO result = bookingService.getBookingByCode(bookingCode);
        return ResponseEntity.ok(ApiResponse.success(result, "Tra cứu đơn đặt vé thành công"));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Xem lịch sử thay đổi trạng thái của đơn đặt vé (BookingStatusHistory)")
    public ResponseEntity<ApiResponse<List<BookingStatusHistoryResponseDTO>>> getBookingHistory(@PathVariable Long id) {
        List<BookingStatusHistoryResponseDTO> history = bookingService.getBookingStatusHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history, "Lấy lịch sử trạng thái đơn đặt vé thành công"));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn đặt vé chưa thanh toán và giải phóng ghế ngồi")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingCancelRequestDTO dto) {
        BookingResponseDTO result = bookingService.cancelBooking(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Hủy đơn đặt vé và giải phóng ghế thành công"));
    }

    @PostMapping("/tickets/check-in")
    @Operation(summary = "Soát vé QR Code tại rạp (Chặn vé giả, vé chưa thanh toán, vé sai rạp/suất chiếu hoặc vé đã Check-in rồi)")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> checkinTicket(
            @Valid @RequestBody TicketCheckinRequestDTO dto) {
        TicketResponseDTO result = bookingService.checkinTicket(dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Soát vé (Check-in) hợp lệ thành công"));
    }

    @PostMapping("/{id}/fnb/claim")
    @Operation(summary = "Xác nhận khách hàng đã nhận bắp nước tại quầy F&B")
    public ResponseEntity<ApiResponse<List<BookingFnbResponseDTO>>> claimBookingFnb(@PathVariable Long id) {
        List<BookingFnbResponseDTO> result = bookingService.claimBookingFnb(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Xác nhận giao bắp nước thành công"));
    }

    @PostMapping("/release-expired")
    @Operation(summary = "Quét và tự động giải phóng các đơn giữ ghế đã quá hạn thanh toán (5 phút)")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> releaseExpiredBookings() {
        int releasedCount = bookingService.releaseExpiredHoldBookings();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("releasedBookingsCount", releasedCount),
                "Đã giải phóng " + releasedCount + " đơn giữ ghế quá hạn (5 phút)"));
    }
}
