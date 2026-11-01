package com.example.demo2.mapper;

import com.example.demo2.dto.banner.BannerRequestDTO;
import com.example.demo2.dto.banner.BannerResponseDTO;
import com.example.demo2.entity.Banner;

public class BannerMapper {

    public static Banner toEntity(BannerRequestDTO dto) {
        if (dto == null) return null;
        return Banner.builder()
                .title(dto.getTitle())
                .imageUrl(dto.getImageUrl())
                .linkUrl(dto.getLinkUrl())
                .targetType(dto.getTargetType())
                .targetId(dto.getTargetId())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();
    }

    public static BannerResponseDTO toResponseDTO(Banner entity) {
        if (entity == null) return null;
        return BannerResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .imageUrl(entity.getImageUrl())
                .linkUrl(entity.getLinkUrl())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Banner entity, BannerRequestDTO dto) {
        if (dto == null || entity == null) return;
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getImageUrl() != null) entity.setImageUrl(dto.getImageUrl());
        if (dto.getLinkUrl() != null) entity.setLinkUrl(dto.getLinkUrl());
        if (dto.getTargetType() != null) entity.setTargetType(dto.getTargetType());
        if (dto.getTargetId() != null) entity.setTargetId(dto.getTargetId());
        if (dto.getDisplayOrder() != null) entity.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getIsActive() != null) entity.setIsActive(dto.getIsActive());
        if (dto.getStartDate() != null) entity.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
    }
}
