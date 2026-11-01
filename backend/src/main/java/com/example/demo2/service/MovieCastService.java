package com.example.demo2.service;

import com.example.demo2.dto.moviecast.MovieCastRequestDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;

import java.util.List;

public interface MovieCastService {
    MovieCastResponseDTO addCast(Long movieId, MovieCastRequestDTO dto);
    List<MovieCastResponseDTO> getCastsByMovie(Long movieId);
    MovieCastResponseDTO updateCast(Long castId, MovieCastRequestDTO dto);
    void deleteCast(Long castId);
}
