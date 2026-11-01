package com.example.demo2.dto.holiday;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayRequestDTO {
    @NotNull(message = "Ngày lễ không được để trống")
    private LocalDate holidayDate;

    @NotBlank(message = "Tên ngày lễ không được để trống")
    private String name;

    private String type;
}
