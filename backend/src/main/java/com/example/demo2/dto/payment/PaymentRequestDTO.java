package com.example.demo2.dto.payment;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {

    @NotNull(message = "ID đơn đặt vé không được để trống")
    @Schema(description = "ID đơn đặt vé cần thanh toán", example = "1")
    private Long bookingId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Schema(description = "Cổng thanh toán: VNPAY, MOMO, ZALOPAY, CREDIT_CARD, CASH", example = "VNPAY")
    private String paymentMethod;

    @Builder.Default
    @Schema(description = "Giả lập kết quả từ cổng thanh toán (true: thành công, false: thất bại)", example = "true")
    private Boolean simulateSuccess = true;

    @Schema(description = "Mã lỗi từ cổng thanh toán (nếu simulateSuccess = false)", example = "ERR_INSUFFICIENT_BALANCE")
    private String errorCode;

    @Schema(description = "Thông báo lỗi từ cổng thanh toán (nếu simulateSuccess = false)", example = "Số dư tài khoản không đủ để thực hiện giao dịch")
    private String errorMessage;
}
