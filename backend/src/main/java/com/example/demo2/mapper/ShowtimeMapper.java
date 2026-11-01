package com.example.demo2.mapper;

import com.example.demo2.dto.showtime.ShowtimeRequestDTO;
import com.example.demo2.dto.showtime.ShowtimeResponseDTO;
import com.example.demo2.entity.CinemaRoom;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.Showtime;

import java.time.LocalTime;

public class ShowtimeMapper {

    public static Showtime toEntity(ShowtimeRequestDTO dto, Movie movie, CinemaRoom room) {
        if (dto == null) return null;
        return Showtime.builder()
                .movie(movie)
                .cinemaRoom(room)
                .showDate(dto.getShowDate())
                .startTime(dto.getStartTime())
                .screenFormat(dto.getScreenFormat() != null ? dto.getScreenFormat() : room.getRoomType())
                .status(dto.getStatus() != null ? dto.getStatus() : "scheduled")
                .build();
    }

    public static ShowtimeResponseDTO toResponseDTO(Showtime entity) {
        if (entity == null) return null;

        LocalTime endTime = null;
        if (entity.getStartTime() != null && entity.getMovie() != null && entity.getMovie().getDurationMinutes() != null) {
            endTime = entity.getStartTime().plusMinutes(entity.getMovie().getDurationMinutes());
        }

        return ShowtimeResponseDTO.builder()
                .id(entity.getId())
                .movieId(entity.getMovie() != null ? entity.getMovie().getId() : null)
                .movieTitle(entity.getMovie() != null ? entity.getMovie().getTitle() : null)
                .movieDurationMinutes(entity.getMovie() != null ? entity.getMovie().getDurationMinutes() : null)
                .moviePosterUrl(entity.getMovie() != null ? entity.getMovie().getPosterUrl() : null)
                .movieAgeRating(entity.getMovie() != null ? entity.getMovie().getAgeRating() : null)
                .roomId(entity.getCinemaRoom() != null ? entity.getCinemaRoom().getId() : null)
                .roomName(entity.getCinemaRoom() != null ? entity.getCinemaRoom().getName() : null)
                .roomType(entity.getCinemaRoom() != null ? entity.getCinemaRoom().getRoomType() : null)
                .cinemaId(entity.getCinemaRoom() != null && entity.getCinemaRoom().getCinema() != null
                        ? entity.getCinemaRoom().getCinema().getId() : null)
                .cinemaName(entity.getCinemaRoom() != null && entity.getCinemaRoom().getCinema() != null
                        ? entity.getCinemaRoom().getCinema().getName() : null)
                .cinemaCity(entity.getCinemaRoom() != null && entity.getCinemaRoom().getCinema() != null
                        ? entity.getCinemaRoom().getCinema().getCity() : null)
                .showDate(entity.getShowDate())
                .startTime(entity.getStartTime())
                .estimatedEndTime(endTime)
                .screenFormat(entity.getScreenFormat())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntity(Showtime entity, ShowtimeRequestDTO dto, Movie movie, CinemaRoom room) {
        if (dto == null || entity == null) return;
        if (movie != null) entity.setMovie(movie);
        if (room != null) entity.setCinemaRoom(room);
        if (dto.getShowDate() != null) entity.setShowDate(dto.getShowDate());
        if (dto.getStartTime() != null) entity.setStartTime(dto.getStartTime());
        if (dto.getScreenFormat() != null) entity.setScreenFormat(dto.getScreenFormat());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }
}
