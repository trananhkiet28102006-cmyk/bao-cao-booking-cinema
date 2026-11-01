package com.example.demo2.mapper;

import com.example.demo2.dto.favorite.FavoriteResponseDTO;
import com.example.demo2.entity.Favorite;

public class FavoriteMapper {

    public static FavoriteResponseDTO toResponseDTO(Favorite favorite) {
        if (favorite == null) return null;

        return FavoriteResponseDTO.builder()
                .id(favorite.getId())
                .userId(favorite.getUser() != null ? favorite.getUser().getId() : null)
                .movie(favorite.getMovie() != null ? MovieMapper.toResponseDTO(favorite.getMovie()) : null)
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
