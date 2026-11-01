package com.example.demo2.repository;

import com.example.demo2.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    List<Notification> findByUserIdAndStatus(Long userId, String status);
}
