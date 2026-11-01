package com.example.demo2.repository;

import com.example.demo2.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Refund> findByStatusOrderByCreatedAtDesc(String status);
}
