package com.example.demo2.repository;

import com.example.demo2.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

    List<PaymentAttempt> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    Optional<PaymentAttempt> findByTransactionId(String transactionId);
}
