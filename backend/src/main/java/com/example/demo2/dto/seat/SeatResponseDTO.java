package com.example.demo2.dto.seat;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponseDTO {

    private Long id;
    private Long roomId;
    private String roomName;
    private String seatNumber;
    private String seatType;
    private Integer rowIndex;
    private Integer colIndex;
    private LocalDateTime createdAt;
}
