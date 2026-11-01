package com.example.demo2.service.impl;

import com.example.demo2.dto.coupon.CouponApplyRequestDTO;
import com.example.demo2.dto.coupon.CouponCalculationResponseDTO;
import com.example.demo2.dto.coupon.CouponRequestDTO;
import com.example.demo2.dto.coupon.CouponResponseDTO;
import com.example.demo2.entity.Coupon;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.CouponMapper;
import com.example.demo2.repository.BookingRepository;
import com.example.demo2.repository.CouponRepository;
import com.example.demo2.security.CustomUserDetails;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public CouponResponseDTO createCoupon(CouponRequestDTO dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Coupon", "code", code);
        }
        validateCouponTypeAndDates(dto);

        Coupon coupon = CouponMapper.toEntity(dto);
        Coupon saved = couponRepository.save(coupon);
        return CouponMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public CouponResponseDTO updateCoupon(Long id, CouponRequestDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        String newCode = dto.getCode().trim().toUpperCase();
        if (!coupon.getCode().equalsIgnoreCase(newCode) && couponRepository.existsByCodeIgnoreCase(newCode)) {
            throw new DuplicateResourceException("Coupon", "code", newCode);
        }
        validateCouponTypeAndDates(dto);

        CouponMapper.updateEntity(coupon, dto);
        Coupon updated = couponRepository.save(coupon);
        return CouponMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponseDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        return CouponMapper.toResponseDTO(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponseDTO getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));
        return CouponMapper.toResponseDTO(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponseDTO> getAllCoupons(Boolean activeOnly) {
        List<Coupon> coupons = Boolean.TRUE.equals(activeOnly)
                ? couponRepository.findByStatusOrderByCreatedAtDesc("active")
                : couponRepository.findAll();
        return coupons.stream()
                .map(CouponMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponCalculationResponseDTO validateAndCalculateDiscount(CouponApplyRequestDTO dto) {
        String code = dto.getCode().trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));

        LocalDateTime now = LocalDateTime.now();

        if (!"active".equalsIgnoreCase(coupon.getStatus())) {
            throw new BadRequestException("Mã giảm giá '" + code + "' hiện không còn hoạt động (status: " + coupon.getStatus() + ")");
        }

        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new BadRequestException("Mã giảm giá '" + code + "' chưa đến thời gian có hiệu lực");
        }

        if (coupon.getValidTo() != null && now.isAfter(coupon.getValidTo())) {
            throw new BadRequestException("Mã giảm giá '" + code + "' đã hết hạn sử dụng");
        }

        int usedCount = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
        if (coupon.getUsageLimit() != null && usedCount >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá '" + code + "' đã hết lượt sử dụng tối đa (" + coupon.getUsageLimit() + " lượt)");
        }

        BigDecimal orderAmount = dto.getOrderAmount();
        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException(String.format(
                    "Đơn hàng tối thiểu phải đạt %s VNĐ để áp dụng mã '%s' (hiện tại: %s VNĐ)",
                    coupon.getMinOrderAmount().toPlainString(), code, orderAmount.toPlainString()));
        }

        // Lấy userId từ DTO hoặc từ SecurityContext của người đang đăng nhập
        Long resolvedUserId = dto.getUserId();
        if (resolvedUserId == null) {
            resolvedUserId = SecurityUtils.findCurrentUser().map(CustomUserDetails::getId).orElse(null);
        }

        if (resolvedUserId != null && coupon.getPerUserLimit() != null) {
            long userUsed = bookingRepository.countByUserIdAndCouponIdAndStatusNot(
                    resolvedUserId, coupon.getId(), "cancelled");
            if (userUsed >= coupon.getPerUserLimit()) {
                throw new BadRequestException("Bạn đã sử dụng hết số lượt cho phép của mã '" + code + "' (" + coupon.getPerUserLimit() + " lần/người)");
            }
        }

        BigDecimal discountAmount;
        if ("percentage".equalsIgnoreCase(coupon.getType())) {
            discountAmount = orderAmount.multiply(coupon.getValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0
                    && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
                discountAmount = coupon.getMaxDiscount();
            }
        } else {
            discountAmount = coupon.getValue();
        }

        if (discountAmount.compareTo(orderAmount) > 0) {
            discountAmount = orderAmount;
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount);

        return CouponCalculationResponseDTO.builder()
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .orderAmount(orderAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .valid(true)
                .message(String.format("Áp dụng mã '%s' thành công: Giảm %s VNĐ", coupon.getCode(), discountAmount.toPlainString()))
                .build();
    }

    private void validateCouponTypeAndDates(CouponRequestDTO dto) {
        String type = dto.getType().trim().toLowerCase();
        if (!"percentage".equals(type) && !"fixed_amount".equals(type)) {
            throw new BadRequestException("Loại mã giảm giá chỉ nhận 'percentage' hoặc 'fixed_amount'");
        }
        if ("percentage".equals(type) && dto.getValue().compareTo(new BigDecimal("100")) > 0) {
            throw new BadRequestException("Phần trăm giảm giá không được vượt quá 100%");
        }
        if (dto.getValidFrom() != null && dto.getValidTo() != null && dto.getValidTo().isBefore(dto.getValidFrom())) {
            throw new BadRequestException("Thời gian kết thúc hiệu lực phải sau thời gian bắt đầu");
        }
    }
}
