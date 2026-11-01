package com.example.demo2.mapper;

import com.example.demo2.dto.moviecast.MovieCastRequestDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.MovieCast;

public class MovieCastMapper {

    public static MovieCast toEntity(MovieCastRequestDTO dto, Movie movie) {
        if (dto == null) return null;
        return MovieCast.builder()
                .movie(movie)
                .roleType(dto.getRoleType() != null ? dto.getRoleType() : "actor")
                .personName(dto.getPersonName())
                .characterName(dto.getCharacterName())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .build();
    }

    public static MovieCastResponseDTO toResponseDTO(MovieCast entity) {
        if (entity == null) return null;
        return MovieCastResponseDTO.builder()
                .id(entity.getId())
                .movieId(entity.getMovie() != null ? entity.getMovie().getId() : null)
                .roleType(entity.getRoleType())
                .personName(entity.getPersonName())
                .characterName(entity.getCharacterName())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    public static void updateEntity(MovieCast entity, MovieCastRequestDTO dto) {
        if (dto == null || entity == null) return;
        if (dto.getRoleType() != null) entity.setRoleType(dto.getRoleType());
        if (dto.getPersonName() != null) entity.setPersonName(dto.getPersonName());
        if (dto.getCharacterName() != null) entity.setCharacterName(dto.getCharacterName());
        if (dto.getDisplayOrder() != null) entity.setDisplayOrder(dto.getDisplayOrder());
    }
}
