package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.cinema.CinemaRequestDTO;
import com.example.demo2.dto.cinema.CinemaResponseDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomRequestDTO;
import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;
import com.example.demo2.service.CinemaRoomService;
import com.example.demo2.service.CinemaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cinemas")
@RequiredArgsConstructor
@Tag(name = "Cinema", description = "Quản lý cụm rạp và phòng chiếu")
public class CinemaController {

    private final CinemaService cinemaService;
    private final CinemaRoomService cinemaRoomService;

    @PostMapping
    @Operation(summary = "Tạo cụm rạp mới")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> createCinema(@Valid @RequestBody CinemaRequestDTO dto) {
        CinemaResponseDTO result = cinemaService.createCinema(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo cụm rạp thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách cụm rạp (hỗ trợ filter theo city)")
    public ResponseEntity<ApiResponse<List<CinemaResponseDTO>>> getAllCinemas(
            @RequestParam(required = false) String city) {
        List<CinemaResponseDTO> list = cinemaService.getAllCinemas(city);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách cụm rạp thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết cụm rạp theo ID (kèm danh sách phòng chiếu)")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> getCinemaById(@PathVariable Long id) {
        CinemaResponseDTO result = cinemaService.getCinemaById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy thông tin cụm rạp thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin cụm rạp")
    public ResponseEntity<ApiResponse<CinemaResponseDTO>> updateCinema(
            @PathVariable Long id,
            @Valid @RequestBody CinemaRequestDTO dto) {
        CinemaResponseDTO result = cinemaService.updateCinema(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật cụm rạp thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa cụm rạp")
    public ResponseEntity<ApiResponse<Void>> deleteCinema(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa cụm rạp thành công"));
    }

    // --- Phòng chiếu (CinemaRoom) endpoints ---

    @PostMapping("/{cinemaId}/rooms")
    @Operation(summary = "Tạo phòng chiếu mới cho rạp")
    public ResponseEntity<ApiResponse<CinemaRoomResponseDTO>> createRoom(
            @PathVariable Long cinemaId,
            @Valid @RequestBody CinemaRoomRequestDTO dto) {
        CinemaRoomResponseDTO result = cinemaRoomService.createRoom(cinemaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo phòng chiếu thành công"));
    }

    @GetMapping("/{cinemaId}/rooms")
    @Operation(summary = "Lấy danh sách phòng chiếu của rạp")
    public ResponseEntity<ApiResponse<List<CinemaRoomResponseDTO>>> getRoomsByCinema(@PathVariable Long cinemaId) {
        List<CinemaRoomResponseDTO> list = cinemaRoomService.getRoomsByCinema(cinemaId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách phòng chiếu thành công"));
    }

    @PutMapping("/{cinemaId}/rooms/{roomId}")
    @Operation(summary = "Cập nhật phòng chiếu")
    public ResponseEntity<ApiResponse<CinemaRoomResponseDTO>> updateRoom(
            @PathVariable Long cinemaId,
            @PathVariable Long roomId,
            @Valid @RequestBody CinemaRoomRequestDTO dto) {
        CinemaRoomResponseDTO result = cinemaRoomService.updateRoom(roomId, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật phòng chiếu thành công"));
    }

    @DeleteMapping("/{cinemaId}/rooms/{roomId}")
    @Operation(summary = "Xóa phòng chiếu")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long cinemaId,
            @PathVariable Long roomId) {
        cinemaRoomService.deleteRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phòng chiếu thành công"));
    }
}
