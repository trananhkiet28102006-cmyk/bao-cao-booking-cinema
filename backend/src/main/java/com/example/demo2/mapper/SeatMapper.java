package com.example.demo2.mapper;

import com.example.demo2.dto.seat.SeatRequestDTO;
import com.example.demo2.dto.seat.SeatResponseDTO;
import com.example.demo2.entity.CinemaRoom;
import com.example.demo2.entity.Seat;

public class SeatMapper {

    public static Seat toEntity(SeatRequestDTO dto, CinemaRoom room) {
        if (dto == null) return null;
        return Seat.builder()
                .cinemaRoom(room)
                .seatNumber(dto.getSeatNumber().trim().toUpperCase())
                .seatType(dto.getSeatType() != null ? dto.getSeatType().toLowerCase() : "standard")
                .rowIndex(dto.getRowIndex())
                .colIndex(dto.getColIndex())
                .build();
    }

    public static SeatResponseDTO toResponseDTO(Seat entity) {
        if (entity == null) return null;
        return SeatResponseDTO.builder()
                .id(entity.getId())
                .roomId(entity.getCinemaRoom() != null ? entity.getCinemaRoom().getId() : null)
                .roomName(entity.getCinemaRoom() != null ? entity.getCinemaRoom().getName() : null)
                .seatNumber(entity.getSeatNumber())
                .seatType(entity.getSeatType())
                .rowIndex(entity.getRowIndex())
                .colIndex(entity.getColIndex())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Seat entity, SeatRequestDTO dto) {
        if (dto == null || entity == null) return;
        if (dto.getSeatNumber() != null) entity.setSeatNumber(dto.getSeatNumber().trim().toUpperCase());
        if (dto.getSeatType() != null) entity.setSeatType(dto.getSeatType().toLowerCase());
        if (dto.getRowIndex() != null) entity.setRowIndex(dto.getRowIndex());
        if (dto.getColIndex() != null) entity.setColIndex(dto.getColIndex());
    }
}
