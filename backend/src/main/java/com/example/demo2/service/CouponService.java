package com.example.demo2.service;

import com.example.demo2.dto.coupon.CouponApplyRequestDTO;
import com.example.demo2.dto.coupon.CouponCalculationResponseDTO;
import com.example.demo2.dto.coupon.CouponRequestDTO;
import com.example.demo2.dto.coupon.CouponResponseDTO;

import java.util.List;

public interface CouponService {

    CouponResponseDTO createCoupon(CouponRequestDTO dto);

    CouponResponseDTO updateCoupon(Long id, CouponRequestDTO dto);

    CouponResponseDTO getCouponById(Long id);

    CouponResponseDTO getCouponByCode(String code);

    List<CouponResponseDTO> getAllCoupons(Boolean activeOnly);

    void deleteCoupon(Long id);

    CouponCalculationResponseDTO validateAndCalculateDiscount(CouponApplyRequestDTO dto);
}
