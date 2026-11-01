package com.example.demo2.dto.moviecast;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieCastResponseDTO {
    private Long id;
    private Long movieId;
    private String roleType;
    private String personName;
    private String characterName;
    private Integer displayOrder;
}
