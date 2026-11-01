package com.example.demo2.repository;

import com.example.demo2.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    List<Cinema> findByCityIgnoreCase(String city);
    boolean existsByName(String name);
}
