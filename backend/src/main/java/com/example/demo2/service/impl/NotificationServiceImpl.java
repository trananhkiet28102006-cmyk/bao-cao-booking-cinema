package com.example.demo2.service.impl;

import com.example.demo2.dto.notification.NotificationResponseDTO;
import com.example.demo2.entity.Notification;
import com.example.demo2.entity.User;
import org.springframework.security.access.AccessDeniedException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.repository.NotificationRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getMyNotifications(Pageable pageable) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.findByUserIdOrderBySentAtDesc(currentUserId, pageable)
                .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return notificationRepository.countByUserIdAndStatus(currentUserId, "unread");
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getUser().getId().equals(currentUserId) && !SecurityUtils.isStaffOrAdmin()) {
            throw new AccessDeniedException("Bạn không có quyền xem hoặc thao tác thông báo này");
        }

        if (!"read".equalsIgnoreCase(notification.getStatus())) {
            notification.setStatus("read");
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return toDTO(notification);
    }

    @Override
    @Transactional
    public int markAllAsRead() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<Notification> unreadList = notificationRepository.findByUserIdAndStatus(currentUserId, "unread");
        LocalDateTime now = LocalDateTime.now();
        for (Notification n : unreadList) {
            n.setStatus("read");
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unreadList);
        return unreadList.size();
    }

    @Override
    @Transactional
    public Notification sendNotification(Long userId, String title, String message, String type, String channel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : "system")
                .channel(channel != null ? channel : "in_app")
                .status("unread")
                .sentAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .channel(n.getChannel())
                .status(n.getStatus())
                .sentAt(n.getSentAt())
                .readAt(n.getReadAt())
                .build();
    }
}
