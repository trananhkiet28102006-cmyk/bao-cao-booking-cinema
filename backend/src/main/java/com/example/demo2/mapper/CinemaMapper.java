package com.example.demo2.mapper;

import com.example.demo2.dto.cinema.CinemaRequestDTO;
import com.example.demo2.dto.cinema.CinemaResponseDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;
import com.example.demo2.entity.Cinema;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CinemaMapper {

    public static Cinema toEntity(CinemaRequestDTO dto) {
        if (dto == null) return null;
        return Cinema.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();
    }

    public static CinemaResponseDTO toResponseDTO(Cinema entity) {
        if (entity == null) return null;

        List<CinemaRoomResponseDTO> roomDTOs = entity.getRooms() != null
                ? entity.getRooms().stream()
                .map(CinemaRoomMapper::toResponseDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return CinemaResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .address(entity.getAddress())
                .city(entity.getCity())
                .district(entity.getDistrict())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .rooms(roomDTOs)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Cinema entity, CinemaRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        if (dto.getDistrict() != null) entity.setDistrict(dto.getDistrict());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getPhone() != null) entity.setPhone(dto.getPhone());
        if (dto.getLatitude() != null) entity.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) entity.setLongitude(dto.getLongitude());
    }
}
