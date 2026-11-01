package com.example.demo2.service.impl;

import com.example.demo2.dto.movie.MovieDetailResponseDTO;
import com.example.demo2.dto.movie.MovieRequestDTO;
import com.example.demo2.dto.movie.MovieResponseDTO;
import com.example.demo2.entity.Genre;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.MovieGenre;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.MovieMapper;
import com.example.demo2.repository.GenreRepository;
import com.example.demo2.repository.MovieGenreRepository;
import com.example.demo2.repository.MovieRepository;
import com.example.demo2.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final MovieGenreRepository movieGenreRepository;

    @Override
    @Transactional
    public MovieResponseDTO createMovie(MovieRequestDTO dto) {
        Movie movie = MovieMapper.toEntity(dto);
        Movie savedMovie = movieRepository.save(movie);

        if (dto.getGenreIds() != null && !dto.getGenreIds().isEmpty()) {
            List<MovieGenre> movieGenres = new ArrayList<>();
            for (Long genreId : dto.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Thể loại", "id", genreId));
                MovieGenre mg = MovieGenre.builder()
                        .movie(savedMovie)
                        .genre(genre)
                        .build();
                movieGenres.add(movieGenreRepository.save(mg));
            }
            savedMovie.setMovieGenres(movieGenres);
        }

        return MovieMapper.toResponseDTO(savedMovie);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponseDTO> getAllMovies(String status, String keyword) {
        List<Movie> movies;
        if (keyword != null && !keyword.isBlank()) {
            if (status != null && !status.isBlank()) {
                movies = movieRepository.searchByTitleAndStatus(keyword.trim(), status.trim());
            } else {
                movies = movieRepository.searchByTitle(keyword.trim());
            }
        } else if (status != null && !status.isBlank()) {
            movies = movieRepository.findByStatus(status.trim());
        } else {
            movies = movieRepository.findAll();
        }

        return movies.stream()
                .map(MovieMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovieDetailResponseDTO getMovieDetail(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));
        return MovieMapper.toDetailResponseDTO(movie);
    }

    @Override
    @Transactional
    public MovieResponseDTO updateMovie(Long id, MovieRequestDTO dto) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));

        MovieMapper.updateEntity(movie, dto);

        if (dto.getGenreIds() != null) {
            movieGenreRepository.deleteByMovieId(id);
            List<MovieGenre> updatedGenres = new ArrayList<>();
            for (Long genreId : dto.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new ResourceNotFoundException("Thể loại", "id", genreId));
                MovieGenre mg = MovieGenre.builder()
                        .movie(movie)
                        .genre(genre)
                        .build();
                updatedGenres.add(movieGenreRepository.save(mg));
            }
            movie.setMovieGenres(updatedGenres);
        }

        return MovieMapper.toResponseDTO(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", id));
        movieRepository.delete(movie);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponseDTO> getNowShowingMovies() {
        return movieRepository.findByStatus("now_showing").stream()
                .map(MovieMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponseDTO> getComingSoonMovies() {
        return movieRepository.findByStatus("coming_soon").stream()
                .map(MovieMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
