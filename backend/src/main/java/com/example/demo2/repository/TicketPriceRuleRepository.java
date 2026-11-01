package com.example.demo2.repository;

import com.example.demo2.entity.TicketPriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketPriceRuleRepository extends JpaRepository<TicketPriceRule, Long> {

    List<TicketPriceRule> findByCinemaId(Long cinemaId);

    List<TicketPriceRule> findByIsActiveTrue();

    @Query("SELECT r FROM TicketPriceRule r WHERE r.isActive = true " +
           "AND (r.cinema.id IS NULL OR r.cinema.id = :cinemaId) " +
           "AND (r.screenType IS NULL OR LOWER(r.screenType) = LOWER(:screenType)) " +
           "AND (r.seatType IS NULL OR LOWER(r.seatType) = LOWER(:seatType)) " +
           "AND (r.dayType IS NULL OR LOWER(r.dayType) = LOWER(:dayType)) " +
           "AND (r.timeSlot IS NULL OR LOWER(r.timeSlot) = LOWER(:timeSlot)) " +
           "AND (r.customerType IS NULL OR LOWER(r.customerType) = LOWER(:customerType))")
    List<TicketPriceRule> findMatchingRules(
            @Param("cinemaId") Long cinemaId,
            @Param("screenType") String screenType,
            @Param("seatType") String seatType,
            @Param("dayType") String dayType,
            @Param("timeSlot") String timeSlot,
            @Param("customerType") String customerType);
}
