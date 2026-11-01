package com.example.demo2.dto.seat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatGenerateRequestDTO {

    @NotNull(message = "Số hàng không được để trống")
    @Min(value = 1, message = "Số hàng tối thiểu là 1")
    @Max(value = 26, message = "Số hàng tối đa là 26 (từ A đến Z)")
    @Schema(description = "Số hàng ghế (tương ứng từ A, B, C...)", example = "8")
    private Integer numRows;

    @NotNull(message = "Số cột không được để trống")
    @Min(value = 1, message = "Số cột tối thiểu là 1")
    @Max(value = 30, message = "Số cột tối đa là 30")
    @Schema(description = "Số ghế trên mỗi hàng", example = "10")
    private Integer numCols;

    @Schema(description = "Danh sách tên hàng ghế VIP (ví dụ: ['D', 'E', 'F'])", example = "[\"D\", \"E\", \"F\"]")
    private List<String> vipRows;

    @Schema(description = "Danh sách tên hàng ghế Couple (ví dụ: ['H'])", example = "[\"H\"]")
    private List<String> coupleRows;

    @Builder.Default
    @Schema(description = "Xóa ghế cũ của phòng trước khi sinh mới (true/false)", example = "true")
    private Boolean clearExisting = true;
}
