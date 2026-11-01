package com.example.demo2.repository;

import com.example.demo2.entity.BookingFnb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingFnbRepository extends JpaRepository<BookingFnb, Long> {

    List<BookingFnb> findByBookingId(Long bookingId);
}
