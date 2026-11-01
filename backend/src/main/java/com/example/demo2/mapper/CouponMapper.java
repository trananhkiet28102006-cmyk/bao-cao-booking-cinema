package com.example.demo2.mapper;

import com.example.demo2.dto.coupon.CouponRequestDTO;
import com.example.demo2.dto.coupon.CouponResponseDTO;
import com.example.demo2.entity.Coupon;

import java.math.BigDecimal;

public class CouponMapper {

    public static Coupon toEntity(CouponRequestDTO dto) {
        if (dto == null) return null;
        return Coupon.builder()
                .code(dto.getCode() != null ? dto.getCode().trim().toUpperCase() : null)
                .type(dto.getType() != null ? dto.getType().trim().toLowerCase() : "percentage")
                .value(dto.getValue())
                .minOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscount(dto.getMaxDiscount())
                .usageLimit(dto.getUsageLimit())
                .usedCount(0)
                .perUserLimit(dto.getPerUserLimit() != null ? dto.getPerUserLimit() : 1)
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .status(dto.getStatus() != null ? dto.getStatus().trim().toLowerCase() : "active")
                .build();
    }

    public static void updateEntity(Coupon coupon, CouponRequestDTO dto) {
        if (coupon == null || dto == null) return;
        if (dto.getCode() != null) {
            coupon.setCode(dto.getCode().trim().toUpperCase());
        }
        if (dto.getType() != null) {
            coupon.setType(dto.getType().trim().toLowerCase());
        }
        coupon.setValue(dto.getValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscount(dto.getMaxDiscount());
        coupon.setUsageLimit(dto.getUsageLimit());
        if (dto.getPerUserLimit() != null) {
            coupon.setPerUserLimit(dto.getPerUserLimit());
        }
        coupon.setValidFrom(dto.getValidFrom());
        coupon.setValidTo(dto.getValidTo());
        if (dto.getStatus() != null) {
            coupon.setStatus(dto.getStatus().trim().toLowerCase());
        }
    }

    public static CouponResponseDTO toResponseDTO(Coupon coupon) {
        if (coupon == null) return null;
        return CouponResponseDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscount(coupon.getMaxDiscount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .perUserLimit(coupon.getPerUserLimit())
                .validFrom(coupon.getValidFrom())
                .validTo(coupon.getValidTo())
                .status(coupon.getStatus())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
