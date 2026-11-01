package com.example.demo2.dto.genre;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenreResponseDTO {
    private Long id;
    private String name;
    private String slug;
    private LocalDateTime createdAt;
}
