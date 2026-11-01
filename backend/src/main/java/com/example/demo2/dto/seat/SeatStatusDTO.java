package com.example.demo2.dto.seat;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusDTO {

    private Long seatId;
    private String seatNumber;
    private String rowName;
    private Integer rowIndex;
    private Integer colIndex;
    private String seatType;
    private String status; // AVAILABLE, BOOKED
    private BigDecimal price;
}
