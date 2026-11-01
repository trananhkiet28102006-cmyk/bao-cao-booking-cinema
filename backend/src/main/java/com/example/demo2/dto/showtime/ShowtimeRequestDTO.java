package com.example.demo2.dto.showtime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeRequestDTO {

    @NotNull(message = "ID phim không được để trống")
    @Schema(description = "ID của phim", example = "1")
    private Long movieId;

    @NotNull(message = "ID phòng chiếu không được để trống")
    @Schema(description = "ID của phòng chiếu", example = "1")
    private Long roomId;

    @NotNull(message = "Ngày chiếu không được để trống")
    @Schema(description = "Ngày chiếu (yyyy-MM-dd)", example = "2026-10-20")
    private LocalDate showDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @Schema(description = "Giờ bắt đầu chiếu (HH:mm:ss)", example = "19:30:00")
    private LocalTime startTime;

    @Schema(description = "Định dạng phòng chiếu (2D, 3D, IMAX)", example = "2D")
    private String screenFormat;

    @Schema(description = "Trạng thái (scheduled, open, finished, cancelled)", example = "scheduled")
    private String status;
}
