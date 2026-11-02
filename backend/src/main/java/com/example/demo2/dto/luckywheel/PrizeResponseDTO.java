package com.example.demo2.dto.luckywheel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrizeResponseDTO {
    private Long id;
    private String name;
    private String prizeType;
    private Integer prizeValue;
    private Integer probabilityWeight;
    private String color;
    private String icon;
    private Integer slotIndex;
}
