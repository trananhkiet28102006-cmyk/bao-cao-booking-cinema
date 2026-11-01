package com.example.demo2.repository;

import com.example.demo2.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByCinemaRoomIdAndShowDate(Long roomId, LocalDate showDate);

    List<Showtime> findByMovieIdAndShowDate(Long movieId, LocalDate showDate);

    List<Showtime> findByShowDate(LocalDate showDate);

    @Query("SELECT s FROM Showtime s WHERE s.cinemaRoom.cinema.id = :cinemaId " +
           "AND (:movieId IS NULL OR s.movie.id = :movieId) " +
           "AND (:showDate IS NULL OR s.showDate = :showDate) " +
           "ORDER BY s.showDate ASC, s.startTime ASC")
    List<Showtime> findShowtimesFiltered(
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId,
            @Param("showDate") LocalDate showDate);

    @Query("SELECT s FROM Showtime s WHERE " +
           "(:cinemaId IS NULL OR s.cinemaRoom.cinema.id = :cinemaId) " +
           "AND (:movieId IS NULL OR s.movie.id = :movieId) " +
           "AND (:showDate IS NULL OR s.showDate = :showDate) " +
           "ORDER BY s.showDate ASC, s.startTime ASC")
    List<Showtime> findAllFiltered(
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId,
            @Param("showDate") LocalDate showDate);

    @Query("SELECT s FROM Showtime s WHERE s.cinemaRoom.id = :roomId " +
           "AND s.showDate = :showDate " +
           "AND (:excludeId IS NULL OR s.id != :excludeId)")
    List<Showtime> findShowtimesInRoomOnDate(
            @Param("roomId") Long roomId,
            @Param("showDate") LocalDate showDate,
            @Param("excludeId") Long excludeId);
}
