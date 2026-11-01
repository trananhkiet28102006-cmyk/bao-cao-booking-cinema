package com.example.demo2.service;

import com.example.demo2.dto.movie.MovieDetailResponseDTO;
import com.example.demo2.dto.movie.MovieRequestDTO;
import com.example.demo2.dto.movie.MovieResponseDTO;

import java.util.List;

public interface MovieService {
    MovieResponseDTO createMovie(MovieRequestDTO dto);
    List<MovieResponseDTO> getAllMovies(String status, String keyword);
    MovieDetailResponseDTO getMovieDetail(Long id);
    MovieResponseDTO updateMovie(Long id, MovieRequestDTO dto);
    void deleteMovie(Long id);
    List<MovieResponseDTO> getNowShowingMovies();
    List<MovieResponseDTO> getComingSoonMovies();
}
