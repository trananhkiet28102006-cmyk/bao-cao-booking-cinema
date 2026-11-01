package com.example.demo2.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingFnbItemRequestDTO {

    @NotNull(message = "ID món bắp nước không được để trống")
    @Schema(description = "ID món bắp nước/combo", example = "1")
    private Long fnbItemId;

    @NotNull(message = "Số lượng bắp nước không được để trống")
    @Min(value = 1, message = "Số lượng bắp nước tối thiểu là 1")
    @Schema(description = "Số lượng đặt mua", example = "2")
    private Integer quantity;
}
