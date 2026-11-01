package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.seat.SeatGenerateRequestDTO;
import com.example.demo2.dto.seat.SeatRequestDTO;
import com.example.demo2.dto.seat.SeatResponseDTO;
import com.example.demo2.service.SeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Seat", description = "Quản lý ghế ngồi & Sơ đồ ghế (Seats)")
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/api/v1/rooms/{roomId}/seats/generate")
    @Operation(summary = "Tự động sinh hàng loạt ma trận ghế cho phòng chiếu (Standard, VIP, Couple)")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> generateSeats(
            @PathVariable Long roomId,
            @Valid @RequestBody SeatGenerateRequestDTO dto) {
        List<SeatResponseDTO> result = seatService.generateSeatsForRoom(roomId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, String.format("Sinh thành công %d ghế cho phòng chiếu", result.size())));
    }

    @GetMapping("/api/v1/rooms/{roomId}/seats")
    @Operation(summary = "Lấy danh sách tất cả các ghế của một phòng chiếu")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getSeatsByRoom(@PathVariable Long roomId) {
        List<SeatResponseDTO> list = seatService.getSeatsByRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách ghế thành công"));
    }

    @PostMapping("/api/v1/rooms/{roomId}/seats")
    @Operation(summary = "Thêm một ghế thủ công vào phòng chiếu")
    public ResponseEntity<ApiResponse<SeatResponseDTO>> createSeat(
            @PathVariable Long roomId,
            @Valid @RequestBody SeatRequestDTO dto) {
        SeatResponseDTO result = seatService.createSeat(roomId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Thêm ghế thành công"));
    }

    @PutMapping("/api/v1/seats/{seatId}")
    @Operation(summary = "Cập nhật thông tin ghế (loại ghế, số ghế, tọa độ)")
    public ResponseEntity<ApiResponse<SeatResponseDTO>> updateSeat(
            @PathVariable Long seatId,
            @Valid @RequestBody SeatRequestDTO dto) {
        SeatResponseDTO result = seatService.updateSeat(seatId, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật thông tin ghế thành công"));
    }

    @DeleteMapping("/api/v1/seats/{seatId}")
    @Operation(summary = "Xóa ghế khỏi phòng chiếu")
    public ResponseEntity<ApiResponse<Void>> deleteSeat(@PathVariable Long seatId) {
        seatService.deleteSeat(seatId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa ghế thành công"));
    }
}
