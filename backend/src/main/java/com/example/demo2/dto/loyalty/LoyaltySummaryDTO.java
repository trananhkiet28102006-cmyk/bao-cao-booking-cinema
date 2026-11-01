package com.example.demo2.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltySummaryDTO {
    private Integer currentPoints;
    private String memberTier;
    private List<LoyaltyTransactionResponseDTO> recentTransactions;
}
