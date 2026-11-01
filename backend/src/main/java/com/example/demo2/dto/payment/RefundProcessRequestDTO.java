package com.example.demo2.dto.payment;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundProcessRequestDTO {

    @Schema(description = "ID Quản trị viên phê duyệt yêu cầu hoàn tiền", example = "1")
    private Long approvedBy;

    @NotNull(message = "Quyết định phê duyệt (approve) không được để trống")
    @Schema(description = "true = Phê duyệt hoàn tiền & hủy vé, false = Từ chối yêu cầu", example = "true")
    private Boolean approve;

    @Schema(description = "Ghi chú xử lý của Quản trị viên", example = "Đã kiểm tra hợp lệ, hoàn tiền 100% qua ví VNPAY")
    private String note;
}
