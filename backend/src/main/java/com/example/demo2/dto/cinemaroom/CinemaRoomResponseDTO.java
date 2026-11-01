package com.example.demo2.dto.cinemaroom;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaRoomResponseDTO {
    private Long id;
    private Long cinemaId;
    private String name;
    private String roomType;
    private Integer totalSeats;
    private String status;
    private LocalDateTime createdAt;
}
