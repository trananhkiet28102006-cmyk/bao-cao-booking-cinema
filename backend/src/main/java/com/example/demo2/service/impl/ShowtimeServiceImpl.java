package com.example.demo2.service.impl;

import com.example.demo2.dto.showtime.ShowtimeRequestDTO;
import com.example.demo2.dto.showtime.ShowtimeResponseDTO;
import com.example.demo2.entity.CinemaRoom;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.Showtime;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.ShowtimeMapper;
import com.example.demo2.repository.CinemaRoomRepository;
import com.example.demo2.repository.MovieRepository;
import com.example.demo2.repository.ShowtimeRepository;
import com.example.demo2.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRoomRepository cinemaRoomRepository;

    private static final int CLEANING_BUFFER_MINUTES = 15;

    @Override
    @Transactional
    public ShowtimeResponseDTO createShowtime(ShowtimeRequestDTO dto) {
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", dto.getMovieId()));

        CinemaRoom room = cinemaRoomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("CinemaRoom", "id", dto.getRoomId()));

        // Kiểm tra xung đột lịch chiếu
        validateScheduleConflict(room, dto.getShowDate(), dto.getStartTime(), movie.getDurationMinutes(), null);

        Showtime showtime = ShowtimeMapper.toEntity(dto, movie, room);
        Showtime saved = showtimeRepository.save(showtime);
        return ShowtimeMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public ShowtimeResponseDTO updateShowtime(Long id, ShowtimeRequestDTO dto) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", id));

        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", dto.getMovieId()));

        CinemaRoom room = cinemaRoomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("CinemaRoom", "id", dto.getRoomId()));

        // Kiểm tra xung đột lịch chiếu ngoại trừ chính suất chiếu này
        validateScheduleConflict(room, dto.getShowDate(), dto.getStartTime(), movie.getDurationMinutes(), id);

        ShowtimeMapper.updateEntity(showtime, dto, movie, room);
        Showtime updated = showtimeRepository.save(showtime);
        return ShowtimeMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponseDTO getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", id));
        return ShowtimeMapper.toResponseDTO(showtime);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", id));
        showtimeRepository.delete(showtime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponseDTO> getShowtimes(Long cinemaId, Long movieId, LocalDate showDate) {
        List<Showtime> list = showtimeRepository.findAllFiltered(cinemaId, movieId, showDate);
        return list.stream()
                .map(ShowtimeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void validateScheduleConflict(CinemaRoom room, LocalDate showDate, LocalTime newStartTime,
                                          int durationMinutes, Long excludeId) {
        LocalTime newEndTime = newStartTime.plusMinutes(durationMinutes + CLEANING_BUFFER_MINUTES);

        List<Showtime> existingShowtimes = showtimeRepository.findShowtimesInRoomOnDate(room.getId(), showDate, excludeId);

        for (Showtime existing : existingShowtimes) {
            LocalTime existingStart = existing.getStartTime();
            int existingDuration = existing.getMovie() != null && existing.getMovie().getDurationMinutes() != null
                    ? existing.getMovie().getDurationMinutes()
                    : 120;
            LocalTime existingEnd = existingStart.plusMinutes(existingDuration + CLEANING_BUFFER_MINUTES);

            // Kiểm tra giao nhau: hai khoảng thời gian [startA, endA) và [startB, endB) trùng nhau khi startA < endB && newEndTime > existingStart
            boolean isOverlap = newStartTime.isBefore(existingEnd) && newEndTime.isAfter(existingStart);
            if (isOverlap) {
                String movieTitle = existing.getMovie() != null ? existing.getMovie().getTitle() : "Phim khác";
                throw new BadRequestException(String.format(
                        "Xung đột lịch chiếu tại phòng '%s': Đã có suất chiếu phim '%s' từ %s đến %s (bao gồm 15 phút dọn dẹp phòng).",
                        room.getName(), movieTitle, existingStart, existingEnd.minusMinutes(CLEANING_BUFFER_MINUTES)
                ));
            }
        }
    }
}
