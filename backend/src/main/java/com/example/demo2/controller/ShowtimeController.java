package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.seat.SeatLayoutDTO;
import com.example.demo2.dto.showtime.ShowtimeRequestDTO;
import com.example.demo2.dto.showtime.ShowtimeResponseDTO;
import com.example.demo2.service.SeatService;
import com.example.demo2.service.ShowtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/showtimes")
@RequiredArgsConstructor
@Tag(name = "Showtime", description = "Quản lý suất chiếu phim (Showtimes)")
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final SeatService seatService;

    @PostMapping
    @Operation(summary = "Tạo suất chiếu mới (có kiểm tra chống trùng phòng/giờ chiếu)")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> createShowtime(
            @Valid @RequestBody ShowtimeRequestDTO dto) {
        ShowtimeResponseDTO result = showtimeService.createShowtime(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo suất chiếu thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách suất chiếu (hỗ trợ lọc theo cinemaId, movieId, showDate)")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getShowtimes(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate showDate) {
        List<ShowtimeResponseDTO> list = showtimeService.getShowtimes(cinemaId, movieId, showDate);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách suất chiếu thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết suất chiếu theo ID")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> getShowtimeById(@PathVariable Long id) {
        ShowtimeResponseDTO result = showtimeService.getShowtimeById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết suất chiếu thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin suất chiếu")
    public ResponseEntity<ApiResponse<ShowtimeResponseDTO>> updateShowtime(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeRequestDTO dto) {
        ShowtimeResponseDTO result = showtimeService.updateShowtime(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật suất chiếu thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa suất chiếu")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa suất chiếu thành công"));
    }

    @GetMapping("/{id}/seats")
    @Operation(summary = "Lấy sơ đồ ma trận ghế và trạng thái (trống/đã đặt) theo suất chiếu")
    public ResponseEntity<ApiResponse<SeatLayoutDTO>> getSeatLayout(@PathVariable Long id) {
        SeatLayoutDTO result = seatService.getSeatLayoutByShowtime(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy sơ đồ ghế suất chiếu thành công"));
    }
}
