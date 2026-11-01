package com.example.demo2.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransactionResponseDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String memberTier;
    private Long bookingId;
    private String bookingCode;
    private String type;
    private Integer points;
    private Integer balanceAfter;
    private String description;
    private LocalDateTime createdAt;
}
