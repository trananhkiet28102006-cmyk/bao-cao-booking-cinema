package com.example.demo2.dto.moviecast;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieCastRequestDTO {
    private String roleType; // actor, director, producer

    @NotBlank(message = "Tên diễn viên/đạo diễn không được để trống")
    private String personName;

    private String characterName;

    private Integer displayOrder;
}
