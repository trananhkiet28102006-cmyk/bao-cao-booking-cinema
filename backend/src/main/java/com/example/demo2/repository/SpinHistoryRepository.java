package com.example.demo2.repository;

import com.example.demo2.entity.SpinHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpinHistoryRepository extends JpaRepository<SpinHistory, Long> {
    List<SpinHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
