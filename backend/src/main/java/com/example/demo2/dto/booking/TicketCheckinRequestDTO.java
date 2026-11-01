package com.example.demo2.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCheckinRequestDTO {

    @NotBlank(message = "Mã vé (ticketCode) không được để trống")
    @Schema(description = "Mã vé điện tử hoặc mã quét từ QR Code", example = "TK-100001-B05")
    private String ticketCode;

    @Schema(description = "ID cụm rạp tại quầy soát vé (tùy chọn để chặn vé khác rạp)", example = "1")
    private Long cinemaId;

    @Schema(description = "ID suất chiếu tại phòng soát vé (tùy chọn để chặn vé khác suất chiếu)", example = "1")
    private Long showtimeId;
}
