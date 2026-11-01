package com.example.demo2.dto.seat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatRequestDTO {

    @NotBlank(message = "Số ghế không được để trống (vd: A01)")
    @Schema(description = "Số ghế", example = "A01")
    private String seatNumber;

    @Schema(description = "Loại ghế (standard, vip, couple)", example = "standard")
    private String seatType;

    @NotNull(message = "Chỉ số hàng không được để trống")
    @Schema(description = "Chỉ số hàng (1, 2, ...)", example = "1")
    private Integer rowIndex;

    @NotNull(message = "Chỉ số cột không được để trống")
    @Schema(description = "Chỉ số cột (1, 2, ...)", example = "1")
    private Integer colIndex;
}
