package com.example.demo2.service;

import com.example.demo2.dto.showtime.ShowtimeRequestDTO;
import com.example.demo2.dto.showtime.ShowtimeResponseDTO;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    ShowtimeResponseDTO createShowtime(ShowtimeRequestDTO dto);

    ShowtimeResponseDTO updateShowtime(Long id, ShowtimeRequestDTO dto);

    ShowtimeResponseDTO getShowtimeById(Long id);

    void deleteShowtime(Long id);

    List<ShowtimeResponseDTO> getShowtimes(Long cinemaId, Long movieId, LocalDate showDate);
}
