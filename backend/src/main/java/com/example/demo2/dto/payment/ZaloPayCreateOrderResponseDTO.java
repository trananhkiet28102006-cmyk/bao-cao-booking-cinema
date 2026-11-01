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
public class ZaloPayCreateOrderResponseDTO {
    private Long paymentAttemptId;
    private Long bookingId;
    private String bookingCode;
    private String appTransId;
    private BigDecimal amount;
    private Integer returnCode;
    private String returnMessage;
    private Integer subReturnCode;
    private String subReturnMessage;
    private String orderUrl;
    private String zpTransToken;
    private String orderToken;
    private String qrCode;
    private String status;
    private LocalDateTime createdAt;
}
