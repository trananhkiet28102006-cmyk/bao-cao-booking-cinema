package com.example.demo2.dto.favorite;

import com.example.demo2.dto.movie.MovieResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponseDTO {
    private Long id;
    private Long userId;
    private MovieResponseDTO movie;
    private LocalDateTime createdAt;
}
