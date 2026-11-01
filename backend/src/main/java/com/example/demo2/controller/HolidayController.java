package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.holiday.HolidayRequestDTO;
import com.example.demo2.dto.holiday.HolidayResponseDTO;
import com.example.demo2.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/holidays")
@RequiredArgsConstructor
@Tag(name = "Holiday", description = "Quản lý ngày lễ")
public class HolidayController {

    private final HolidayService holidayService;

    @PostMapping
    @Operation(summary = "Tạo ngày lễ mới")
    public ResponseEntity<ApiResponse<HolidayResponseDTO>> createHoliday(@Valid @RequestBody HolidayRequestDTO dto) {
        HolidayResponseDTO result = holidayService.createHoliday(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo ngày lễ thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách ngày lễ (hỗ trợ filter theo năm)")
    public ResponseEntity<ApiResponse<List<HolidayResponseDTO>>> getHolidays(
            @RequestParam(required = false) Integer year) {
        List<HolidayResponseDTO> list = holidayService.getHolidays(year);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách ngày lễ thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết ngày lễ theo ID")
    public ResponseEntity<ApiResponse<HolidayResponseDTO>> getHolidayById(@PathVariable Long id) {
        HolidayResponseDTO result = holidayService.getHolidayById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy thông tin ngày lễ thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật ngày lễ")
    public ResponseEntity<ApiResponse<HolidayResponseDTO>> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequestDTO dto) {
        HolidayResponseDTO result = holidayService.updateHoliday(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật ngày lễ thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ngày lễ")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa ngày lễ thành công"));
    }
}
