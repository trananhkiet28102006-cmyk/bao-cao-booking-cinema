package com.example.demo2.dto.payment;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequestDTO {

    @NotNull(message = "ID đơn đặt vé không được để trống")
    @Schema(description = "ID đơn đặt vé yêu cầu hoàn tiền", example = "1")
    private Long bookingId;

    @Builder.Default
    @Schema(description = "Loại hoàn tiền: full (toàn phần) hoặc partial (một phần)", example = "full")
    private String refundType = "full";

    @DecimalMin(value = "0.01", message = "Số tiền hoàn phải lớn hơn 0")
    @Schema(description = "Số tiền yêu cầu hoàn (bỏ trống sẽ tự động lấy toàn bộ số tiền đơn hàng)", example = "180000.00")
    private BigDecimal refundAmount;

    @Builder.Default
    @Schema(description = "Phương thức nhận tiền hoàn: VNPAY, MOMO, BANK_TRANSFER", example = "VNPAY")
    private String refundMethod = "VNPAY";

    @NotBlank(message = "Lý do yêu cầu hoàn tiền không được để trống")
    @Schema(description = "Lý do khách hàng yêu cầu hủy vé / hoàn tiền", example = "Bận công tác đột xuất không thể tham dự suất chiếu")
    private String reason;
}
