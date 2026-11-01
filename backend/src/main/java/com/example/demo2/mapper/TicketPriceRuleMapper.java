package com.example.demo2.mapper;

import com.example.demo2.dto.ticketpricerule.TicketPriceRuleRequestDTO;
import com.example.demo2.dto.ticketpricerule.TicketPriceRuleResponseDTO;
import com.example.demo2.entity.Cinema;
import com.example.demo2.entity.TicketPriceRule;

public class TicketPriceRuleMapper {

    public static TicketPriceRule toEntity(TicketPriceRuleRequestDTO dto, Cinema cinema) {
        if (dto == null) return null;
        return TicketPriceRule.builder()
                .cinema(cinema)
                .screenType(dto.getScreenType())
                .seatType(dto.getSeatType())
                .dayType(dto.getDayType())
                .timeSlot(dto.getTimeSlot())
                .customerType(dto.getCustomerType())
                .price(dto.getPrice())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    public static TicketPriceRuleResponseDTO toResponseDTO(TicketPriceRule entity) {
        if (entity == null) return null;
        return TicketPriceRuleResponseDTO.builder()
                .id(entity.getId())
                .cinemaId(entity.getCinema() != null ? entity.getCinema().getId() : null)
                .cinemaName(entity.getCinema() != null ? entity.getCinema().getName() : "Tất cả các rạp (Chung)")
                .screenType(entity.getScreenType())
                .seatType(entity.getSeatType())
                .dayType(entity.getDayType())
                .timeSlot(entity.getTimeSlot())
                .customerType(entity.getCustomerType())
                .price(entity.getPrice())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntity(TicketPriceRule entity, TicketPriceRuleRequestDTO dto, Cinema cinema) {
        if (dto == null || entity == null) return;
        entity.setCinema(cinema);
        if (dto.getScreenType() != null) entity.setScreenType(dto.getScreenType());
        if (dto.getSeatType() != null) entity.setSeatType(dto.getSeatType());
        if (dto.getDayType() != null) entity.setDayType(dto.getDayType());
        if (dto.getTimeSlot() != null) entity.setTimeSlot(dto.getTimeSlot());
        if (dto.getCustomerType() != null) entity.setCustomerType(dto.getCustomerType());
        if (dto.getPrice() != null) entity.setPrice(dto.getPrice());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }
}
