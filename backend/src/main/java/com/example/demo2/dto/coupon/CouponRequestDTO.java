package com.example.demo2.dto.coupon;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequestDTO {

    @NotBlank(message = "Mã giảm giá không được để trống")
    @Schema(description = "Mã coupon viết hoa", example = "CINEMA20")
    private String code;

    @NotBlank(message = "Loại giảm giá không được để trống (percentage hoặc fixed_amount)")
    @Schema(description = "Loại giảm giá: percentage (phần trăm) hoặc fixed_amount (số tiền cố định)", example = "percentage")
    private String type;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    @Schema(description = "Giá trị giảm (% hoặc VNĐ)", example = "20.00")
    private BigDecimal value;

    @Schema(description = "Giá trị đơn hàng tối thiểu để áp dụng", example = "100000.00")
    private BigDecimal minOrderAmount;

    @Schema(description = "Số tiền giảm tối đa (áp dụng cho loại percentage)", example = "50000.00")
    private BigDecimal maxDiscount;

    @Min(value = 1, message = "Giới hạn lượt dùng phải >= 1")
    @Schema(description = "Tổng số lượt sử dụng tối đa của mã", example = "100")
    private Integer usageLimit;

    @Min(value = 1, message = "Giới hạn mỗi khách hàng phải >= 1")
    @Builder.Default
    @Schema(description = "Số lần sử dụng tối đa cho mỗi khách hàng", example = "1")
    private Integer perUserLimit = 1;

    @Schema(description = "Thời gian bắt đầu hiệu lực", example = "2026-01-01T00:00:00")
    private LocalDateTime validFrom;

    @Schema(description = "Thời gian hết hạn hiệu lực", example = "2026-12-31T23:59:59")
    private LocalDateTime validTo;

    @Builder.Default
    @Schema(description = "Trạng thái: active, expired, disabled", example = "active")
    private String status = "active";
}
