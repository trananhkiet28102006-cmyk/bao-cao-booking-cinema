package com.example.demo2.service;

import com.example.demo2.dto.seat.*;

import java.util.List;

public interface SeatService {

    List<SeatResponseDTO> generateSeatsForRoom(Long roomId, SeatGenerateRequestDTO dto);

    List<SeatResponseDTO> getSeatsByRoom(Long roomId);

    SeatResponseDTO createSeat(Long roomId, SeatRequestDTO dto);

    SeatResponseDTO updateSeat(Long seatId, SeatRequestDTO dto);

    void deleteSeat(Long seatId);

    SeatLayoutDTO getSeatLayoutByShowtime(Long showtimeId);
}
