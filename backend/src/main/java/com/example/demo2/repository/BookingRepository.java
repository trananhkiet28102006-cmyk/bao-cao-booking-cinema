package com.example.demo2.repository;

import com.example.demo2.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByShowtimeIdOrderByCreatedAtDesc(Long showtimeId);

    List<Booking> findByStatusOrderByCreatedAtDesc(String status);

    long countByUserIdAndCouponIdAndStatusNot(Long userId, Long couponId, String excludedStatus);

    long countByPaymentStatus(String paymentStatus);

    long countByStatus(String status);

    @Query("SELECT b FROM Booking b WHERE b.status = 'pending' AND b.holdExpiresAt IS NOT NULL AND b.holdExpiresAt < :now")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'paid'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'paid' AND b.paidAt >= :fromTime")
    BigDecimal sumRevenueSince(@Param("fromTime") LocalDateTime fromTime);

    @Query("SELECT b.paymentMethod, COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'paid' GROUP BY b.paymentMethod")
    List<Object[]> sumRevenueByPaymentMethod();
}
