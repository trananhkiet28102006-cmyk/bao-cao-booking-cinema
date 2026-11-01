package com.example.demo2.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusHistoryResponseDTO {
    private Long id;
    private Long bookingId;
    private String oldStatus;
    private String newStatus;
    private String note;
    private String changedBy;
    private LocalDateTime createdAt;
}
