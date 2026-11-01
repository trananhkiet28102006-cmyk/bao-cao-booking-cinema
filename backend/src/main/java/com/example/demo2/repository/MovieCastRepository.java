package com.example.demo2.repository;

import com.example.demo2.entity.MovieCast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieCastRepository extends JpaRepository<MovieCast, Long> {
    List<MovieCast> findByMovieIdOrderByDisplayOrderAsc(Long movieId);
}
