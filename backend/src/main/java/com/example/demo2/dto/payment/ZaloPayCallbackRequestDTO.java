package com.example.demo2.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZaloPayCallbackRequestDTO {
    private String data;
    private String mac;
    private Integer type;
}
