package com.example.demo2.repository;

import com.example.demo2.entity.MovieGenre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieGenreRepository extends JpaRepository<MovieGenre, Long> {
    List<MovieGenre> findByMovieId(Long movieId);
    void deleteByMovieId(Long movieId);
}
