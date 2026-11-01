package com.example.demo2.service;

import com.example.demo2.dto.cinema.CinemaRequestDTO;
import com.example.demo2.dto.cinema.CinemaResponseDTO;

import java.util.List;

public interface CinemaService {
    CinemaResponseDTO createCinema(CinemaRequestDTO dto);
    List<CinemaResponseDTO> getAllCinemas(String city);
    CinemaResponseDTO getCinemaById(Long id);
    CinemaResponseDTO updateCinema(Long id, CinemaRequestDTO dto);
    void deleteCinema(Long id);
}
