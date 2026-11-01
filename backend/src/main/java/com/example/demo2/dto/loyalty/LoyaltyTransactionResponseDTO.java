package com.example.demo2.dto.loyalty;

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
    private String type; // earn, redeem, expire
    private Integer points;
    private Integer balanceAfter;
    private String description;
    private Long bookingId;
    private String bookingCode;
    private LocalDateTime createdAt;
}
