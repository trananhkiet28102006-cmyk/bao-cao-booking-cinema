package com.example.demo2.service;

import com.example.demo2.dto.favorite.FavoriteResponseDTO;

import java.util.List;

public interface FavoriteService {

    FavoriteResponseDTO addFavorite(Long movieId);

    void removeFavorite(Long movieId);

    List<FavoriteResponseDTO> getMyFavorites();

    boolean isFavorite(Long movieId);
}
