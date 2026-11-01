package com.example.demo2.dto.cinemaroom;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaRoomRequestDTO {
    @NotBlank(message = "Tên phòng chiếu không được để trống")
    private String name;

    private String roomType; // 2D, 3D, IMAX, 4DX

    private Integer totalSeats;

    private String status; // active, maintenance, closed
}
