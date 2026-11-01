package com.example.demo2.dto.holiday;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayResponseDTO {
    private Long id;
    private LocalDate holidayDate;
    private String name;
    private String type;
    private LocalDateTime createdAt;
}
