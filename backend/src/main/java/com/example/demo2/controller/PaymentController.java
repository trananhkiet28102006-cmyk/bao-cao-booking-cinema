package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.payment.*;
import com.example.demo2.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Payment, ZaloPay Sandbox, Refund & Loyalty", description = "Quản lý thanh toán đơn đặt vé, tích hợp cổng ZaloPay Sandbox thật, hoàn tiền/hủy vé và tích điểm thành viên (Loyalty)")
public class PaymentController {

    private final PaymentService paymentService;

    // =========================================================================
    // 1. CỔNG THANH TOÁN ZALOPAY SANDBOX THẬT (OPENAPI V2)
    // =========================================================================

    @PostMapping("/payments/zalopay/create/{bookingId}")
    @Operation(summary = "Tạo đơn thanh toán thật trên cổng ZaloPay Sandbox (trả về link orderUrl để mở trang thanh toán ZaloPay)")
    public ResponseEntity<ApiResponse<ZaloPayCreateOrderResponseDTO>> createZaloPayOrder(
            @PathVariable Long bookingId) {
        ZaloPayCreateOrderResponseDTO result = paymentService.createZaloPayOrder(bookingId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo link thanh toán ZaloPay thành công! Hãy mở orderUrl trên trình duyệt để thanh toán."));
    }

    @PostMapping("/payments/zalopay/query/{appTransId}")
    @Operation(summary = "Truy vấn trạng thái giao dịch trực tiếp từ máy chủ ZaloPay (/v2/query) & tự động kích hoạt vé nếu đã thanh toán")
    public ResponseEntity<ApiResponse<ZaloPayQueryStatusResponseDTO>> queryZaloPayOrder(
            @PathVariable String appTransId) {
        ZaloPayQueryStatusResponseDTO result = paymentService.queryZaloPayStatus(appTransId);
        String msg = (result.getReturnCode() != null && result.getReturnCode() == 1)
                ? "Giao dịch ZaloPay đã thanh toán thành công! Đơn vé đã chuyển sang PAID."
                : "Trạng thái từ ZaloPay: " + result.getReturnMessage();
        return ResponseEntity.ok(ApiResponse.success(result, msg));
    }

    @PostMapping("/payments/zalopay/callback")
    @Operation(summary = "Webhook Callback nhận thông báo kết quả thanh toán tự động từ ZaloPay Server (xác thực chữ ký key2)")
    public ResponseEntity<Map<String, Object>> zaloPayCallback(
            @RequestBody ZaloPayCallbackRequestDTO callbackDto) {
        Map<String, Object> response = paymentService.handleZaloPayCallback(callbackDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/payments/zalopay/return", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Trang đích (Redirect URL) tự động hứng kết quả khi khách hàng thanh toán xong trên ZaloPay Gateway và hiển thị vé QR")
    public ResponseEntity<String> zaloPayReturn(@RequestParam Map<String, String> params) {
        String html = paymentService.handleZaloPayReturnHtml(params);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("text/html;charset=UTF-8"))
                .body(html);
    }

    // =========================================================================
    // 2. THANH TOÁN TRỰC TIẾP / GIẢ LẬP ĐA CỔNG & HOÀN TIỀN, ĐIỂM THƯỞNG
    // =========================================================================

    @PostMapping("/payments/process")
    @Operation(summary = "Xử lý thanh toán đơn đặt vé (giả lập nhanh), xác nhận vé điện tử và tự động cộng điểm thưởng thành viên (Loyalty)")
    public ResponseEntity<ApiResponse<PaymentAttemptResponseDTO>> processPayment(
            @Valid @RequestBody PaymentRequestDTO dto) {
        PaymentAttemptResponseDTO result = paymentService.processPayment(dto);
        String msg = "success".equalsIgnoreCase(result.getStatus())
                ? "Thanh toán đơn đặt vé thành công! Đã cộng +" + result.getLoyaltyPointsEarned() + " điểm thưởng"
                : "Giao dịch thanh toán thất bại: " + result.getErrorMessage();
        return ResponseEntity.ok(ApiResponse.success(result, msg));
    }

    @GetMapping("/payments/booking/{bookingId}")
    @Operation(summary = "Xem lịch sử các lần giao dịch thanh toán của một đơn đặt vé")
    public ResponseEntity<ApiResponse<List<PaymentAttemptResponseDTO>>> getPaymentsByBooking(
            @PathVariable Long bookingId) {
        List<PaymentAttemptResponseDTO> list = paymentService.getPaymentAttemptsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử giao dịch thanh toán thành công"));
    }

    @PostMapping("/refunds")
    @Operation(summary = "Tạo yêu cầu hủy vé và hoàn tiền (cho đơn hàng đã thanh toán)")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> requestRefund(
            @Valid @RequestBody RefundRequestDTO dto) {
        RefundResponseDTO result = paymentService.requestRefund(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Gửi yêu cầu hoàn tiền thành công"));
    }

    @PutMapping("/refunds/{id}/process")
    @Operation(summary = "Duyệt hoặc từ chối yêu cầu hoàn tiền (tự động hủy vé, giải phóng ghế & thu hồi điểm thưởng nếu duyệt)")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> processRefund(
            @PathVariable Long id,
            @Valid @RequestBody RefundProcessRequestDTO dto) {
        RefundResponseDTO result = paymentService.processRefund(id, dto);
        String msg = "processed".equalsIgnoreCase(result.getStatus())
                ? "Phê duyệt hoàn tiền và hủy vé thành công"
                : "Đã từ chối yêu cầu hoàn tiền";
        return ResponseEntity.ok(ApiResponse.success(result, msg));
    }

    @GetMapping("/refunds")
    @Operation(summary = "Lấy danh sách các yêu cầu hoàn tiền (có thể lọc theo status: pending, processed, rejected)")
    public ResponseEntity<ApiResponse<List<RefundResponseDTO>>> getAllRefunds(
            @RequestParam(required = false) String status) {
        List<RefundResponseDTO> list = paymentService.getAllRefunds(status);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách yêu cầu hoàn tiền thành công"));
    }

    @GetMapping("/refunds/booking/{bookingId}")
    @Operation(summary = "Xem danh sách yêu cầu hoàn tiền theo ID đơn đặt vé")
    public ResponseEntity<ApiResponse<List<RefundResponseDTO>>> getRefundsByBooking(
            @PathVariable Long bookingId) {
        List<RefundResponseDTO> list = paymentService.getRefundsByBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy thông tin hoàn tiền của đơn đặt vé thành công"));
    }

    @GetMapping("/loyalty-transactions/user/{userId}")
    @Operation(summary = "Xem lịch sử tích lũy / sử dụng điểm thưởng (Loyalty Transactions) của khách hàng")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponseDTO>>> getLoyaltyByUser(
            @PathVariable Long userId) {
        List<LoyaltyTransactionResponseDTO> list = paymentService.getLoyaltyTransactionsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử điểm thưởng thành viên thành công"));
    }
}
