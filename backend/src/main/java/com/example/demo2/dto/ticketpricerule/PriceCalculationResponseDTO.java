package com.example.demo2.dto.ticketpricerule;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceCalculationResponseDTO {

    private Long showtimeId;
    private String movieTitle;
    private String screenType;
    private String seatType;
    private String customerType;
    private String dayType;
    private String timeSlot;
    private BigDecimal finalPrice;
    private Long appliedRuleId;
    private String message;
}
