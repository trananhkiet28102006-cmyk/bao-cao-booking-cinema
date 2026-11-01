package com.example.demo2.dto.showtime;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponseDTO {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private Integer movieDurationMinutes;
    private String moviePosterUrl;
    private String movieAgeRating;

    private Long roomId;
    private String roomName;
    private String roomType;

    private Long cinemaId;
    private String cinemaName;
    private String cinemaCity;

    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime estimatedEndTime;
    private String screenFormat;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
