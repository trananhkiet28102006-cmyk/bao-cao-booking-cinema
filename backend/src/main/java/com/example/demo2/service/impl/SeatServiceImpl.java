package com.example.demo2.service.impl;

import com.example.demo2.dto.seat.*;
import com.example.demo2.entity.CinemaRoom;
import com.example.demo2.entity.Seat;
import com.example.demo2.entity.Showtime;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.SeatMapper;
import com.example.demo2.repository.CinemaRoomRepository;
import com.example.demo2.repository.SeatRepository;
import com.example.demo2.repository.ShowtimeRepository;
import com.example.demo2.repository.TicketRepository;
import com.example.demo2.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TicketRepository ticketRepository;

    @Override
    @Transactional
    public List<SeatResponseDTO> generateSeatsForRoom(Long roomId, SeatGenerateRequestDTO dto) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaRoom", "id", roomId));

        if (Boolean.TRUE.equals(dto.getClearExisting())) {
            seatRepository.deleteByCinemaRoomId(roomId);
        }

        Set<String> vipRowsSet = dto.getVipRows() != null
                ? dto.getVipRows().stream().map(String::toUpperCase).collect(Collectors.toSet())
                : Collections.emptySet();

        Set<String> coupleRowsSet = dto.getCoupleRows() != null
                ? dto.getCoupleRows().stream().map(String::toUpperCase).collect(Collectors.toSet())
                : Collections.emptySet();

        List<Seat> seatsToSave = new ArrayList<>();

        for (int r = 1; r <= dto.getNumRows(); r++) {
            char rowChar = (char) ('A' + r - 1);
            String rowName = String.valueOf(rowChar);

            String seatType = "standard";
            if (coupleRowsSet.contains(rowName)) {
                seatType = "couple";
            } else if (vipRowsSet.contains(rowName)) {
                seatType = "vip";
            }

            for (int c = 1; c <= dto.getNumCols(); c++) {
                String seatNumber = String.format("%s%02d", rowName, c);

                Seat seat = Seat.builder()
                        .cinemaRoom(room)
                        .seatNumber(seatNumber)
                        .seatType(seatType)
                        .rowIndex(r)
                        .colIndex(c)
                        .build();

                seatsToSave.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToSave);

        // Cập nhật tổng số ghế cho phòng chiếu
        long currentTotal = seatRepository.countByCinemaRoomId(roomId);
        room.setTotalSeats((int) currentTotal);
        cinemaRoomRepository.save(room);

        return savedSeats.stream()
                .map(SeatMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponseDTO> getSeatsByRoom(Long roomId) {
        if (!cinemaRoomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("CinemaRoom", "id", roomId);
        }
        return seatRepository.findByCinemaRoomIdOrderByRowIndexAscColIndexAsc(roomId)
                .stream()
                .map(SeatMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SeatResponseDTO createSeat(Long roomId, SeatRequestDTO dto) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaRoom", "id", roomId));

        String seatNum = dto.getSeatNumber().trim().toUpperCase();
        if (seatRepository.existsByCinemaRoomIdAndSeatNumber(roomId, seatNum)) {
            throw new DuplicateResourceException("Seat", "seatNumber", seatNum);
        }

        Seat seat = SeatMapper.toEntity(dto, room);
        Seat saved = seatRepository.save(seat);

        room.setTotalSeats((int) seatRepository.countByCinemaRoomId(roomId));
        cinemaRoomRepository.save(room);

        return SeatMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public SeatResponseDTO updateSeat(Long seatId, SeatRequestDTO dto) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

        String seatNum = dto.getSeatNumber().trim().toUpperCase();
        if (!seat.getSeatNumber().equalsIgnoreCase(seatNum)
                && seatRepository.existsByCinemaRoomIdAndSeatNumber(seat.getCinemaRoom().getId(), seatNum)) {
            throw new DuplicateResourceException("Seat", "seatNumber", seatNum);
        }

        SeatMapper.updateEntity(seat, dto);
        Seat updated = seatRepository.save(seat);
        return SeatMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));
        CinemaRoom room = seat.getCinemaRoom();
        seatRepository.delete(seat);

        room.setTotalSeats((int) seatRepository.countByCinemaRoomId(room.getId()));
        cinemaRoomRepository.save(room);
    }

    @Override
    @Transactional(readOnly = true)
    public SeatLayoutDTO getSeatLayoutByShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", showtimeId));

        CinemaRoom room = showtime.getCinemaRoom();
        List<Seat> seats = seatRepository.findByCinemaRoomIdOrderByRowIndexAscColIndexAsc(room.getId());
        Set<Long> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId);

        List<SeatStatusDTO> seatStatusList = seats.stream().map(s -> {
            boolean isBooked = bookedSeatIds.contains(s.getId());
            char rowChar = (char) ('A' + (s.getRowIndex() != null ? s.getRowIndex() - 1 : 0));
            return SeatStatusDTO.builder()
                    .seatId(s.getId())
                    .seatNumber(s.getSeatNumber())
                    .rowName(String.valueOf(rowChar))
                    .rowIndex(s.getRowIndex())
                    .colIndex(s.getColIndex())
                    .seatType(s.getSeatType())
                    .status(isBooked ? "BOOKED" : "AVAILABLE")
                    .build();
        }).collect(Collectors.toList());

        int total = seatStatusList.size();
        int booked = (int) seatStatusList.stream().filter(s -> "BOOKED".equals(s.getStatus())).count();
        int available = total - booked;

        return SeatLayoutDTO.builder()
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie() != null ? showtime.getMovie().getId() : null)
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .roomId(room.getId())
                .roomName(room.getName())
                .roomType(room.getRoomType())
                .cinemaId(room.getCinema() != null ? room.getCinema().getId() : null)
                .cinemaName(room.getCinema() != null ? room.getCinema().getName() : null)
                .showDate(showtime.getShowDate())
                .startTime(showtime.getStartTime())
                .totalSeats(total)
                .availableSeats(available)
                .bookedSeats(booked)
                .seats(seatStatusList)
                .build();
    }
}
