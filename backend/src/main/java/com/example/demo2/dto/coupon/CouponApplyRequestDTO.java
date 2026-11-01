package com.example.demo2.dto.coupon;

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
public class CouponApplyRequestDTO {

    @NotBlank(message = "Mã giảm giá không được để trống")
    @Schema(description = "Mã giảm giá cần kiểm tra", example = "CINEMA20")
    private String code;

    @NotNull(message = "Tổng tiền đơn hàng không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Tổng tiền đơn hàng phải lớn hơn 0")
    @Schema(description = "Tạm tính đơn hàng (vé + bắp nước) trước giảm giá", example = "250000.00")
    private BigDecimal orderAmount;

    @Schema(description = "ID khách hàng (tùy chọn để kiểm tra giới hạn lượt dùng mỗi người)", example = "2")
    private Long userId;
}
