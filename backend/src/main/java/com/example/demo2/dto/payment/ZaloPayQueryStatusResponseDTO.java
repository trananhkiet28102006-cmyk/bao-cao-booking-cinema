package com.example.demo2.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZaloPayQueryStatusResponseDTO {
    private Long bookingId;
    private String bookingCode;
    private String bookingStatus;
    private String paymentStatus;
    private String appTransId;
    private Long zpTransId;
    private BigDecimal amount;
    private Integer returnCode;
    private String returnMessage;
    private Integer subReturnCode;
    private String subReturnMessage;
    private Boolean isProcessing;
    private Integer loyaltyPointsEarned;
    private Integer totalLoyaltyPoints;
    private String memberTier;
}
