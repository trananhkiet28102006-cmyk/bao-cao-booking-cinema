package com.example.demo2.dto.ticketpricerule;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketPriceRuleResponseDTO {

    private Long id;
    private Long cinemaId;
    private String cinemaName;
    private String screenType;
    private String seatType;
    private String dayType;
    private String timeSlot;
    private String customerType;
    private BigDecimal price;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
