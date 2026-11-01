package com.example.demo2.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private String channel;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
