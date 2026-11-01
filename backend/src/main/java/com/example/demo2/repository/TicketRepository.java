package com.example.demo2.repository;

import com.example.demo2.entity.Ticket;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByShowtimeId(Long showtimeId);

    List<Ticket> findByBookingId(Long bookingId);

    Optional<Ticket> findByTicketCode(String ticketCode);

    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId " +
           "AND (t.booking IS NULL OR (" +
           "  t.booking.status != 'cancelled' AND (" +
           "    t.booking.status != 'pending' OR t.booking.holdExpiresAt IS NULL OR t.booking.holdExpiresAt > CURRENT_TIMESTAMP" +
           "  )" +
           "))")
    Set<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query("SELECT t.seatCode FROM Ticket t WHERE t.showtime.id = :showtimeId " +
           "AND (t.booking IS NULL OR (" +
           "  t.booking.status != 'cancelled' AND (" +
           "    t.booking.status != 'pending' OR t.booking.holdExpiresAt IS NULL OR t.booking.holdExpiresAt > CURRENT_TIMESTAMP" +
           "  )" +
           "))")
    Set<String> findBookedSeatCodesByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.booking IS NOT NULL AND t.booking.paymentStatus = 'paid'")
    long countPaidTickets();

    @Query("""
        SELECT t.showtime.movie.id, t.showtime.movie.title, t.showtime.movie.posterUrl, COUNT(t), COALESCE(SUM(t.finalPrice), 0)
        FROM Ticket t
        WHERE t.booking IS NOT NULL AND t.booking.paymentStatus = 'paid'
        GROUP BY t.showtime.movie.id, t.showtime.movie.title, t.showtime.movie.posterUrl
        ORDER BY SUM(t.finalPrice) DESC
    """)
    List<Object[]> findTopSellingMovies(Pageable pageable);
}
