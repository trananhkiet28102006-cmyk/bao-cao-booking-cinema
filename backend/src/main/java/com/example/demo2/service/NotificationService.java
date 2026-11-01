package com.example.demo2.service;

import com.example.demo2.dto.notification.NotificationResponseDTO;
import com.example.demo2.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponseDTO> getMyNotifications(Pageable pageable);

    long getUnreadCount();

    NotificationResponseDTO markAsRead(Long id);

    int markAllAsRead();

    Notification sendNotification(Long userId, String title, String message, String type, String channel);
}
