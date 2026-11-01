package com.example.demo2.mapper;

import com.example.demo2.dto.holiday.HolidayRequestDTO;
import com.example.demo2.dto.holiday.HolidayResponseDTO;
import com.example.demo2.entity.Holiday;

public class HolidayMapper {

    public static Holiday toEntity(HolidayRequestDTO dto) {
        if (dto == null) return null;
        return Holiday.builder()
                .holidayDate(dto.getHolidayDate())
                .name(dto.getName())
                .type(dto.getType() != null ? dto.getType() : "national")
                .build();
    }

    public static HolidayResponseDTO toResponseDTO(Holiday entity) {
        if (entity == null) return null;
        return HolidayResponseDTO.builder()
                .id(entity.getId())
                .holidayDate(entity.getHolidayDate())
                .name(entity.getName())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Holiday entity, HolidayRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setHolidayDate(dto.getHolidayDate());
        entity.setName(dto.getName());
        if (dto.getType() != null) entity.setType(dto.getType());
    }
}
