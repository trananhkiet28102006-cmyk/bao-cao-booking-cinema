package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.luckywheel.PrizeResponseDTO;
import com.example.demo2.dto.luckywheel.SpinHistoryDTO;
import com.example.demo2.dto.luckywheel.SpinResultDTO;
import com.example.demo2.service.LuckyWheelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lucky-wheel")
@RequiredArgsConstructor
@Tag(name = "Lucky Wheel", description = "Vòng quay may mắn đổi điểm thưởng CineClub")
public class LuckyWheelController {

    private final LuckyWheelService luckyWheelService;

    @GetMapping("/prizes")
    @SecurityRequirements
    @Operation(summary = "Xem danh sách các ô giải thưởng trên vòng quay (Công khai)")
    public ResponseEntity<ApiResponse<List<PrizeResponseDTO>>> getPrizes() {
        return ResponseEntity.ok(ApiResponse.success(luckyWheelService.getPrizes()));
    }

    @PostMapping("/spin")
    @Operation(summary = "Quay vòng quay may mắn (Tiêu hao 200 điểm CineClub)")
    public ResponseEntity<ApiResponse<SpinResultDTO>> spinWheel() {
        SpinResultDTO result = luckyWheelService.spinWheel();
        return ResponseEntity.ok(ApiResponse.success(result, result.getMessage()));
    }

    @GetMapping("/my-history")
    @Operation(summary = "Xem lịch sử quay thưởng của tài khoản đăng nhập")
    public ResponseEntity<ApiResponse<List<SpinHistoryDTO>>> getMyHistory() {
        return ResponseEntity.ok(ApiResponse.success(luckyWheelService.getMyHistory()));
    }
}
