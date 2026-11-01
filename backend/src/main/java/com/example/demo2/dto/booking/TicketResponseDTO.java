package com.example.demo2.dto.booking;

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
public class TicketResponseDTO {
    private Long id;
    private String ticketCode;
    private Long seatId;
    private String seatCode;
    private String seatType;
    private BigDecimal finalPrice;
    private Long priceRuleId;
    private String qrCodeUrl;
    private String checkinStatus;
    private LocalDateTime checkinAt;
    private LocalDateTime createdAt;
}
