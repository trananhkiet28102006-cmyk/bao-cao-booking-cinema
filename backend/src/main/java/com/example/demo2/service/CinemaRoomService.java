package com.example.demo2.service;

import com.example.demo2.dto.cinemaroom.CinemaRoomRequestDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;

import java.util.List;

public interface CinemaRoomService {
    CinemaRoomResponseDTO createRoom(Long cinemaId, CinemaRoomRequestDTO dto);
    List<CinemaRoomResponseDTO> getRoomsByCinema(Long cinemaId);
    CinemaRoomResponseDTO updateRoom(Long roomId, CinemaRoomRequestDTO dto);
    void deleteRoom(Long roomId);
}
