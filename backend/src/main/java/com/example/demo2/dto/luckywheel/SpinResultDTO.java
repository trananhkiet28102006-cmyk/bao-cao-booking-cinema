package com.example.demo2.dto.luckywheel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpinResultDTO {
    private Integer slotIndex;
    private String prizeName;
    private String prizeType;
    private Integer prizeValue;
    private Integer pointsSpent;
    private Integer pointsRewarded;
    private String couponCode;
    private Integer newBalance;
    private String message;
}
