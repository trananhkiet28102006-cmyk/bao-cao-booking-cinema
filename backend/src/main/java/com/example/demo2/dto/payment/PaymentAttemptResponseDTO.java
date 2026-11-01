package com.example.demo2.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAttemptResponseDTO {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private String bookingStatus;
    private String paymentStatus;
    private String paymentMethod;
    private String transactionId;
    private BigDecimal amount;
    private String status;
    private String errorCode;
    private String errorMessage;
    private String gatewayResponse;
    private Integer loyaltyPointsEarned;
    private Integer totalLoyaltyPoints;
    private String memberTier;
    private LocalDateTime createdAt;
}
