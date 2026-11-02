package com.example.demo2.dto.luckywheel;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpinHistoryDTO {
    private Long id;
    private String prizeName;
    private String prizeType;
    private Integer pointsSpent;
    private Integer pointsRewarded;
    private String couponCode;
    private LocalDateTime createdAt;
}
