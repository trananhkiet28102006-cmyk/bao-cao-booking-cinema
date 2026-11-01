package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.notification.NotificationResponseDTO;
import com.example.demo2.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Quản lý thông báo người dùng")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của người dùng đăng nhập (phân trang)")
    public ResponseEntity<ApiResponse<Page<NotificationResponseDTO>>> getMyNotifications(
            @PageableDefault(size = 20, sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getMyNotifications(pageable), "Lấy danh sách thông báo thành công"));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count), "Lấy số lượng thông báo chưa đọc thành công"));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu 1 thông báo đã đọc")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(id), "Đã đánh dấu thông báo là đã đọc"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo của tôi là đã đọc")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead() {
        int count = notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success(Map.of("updatedCount", count), "Đã đánh dấu " + count + " thông báo là đã đọc"));
    }
}
