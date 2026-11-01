package com.example.demo2.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {
    private Long id;
    private String bookingCode;
    private Long userId;
    private String userFullName;
    private Long showtimeId;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private LocalDate showDate;
    private LocalTime startTime;
    private String screenFormat;
    private String couponCode;
    private String contactPhone;
    private String contactEmail;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String paymentTransactionId;
    private BigDecimal ticketSubtotal;
    private BigDecimal fnbSubtotal;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private LocalDateTime holdExpiresAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private List<TicketResponseDTO> tickets;
    private List<BookingFnbResponseDTO> fnbItems;
    private List<BookingStatusHistoryResponseDTO> statusHistory;
}
