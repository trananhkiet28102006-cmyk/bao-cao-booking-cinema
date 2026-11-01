package com.example.demo2.mapper;

import com.example.demo2.dto.booking.BookingFnbResponseDTO;
import com.example.demo2.dto.booking.BookingResponseDTO;
import com.example.demo2.dto.booking.BookingStatusHistoryResponseDTO;
import com.example.demo2.dto.booking.TicketResponseDTO;
import com.example.demo2.entity.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class BookingMapper {

    public static TicketResponseDTO toTicketDTO(Ticket ticket) {
        if (ticket == null) return null;
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .seatId(ticket.getSeat() != null ? ticket.getSeat().getId() : null)
                .seatCode(ticket.getSeatCode())
                .seatType(ticket.getSeatType())
                .finalPrice(ticket.getFinalPrice())
                .priceRuleId(ticket.getPriceRule() != null ? ticket.getPriceRule().getId() : null)
                .qrCodeUrl(ticket.getQrCodeUrl())
                .checkinStatus(ticket.getCheckinStatus())
                .checkinAt(ticket.getCheckinAt())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    public static BookingFnbResponseDTO toBookingFnbDTO(BookingFnb bf) {
        if (bf == null) return null;
        return BookingFnbResponseDTO.builder()
                .id(bf.getId())
                .fnbItemId(bf.getFnbItem() != null ? bf.getFnbItem().getId() : null)
                .itemName(bf.getFnbItem() != null ? bf.getFnbItem().getItemName() : null)
                .category(bf.getFnbItem() != null ? bf.getFnbItem().getCategory() : null)
                .quantity(bf.getQuantity())
                .unitPrice(bf.getUnitPrice())
                .totalPrice(bf.getTotalPrice())
                .pickupStatus(bf.getPickupStatus())
                .createdAt(bf.getCreatedAt())
                .build();
    }

    public static BookingStatusHistoryResponseDTO toHistoryDTO(BookingStatusHistory h) {
        if (h == null) return null;
        return BookingStatusHistoryResponseDTO.builder()
                .id(h.getId())
                .bookingId(h.getBooking() != null ? h.getBooking().getId() : null)
                .oldStatus(h.getOldStatus())
                .newStatus(h.getNewStatus())
                .note(h.getNote())
                .changedBy(h.getChangedBy())
                .createdAt(h.getCreatedAt())
                .build();
    }

    public static BookingResponseDTO toResponseDTO(Booking booking, List<BookingStatusHistory> historyList) {
        if (booking == null) return null;

        Showtime showtime = booking.getShowtime();
        CinemaRoom room = showtime != null ? showtime.getCinemaRoom() : null;
        Cinema cinema = room != null ? room.getCinema() : null;
        Movie movie = showtime != null ? showtime.getMovie() : null;

        List<TicketResponseDTO> ticketDTOs = booking.getTickets() != null
                ? booking.getTickets().stream().map(BookingMapper::toTicketDTO).collect(Collectors.toList())
                : Collections.emptyList();

        List<BookingFnbResponseDTO> fnbDTOs = booking.getBookingFnbs() != null
                ? booking.getBookingFnbs().stream().map(BookingMapper::toBookingFnbDTO).collect(Collectors.toList())
                : Collections.emptyList();

        List<BookingStatusHistoryResponseDTO> historyDTOs = historyList != null
                ? historyList.stream().map(BookingMapper::toHistoryDTO).collect(Collectors.toList())
                : Collections.emptyList();

        BigDecimal ticketSubtotal = ticketDTOs.stream()
                .map(t -> t.getFinalPrice() != null ? t.getFinalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fnbSubtotal = fnbDTOs.stream()
                .map(f -> f.getTotalPrice() != null ? f.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userFullName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .showtimeId(showtime != null ? showtime.getId() : null)
                .movieTitle(movie != null ? movie.getTitle() : null)
                .cinemaName(cinema != null ? cinema.getName() : null)
                .roomName(room != null ? room.getName() : null)
                .showDate(showtime != null ? showtime.getShowDate() : null)
                .startTime(showtime != null ? showtime.getStartTime() : null)
                .screenFormat(showtime != null ? showtime.getScreenFormat() : null)
                .couponCode(booking.getCoupon() != null ? booking.getCoupon().getCode() : null)
                .contactPhone(booking.getContactPhone())
                .contactEmail(booking.getContactEmail())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentTransactionId(booking.getPaymentTransactionId())
                .ticketSubtotal(ticketSubtotal)
                .fnbSubtotal(fnbSubtotal)
                .subtotal(booking.getSubtotal())
                .discountAmount(booking.getDiscountAmount())
                .totalAmount(booking.getTotalAmount())
                .holdExpiresAt(booking.getHoldExpiresAt())
                .paidAt(booking.getPaidAt())
                .cancelledAt(booking.getCancelledAt())
                .createdAt(booking.getCreatedAt())
                .tickets(ticketDTOs)
                .fnbItems(fnbDTOs)
                .statusHistory(historyDTOs)
                .build();
    }
}
