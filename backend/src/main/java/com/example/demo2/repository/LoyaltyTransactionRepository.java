package com.example.demo2.repository;

import com.example.demo2.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    List<LoyaltyTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<LoyaltyTransaction> findByBookingId(Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) FROM LoyaltyTransaction l WHERE l.user.id = :userId AND l.type = 'REDEEM_COUPON' AND l.description LIKE %:code%")
    long countRedeemedByUserAndCode(@org.springframework.data.repository.query.Param("userId") Long userId, 
                                   @org.springframework.data.repository.query.Param("code") String code);
}
