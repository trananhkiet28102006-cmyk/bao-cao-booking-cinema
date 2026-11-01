package com.example.demo2.mapper;

import com.example.demo2.dto.fnb.FnbItemRequestDTO;
import com.example.demo2.dto.fnb.FnbItemResponseDTO;
import com.example.demo2.entity.FnbItem;

public class FnbItemMapper {

    public static FnbItem toEntity(FnbItemRequestDTO dto) {
        if (dto == null) return null;
        return FnbItem.builder()
                .itemName(dto.getItemName())
                .category(dto.getCategory() != null ? dto.getCategory().toLowerCase() : "popcorn")
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .basePrice(dto.getBasePrice())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }

    public static FnbItemResponseDTO toResponseDTO(FnbItem entity) {
        if (entity == null) return null;
        return FnbItemResponseDTO.builder()
                .id(entity.getId())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .basePrice(entity.getBasePrice())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntity(FnbItem entity, FnbItemRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setItemName(dto.getItemName());
        if (dto.getCategory() != null) entity.setCategory(dto.getCategory().toLowerCase());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
        if (dto.getBasePrice() != null) entity.setBasePrice(dto.getBasePrice());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
    }
}
