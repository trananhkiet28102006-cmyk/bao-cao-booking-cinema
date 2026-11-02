package com.example.demo2.repository;

import com.example.demo2.entity.LuckyWheelPrize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LuckyWheelPrizeRepository extends JpaRepository<LuckyWheelPrize, Long> {
    List<LuckyWheelPrize> findByIsActiveTrueOrderBySlotIndexAsc();
}
