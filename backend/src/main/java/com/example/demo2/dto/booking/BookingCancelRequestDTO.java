package com.example.demo2.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancelRequestDTO {

    @Schema(description = "Lý do hủy đơn đặt vé", example = "Khách hàng thay đổi lịch trình cá nhân")
    private String reason;

    @Builder.Default
    @Schema(description = "Người thực hiện hủy: CUSTOMER, ADMIN, SYSTEM", example = "CUSTOMER")
    private String changedBy = "CUSTOMER";
}
