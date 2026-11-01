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
public class RefundResponseDTO {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private Long approvedBy;
    private String refundType;
    private BigDecimal refundAmount;
    private String refundMethod;
    private String transactionId;
    private String reason;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
