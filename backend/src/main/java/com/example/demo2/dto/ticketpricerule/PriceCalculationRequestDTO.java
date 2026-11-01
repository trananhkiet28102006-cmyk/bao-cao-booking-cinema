package com.example.demo2.dto.ticketpricerule;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationRequestDTO {

    @NotNull(message = "ID suất chiếu không được để trống")
    @Schema(description = "ID suất chiếu", example = "1")
    private Long showtimeId;

    @Schema(description = "Loại ghế (standard, vip, couple). Mặc định là standard.", example = "vip")
    private String seatType;

    @Schema(description = "Đối tượng khách hàng (adult, student, child). Mặc định là adult.", example = "adult")
    private String customerType;
}
