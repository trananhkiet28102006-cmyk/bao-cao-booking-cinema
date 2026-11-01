package com.example.demo2.dto.fnb;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FnbItemResponseDTO {

    private Long id;
    private String itemName;
    private String category;
    private String description;
    private String imageUrl;
    private BigDecimal basePrice;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
