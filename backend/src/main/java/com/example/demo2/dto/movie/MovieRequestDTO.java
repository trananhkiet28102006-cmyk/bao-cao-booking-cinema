package com.example.demo2.dto.movie;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieRequestDTO {
    @NotBlank(message = "Tiêu đề phim không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Thời lượng phim không được để trống")
    @Min(value = 1, message = "Thời lượng phim phải lớn hơn 0")
    private Integer durationMinutes;

    private String ageRating; // P, C13, C16, C18

    private String language;

    private String trailerUrl;

    private String posterUrl;

    private String status; // coming_soon, now_showing, ended

    private LocalDate releaseDate;

    private LocalDate endDate;

    private String director;

    private List<Long> genreIds;
}
