package com.example.demo2.mapper;

import com.example.demo2.dto.genre.GenreRequestDTO;
import com.example.demo2.dto.genre.GenreResponseDTO;
import com.example.demo2.entity.Genre;

public class GenreMapper {

    public static Genre toEntity(GenreRequestDTO dto) {
        if (dto == null) return null;
        String slug = dto.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        }
        return Genre.builder()
                .name(dto.getName())
                .slug(slug)
                .build();
    }

    public static GenreResponseDTO toResponseDTO(Genre entity) {
        if (entity == null) return null;
        return GenreResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Genre entity, GenreRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setName(dto.getName());
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            entity.setSlug(dto.getSlug());
        }
    }
}
