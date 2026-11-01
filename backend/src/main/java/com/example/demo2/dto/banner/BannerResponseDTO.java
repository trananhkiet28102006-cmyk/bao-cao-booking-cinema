package com.example.demo2.dto.banner;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponseDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String targetType;
    private Long targetId;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}
