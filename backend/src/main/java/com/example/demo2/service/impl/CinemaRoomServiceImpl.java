package com.example.demo2.service.impl;

import com.example.demo2.dto.cinemaroom.CinemaRoomRequestDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;
import com.example.demo2.entity.Cinema;
import com.example.demo2.entity.CinemaRoom;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.CinemaRoomMapper;
import com.example.demo2.repository.CinemaRepository;
import com.example.demo2.repository.CinemaRoomRepository;
import com.example.demo2.service.CinemaRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaRoomServiceImpl implements CinemaRoomService {

    private final CinemaRoomRepository cinemaRoomRepository;
    private final CinemaRepository cinemaRepository;

    @Override
    @Transactional
    public CinemaRoomResponseDTO createRoom(Long cinemaId, CinemaRoomRequestDTO dto) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new ResourceNotFoundException("Rạp chiếu", "id", cinemaId));

        if (cinemaRoomRepository.existsByCinemaIdAndNameIgnoreCase(cinemaId, dto.getName().trim())) {
            throw new DuplicateResourceException("Phòng chiếu tại rạp '" + cinema.getName() + "'", "name", dto.getName());
        }

        CinemaRoom room = CinemaRoomMapper.toEntity(dto, cinema);
        return CinemaRoomMapper.toResponseDTO(cinemaRoomRepository.save(room));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaRoomResponseDTO> getRoomsByCinema(Long cinemaId) {
        if (!cinemaRepository.existsById(cinemaId)) {
            throw new ResourceNotFoundException("Rạp chiếu", "id", cinemaId);
        }
        return cinemaRoomRepository.findByCinemaId(cinemaId).stream()
                .map(CinemaRoomMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CinemaRoomResponseDTO updateRoom(Long roomId, CinemaRoomRequestDTO dto) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", roomId));

        if (!room.getName().equalsIgnoreCase(dto.getName().trim())
                && cinemaRoomRepository.existsByCinemaIdAndNameIgnoreCase(room.getCinema().getId(), dto.getName().trim())) {
            throw new DuplicateResourceException("Phòng chiếu tại rạp '" + room.getCinema().getName() + "'", "name", dto.getName());
        }

        CinemaRoomMapper.updateEntity(room, dto);
        return CinemaRoomMapper.toResponseDTO(cinemaRoomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long roomId) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", roomId));
        cinemaRoomRepository.delete(room);
    }
}
