package com.example.demo2.service;

import com.example.demo2.dto.genre.GenreRequestDTO;
import com.example.demo2.dto.genre.GenreResponseDTO;

import java.util.List;

public interface GenreService {
    GenreResponseDTO createGenre(GenreRequestDTO dto);
    List<GenreResponseDTO> getAllGenres();
    GenreResponseDTO getGenreById(Long id);
    GenreResponseDTO updateGenre(Long id, GenreRequestDTO dto);
    void deleteGenre(Long id);
}
