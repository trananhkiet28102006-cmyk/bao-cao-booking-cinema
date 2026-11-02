package com.example.demo2.service.impl;

import com.example.demo2.dto.luckywheel.PrizeResponseDTO;
import com.example.demo2.dto.luckywheel.SpinHistoryDTO;
import com.example.demo2.dto.luckywheel.SpinResultDTO;
import com.example.demo2.entity.Coupon;
import com.example.demo2.entity.LoyaltyTransaction;
import com.example.demo2.entity.LuckyWheelPrize;
import com.example.demo2.entity.SpinHistory;
import com.example.demo2.entity.User;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.repository.CouponRepository;
import com.example.demo2.repository.LoyaltyTransactionRepository;
import com.example.demo2.repository.LuckyWheelPrizeRepository;
import com.example.demo2.repository.SpinHistoryRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.LuckyWheelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LuckyWheelServiceImpl implements LuckyWheelService {

    public static final int SPIN_COST = 200; // Tiêu hao 200 điểm 1 lần

    private final LuckyWheelPrizeRepository prizeRepository;
    private final SpinHistoryRepository spinHistoryRepository;
    private final UserRepository userRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final CouponRepository couponRepository;

    private final Random random = new Random();

    @Override
    @Transactional(readOnly = true)
    public List<PrizeResponseDTO> getPrizes() {
        return prizeRepository.findByIsActiveTrueOrderBySlotIndexAsc().stream()
                .map(p -> PrizeResponseDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .prizeType(p.getPrizeType())
                        .prizeValue(p.getPrizeValue())
                        .probabilityWeight(p.getProbabilityWeight())
                        .color(p.getColor())
                        .icon(p.getIcon())
                        .slotIndex(p.getSlotIndex())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SpinResultDTO spinWheel() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", currentUserId));

        // 1. Kiểm tra số dư điểm (yêu cầu ít nhất 200 điểm)
        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        if (currentPoints < SPIN_COST) {
            throw new BadRequestException("Bạn không đủ điểm thưởng! Mỗi lượt quay cần " + SPIN_COST + " điểm CineClub (hiện có: " + currentPoints + " điểm).");
        }

        // 2. Trừ phí quay (200 điểm)
        int balanceAfterDeduct = currentPoints - SPIN_COST;
        user.setLoyaltyPoints(balanceAfterDeduct);

        loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                .user(user)
                .type("redeem")
                .points(-SPIN_COST)
                .balanceAfter(balanceAfterDeduct)
                .description("Vòng Quay May Mắn CineWheel (-" + SPIN_COST + " điểm)")
                .build());

        // 3. Lấy danh sách giải thưởng
        List<LuckyWheelPrize> prizes = prizeRepository.findByIsActiveTrueOrderBySlotIndexAsc();
        if (prizes.isEmpty()) {
            throw new BadRequestException("Hệ thống vòng quay đang bảo trì, vui lòng thử lại sau!");
        }

        // 4. Thuật toán quay số theo trọng số (Weighted Random Algorithm)
        int totalWeight = prizes.stream().mapToInt(LuckyWheelPrize::getProbabilityWeight).sum();
        int randomVal = random.nextInt(totalWeight);
        int runningWeight = 0;
        LuckyWheelPrize wonPrize = prizes.get(0);

        for (LuckyWheelPrize prize : prizes) {
            runningWeight += prize.getProbabilityWeight();
            if (randomVal < runningWeight) {
                wonPrize = prize;
                break;
            }
        }

        // 5. Xử lý phần thưởng
        int pointsRewarded = 0;
        String couponCode = null;
        String message = wonPrize.getName();

        if ("POINTS".equalsIgnoreCase(wonPrize.getPrizeType())) {
            pointsRewarded = wonPrize.getPrizeValue() != null ? wonPrize.getPrizeValue() : 0;
            if (pointsRewarded > 0) {
                int finalBalance = user.getLoyaltyPoints() + pointsRewarded;
                user.setLoyaltyPoints(finalBalance);

                loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                        .user(user)
                        .type("earn")
                        .points(pointsRewarded)
                        .balanceAfter(finalBalance)
                        .description("Trúng thưởng Vòng Quay May Mắn (+" + pointsRewarded + " điểm)")
                        .build());
            }
        } else if ("COUPON".equalsIgnoreCase(wonPrize.getPrizeType())) {
            int couponVal = wonPrize.getPrizeValue() != null ? wonPrize.getPrizeValue() : 20000;
            couponCode = "CINE" + (couponVal / 1000) + "K-" + (System.currentTimeMillis() % 100000);
            Coupon coupon = Coupon.builder()
                    .code(couponCode)
                    .type("fixed_amount")
                    .value(BigDecimal.valueOf(couponVal))
                    .minOrderAmount(BigDecimal.valueOf(50000))
                    .maxDiscount(BigDecimal.valueOf(couponVal))
                    .usageLimit(1)
                    .usedCount(0)
                    .perUserLimit(1)
                    .validFrom(LocalDateTime.now())
                    .validTo(LocalDateTime.now().plusDays(30))
                    .status("active")
                    .build();
            couponRepository.save(coupon);
        } else if ("FNB".equalsIgnoreCase(wonPrize.getPrizeType())) {
            couponCode = "POPCORN-" + (System.currentTimeMillis() % 100000);
            Coupon coupon = Coupon.builder()
                    .code(couponCode)
                    .type("fixed_amount")
                    .value(BigDecimal.valueOf(45000)) // Giá trị combo bắp
                    .minOrderAmount(BigDecimal.valueOf(45000))
                    .maxDiscount(BigDecimal.valueOf(45000))
                    .usageLimit(1)
                    .usedCount(0)
                    .perUserLimit(1)
                    .validFrom(LocalDateTime.now())
                    .validTo(LocalDateTime.now().plusDays(15))
                    .status("active")
                    .build();
            couponRepository.save(coupon);
        }

        userRepository.save(user);

        // 6. Ghi log lịch sử quay
        spinHistoryRepository.save(SpinHistory.builder()
                .user(user)
                .prize(wonPrize)
                .pointsSpent(SPIN_COST)
                .pointsRewarded(pointsRewarded)
                .couponCode(couponCode)
                .build());

        log.info("User ID {} spun wheel: Won {} (Slot {}) - Balance: {}", 
                user.getId(), wonPrize.getName(), wonPrize.getSlotIndex(), user.getLoyaltyPoints());

        return SpinResultDTO.builder()
                .slotIndex(wonPrize.getSlotIndex())
                .prizeName(wonPrize.getName())
                .prizeType(wonPrize.getPrizeType())
                .prizeValue(wonPrize.getPrizeValue())
                .pointsSpent(SPIN_COST)
                .pointsRewarded(pointsRewarded)
                .couponCode(couponCode)
                .newBalance(user.getLoyaltyPoints())
                .message("Chúc mừng bạn đã trúng: " + wonPrize.getName() + "!")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpinHistoryDTO> getMyHistory() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return spinHistoryRepository.findByUserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(h -> SpinHistoryDTO.builder()
                        .id(h.getId())
                        .prizeName(h.getPrize() != null ? h.getPrize().getName() : "Không xác định")
                        .prizeType(h.getPrize() != null ? h.getPrize().getPrizeType() : "")
                        .pointsSpent(h.getPointsSpent())
                        .pointsRewarded(h.getPointsRewarded())
                        .couponCode(h.getCouponCode())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
