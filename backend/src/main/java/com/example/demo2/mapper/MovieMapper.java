package com.example.demo2.mapper;

import com.example.demo2.dto.genre.GenreResponseDTO;
import com.example.demo2.dto.movie.MovieDetailResponseDTO;
import com.example.demo2.dto.movie.MovieRequestDTO;
import com.example.demo2.dto.movie.MovieResponseDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;
import com.example.demo2.entity.Movie;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class MovieMapper {

    public static Movie toEntity(MovieRequestDTO dto) {
        if (dto == null) return null;
        return Movie.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .durationMinutes(dto.getDurationMinutes())
                .ageRating(dto.getAgeRating() != null ? dto.getAgeRating() : "P")
                .language(dto.getLanguage() != null ? dto.getLanguage() : "Tiếng Việt")
                .trailerUrl(dto.getTrailerUrl())
                .posterUrl(dto.getPosterUrl())
                .status(dto.getStatus() != null ? dto.getStatus() : "now_showing")
                .releaseDate(dto.getReleaseDate())
                .endDate(dto.getEndDate())
                .director(dto.getDirector())
                .build();
    }

    public static MovieResponseDTO toResponseDTO(Movie entity) {
        if (entity == null) return null;

        List<GenreResponseDTO> genreDTOs = entity.getMovieGenres() != null
                ? entity.getMovieGenres().stream()
                .filter(mg -> mg.getGenre() != null)
                .map(mg -> GenreMapper.toResponseDTO(mg.getGenre()))
                .collect(Collectors.toList())
                : Collections.emptyList();

        return MovieResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .durationMinutes(entity.getDurationMinutes())
                .ageRating(entity.getAgeRating())
                .language(entity.getLanguage())
                .trailerUrl(entity.getTrailerUrl())
                .posterUrl(entity.getPosterUrl())
                .status(entity.getStatus())
                .releaseDate(entity.getReleaseDate())
                .endDate(entity.getEndDate())
                .director(entity.getDirector())
                .genres(genreDTOs)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static MovieDetailResponseDTO toDetailResponseDTO(Movie entity) {
        if (entity == null) return null;

        List<GenreResponseDTO> genreDTOs = entity.getMovieGenres() != null
                ? entity.getMovieGenres().stream()
                .filter(mg -> mg.getGenre() != null)
                .map(mg -> GenreMapper.toResponseDTO(mg.getGenre()))
                .collect(Collectors.toList())
                : Collections.emptyList();

        List<MovieCastResponseDTO> castDTOs = entity.getCasts() != null
                ? entity.getCasts().stream()
                .map(MovieCastMapper::toResponseDTO)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return MovieDetailResponseDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .durationMinutes(entity.getDurationMinutes())
                .ageRating(entity.getAgeRating())
                .language(entity.getLanguage())
                .trailerUrl(entity.getTrailerUrl())
                .posterUrl(entity.getPosterUrl())
                .status(entity.getStatus())
                .releaseDate(entity.getReleaseDate())
                .endDate(entity.getEndDate())
                .director(entity.getDirector())
                .genres(genreDTOs)
                .casts(castDTOs)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static void updateEntity(Movie entity, MovieRequestDTO dto) {
        if (dto == null || entity == null) return;
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getAgeRating() != null) entity.setAgeRating(dto.getAgeRating());
        if (dto.getLanguage() != null) entity.setLanguage(dto.getLanguage());
        if (dto.getTrailerUrl() != null) entity.setTrailerUrl(dto.getTrailerUrl());
        if (dto.getPosterUrl() != null) entity.setPosterUrl(dto.getPosterUrl());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getReleaseDate() != null) entity.setReleaseDate(dto.getReleaseDate());
        if (dto.getEndDate() != null) entity.setEndDate(dto.getEndDate());
        if (dto.getDirector() != null) entity.setDirector(dto.getDirector());
    }
}
