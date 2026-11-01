package com.example.demo2.service.impl;

import com.example.demo2.dto.moviecast.MovieCastRequestDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.MovieCast;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.MovieCastMapper;
import com.example.demo2.repository.MovieCastRepository;
import com.example.demo2.repository.MovieRepository;
import com.example.demo2.service.MovieCastService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieCastServiceImpl implements MovieCastService {

    private final MovieCastRepository movieCastRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional
    public MovieCastResponseDTO addCast(Long movieId, MovieCastRequestDTO dto) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", movieId));

        MovieCast cast = MovieCastMapper.toEntity(dto, movie);
        return MovieCastMapper.toResponseDTO(movieCastRepository.save(cast));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieCastResponseDTO> getCastsByMovie(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new ResourceNotFoundException("Phim", "id", movieId);
        }
        return movieCastRepository.findByMovieIdOrderByDisplayOrderAsc(movieId).stream()
                .map(MovieCastMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MovieCastResponseDTO updateCast(Long castId, MovieCastRequestDTO dto) {
        MovieCast cast = movieCastRepository.findById(castId)
                .orElseThrow(() -> new ResourceNotFoundException("Diễn viên", "id", castId));

        MovieCastMapper.updateEntity(cast, dto);
        return MovieCastMapper.toResponseDTO(movieCastRepository.save(cast));
    }

    @Override
    @Transactional
    public void deleteCast(Long castId) {
        MovieCast cast = movieCastRepository.findById(castId)
                .orElseThrow(() -> new ResourceNotFoundException("Diễn viên", "id", castId));
        movieCastRepository.delete(cast);
    }
}
