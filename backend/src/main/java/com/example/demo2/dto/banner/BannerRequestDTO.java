package com.example.demo2.dto.banner;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerRequestDTO {
    private String title;

    @NotBlank(message = "URL hình ảnh banner không được để trống")
    private String imageUrl;

    private String linkUrl;

    private String targetType; // movie, event, url

    private Long targetId;

    private Integer displayOrder;

    private Boolean isActive;

    private LocalDate startDate;

    private LocalDate endDate;
}
