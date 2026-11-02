package com.example.demo2.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRedeemResponseDTO {
    private Long couponId;
    private String code;
    private Integer pointsSpent;
    private Integer newBalance;
    private String message;
}
