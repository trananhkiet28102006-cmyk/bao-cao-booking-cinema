package com.example.demo2.service.impl;

import com.example.demo2.dto.genre.GenreRequestDTO;
import com.example.demo2.dto.genre.GenreResponseDTO;
import com.example.demo2.entity.Genre;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.GenreMapper;
import com.example.demo2.repository.GenreRepository;
import com.example.demo2.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    @Transactional
    public GenreResponseDTO createGenre(GenreRequestDTO dto) {
        if (genreRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Thể loại", "name", dto.getName());
        }
        Genre genre = GenreMapper.toEntity(dto);
        return GenreMapper.toResponseDTO(genreRepository.save(genre));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponseDTO> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GenreResponseDTO getGenreById(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thể loại", "id", id));
        return GenreMapper.toResponseDTO(genre);
    }

    @Override
    @Transactional
    public GenreResponseDTO updateGenre(Long id, GenreRequestDTO dto) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thể loại", "id", id));

        if (!genre.getName().equalsIgnoreCase(dto.getName()) && genreRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Thể loại", "name", dto.getName());
        }

        GenreMapper.updateEntity(genre, dto);
        return GenreMapper.toResponseDTO(genreRepository.save(genre));
    }

    @Override
    @Transactional
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thể loại", "id", id));
        genreRepository.delete(genre);
    }
}
