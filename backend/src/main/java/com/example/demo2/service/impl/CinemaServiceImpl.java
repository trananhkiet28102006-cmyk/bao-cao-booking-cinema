package com.example.demo2.service.impl;

import com.example.demo2.dto.cinema.CinemaRequestDTO;
import com.example.demo2.dto.cinema.CinemaResponseDTO;
import com.example.demo2.entity.Cinema;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.CinemaMapper;
import com.example.demo2.repository.CinemaRepository;
import com.example.demo2.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository cinemaRepository;

    @Override
    @Transactional
    public CinemaResponseDTO createCinema(CinemaRequestDTO dto) {
        if (cinemaRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Rạp chiếu", "name", dto.getName());
        }
        Cinema cinema = CinemaMapper.toEntity(dto);
        return CinemaMapper.toResponseDTO(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaResponseDTO> getAllCinemas(String city) {
        List<Cinema> cinemas;
        if (city != null && !city.isBlank()) {
            cinemas = cinemaRepository.findByCityIgnoreCase(city.trim());
        } else {
            cinemas = cinemaRepository.findAll();
        }
        return cinemas.stream()
                .map(CinemaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CinemaResponseDTO getCinemaById(Long id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rạp chiếu", "id", id));
        return CinemaMapper.toResponseDTO(cinema);
    }

    @Override
    @Transactional
    public CinemaResponseDTO updateCinema(Long id, CinemaRequestDTO dto) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rạp chiếu", "id", id));

        if (!cinema.getName().equalsIgnoreCase(dto.getName()) && cinemaRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Rạp chiếu", "name", dto.getName());
        }

        CinemaMapper.updateEntity(cinema, dto);
        return CinemaMapper.toResponseDTO(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional
    public void deleteCinema(Long id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rạp chiếu", "id", id));
        cinemaRepository.delete(cinema);
    }
}
