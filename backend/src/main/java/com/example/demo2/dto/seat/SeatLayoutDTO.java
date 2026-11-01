package com.example.demo2.dto.seat;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutDTO {

    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private Long roomId;
    private String roomName;
    private String roomType;
    private Long cinemaId;
    private String cinemaName;

    private LocalDate showDate;
    private LocalTime startTime;

    private Integer totalSeats;
    private Integer availableSeats;
    private Integer bookedSeats;

    private List<SeatStatusDTO> seats;
}
