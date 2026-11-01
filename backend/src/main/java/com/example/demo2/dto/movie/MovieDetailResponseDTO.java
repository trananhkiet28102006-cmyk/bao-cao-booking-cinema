package com.example.demo2.dto.movie;

import com.example.demo2.dto.genre.GenreResponseDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDetailResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private String ageRating;
    private String language;
    private String trailerUrl;
    private String posterUrl;
    private String status;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private String director;
    private List<GenreResponseDTO> genres;
    private List<MovieCastResponseDTO> casts;
    private LocalDateTime createdAt;
}
