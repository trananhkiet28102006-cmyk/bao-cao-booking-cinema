package com.example.demo2.service;

import com.example.demo2.dto.booking.*;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO dto);

    BookingResponseDTO getBookingById(Long id);

    BookingResponseDTO getBookingByCode(String bookingCode);

    List<BookingResponseDTO> getAllBookings(Long userId, Long showtimeId, String status);

    BookingResponseDTO cancelBooking(Long id, BookingCancelRequestDTO dto);

    TicketResponseDTO checkinTicket(TicketCheckinRequestDTO dto);

    List<BookingFnbResponseDTO> claimBookingFnb(Long bookingId);

    List<BookingStatusHistoryResponseDTO> getBookingStatusHistory(Long bookingId);

    int releaseExpiredHoldBookings();
}
