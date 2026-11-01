package com.example.demo2.mapper;

import com.example.demo2.dto.cinemaroom.CinemaRoomRequestDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;
import com.example.demo2.entity.Cinema;
import com.example.demo2.entity.CinemaRoom;

public class CinemaRoomMapper {

    public static CinemaRoom toEntity(CinemaRoomRequestDTO dto, Cinema cinema) {
        if (dto == null) return null;
        return CinemaRoom.builder()
                .cinema(cinema)
                .name(dto.getName())
                .roomType(dto.getRoomType() != null ? dto.getRoomType() : "2D")
                .totalSeats(dto.getTotalSeats() != null ? dto.getTotalSeats() : 50)
                .status(dto.getStatus() != null ? dto.getStatus() : "active")
                .build();
    }

    public static CinemaRoomResponseDTO toResponseDTO(CinemaRoom entity) {
        if (entity == null) return null;
        return CinemaRoomResponseDTO.builder()
                .id(entity.getId())
                .cinemaId(entity.getCinema() != null ? entity.getCinema().getId() : null)
                .name(entity.getName())
                .roomType(entity.getRoomType())
                .totalSeats(entity.getTotalSeats())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(CinemaRoom entity, CinemaRoomRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setName(dto.getName());
        if (dto.getRoomType() != null) entity.setRoomType(dto.getRoomType());
        if (dto.getTotalSeats() != null) entity.setTotalSeats(dto.getTotalSeats());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }
}
