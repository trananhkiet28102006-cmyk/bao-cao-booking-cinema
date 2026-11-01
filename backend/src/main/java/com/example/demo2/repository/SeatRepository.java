package com.example.demo2.repository;

import com.example.demo2.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByCinemaRoomIdOrderByRowIndexAscColIndexAsc(Long roomId);

    List<Seat> findByCinemaRoomId(Long roomId);

    boolean existsByCinemaRoomIdAndSeatNumber(Long roomId, String seatNumber);

    Optional<Seat> findByCinemaRoomIdAndSeatNumber(Long roomId, String seatNumber);

    void deleteByCinemaRoomId(Long roomId);

    long countByCinemaRoomId(Long roomId);
}
