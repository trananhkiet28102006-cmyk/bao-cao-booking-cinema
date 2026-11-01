package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.ticketpricerule.PriceCalculationRequestDTO;
import com.example.demo2.dto.ticketpricerule.PriceCalculationResponseDTO;
import com.example.demo2.dto.ticketpricerule.TicketPriceRuleRequestDTO;
import com.example.demo2.dto.ticketpricerule.TicketPriceRuleResponseDTO;
import com.example.demo2.service.TicketPriceRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ticket-price-rules")
@RequiredArgsConstructor
@Tag(name = "Ticket Price Rule", description = "Quản lý quy tắc bảng giá vé và tính giá vé động")
public class TicketPriceRuleController {

    private final TicketPriceRuleService priceRuleService;

    @PostMapping
    @Operation(summary = "Tạo quy tắc giá vé mới")
    public ResponseEntity<ApiResponse<TicketPriceRuleResponseDTO>> createRule(
            @Valid @RequestBody TicketPriceRuleRequestDTO dto) {
        TicketPriceRuleResponseDTO result = priceRuleService.createRule(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo quy tắc giá vé thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách quy tắc giá vé (có thể lọc theo cụm rạp)")
    public ResponseEntity<ApiResponse<List<TicketPriceRuleResponseDTO>>> getAllRules(
            @RequestParam(required = false) Long cinemaId) {
        List<TicketPriceRuleResponseDTO> list = priceRuleService.getAllRules(cinemaId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách quy tắc giá vé thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết quy tắc giá vé theo ID")
    public ResponseEntity<ApiResponse<TicketPriceRuleResponseDTO>> getRuleById(@PathVariable Long id) {
        TicketPriceRuleResponseDTO result = priceRuleService.getRuleById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết quy tắc giá vé thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật quy tắc giá vé")
    public ResponseEntity<ApiResponse<TicketPriceRuleResponseDTO>> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody TicketPriceRuleRequestDTO dto) {
        TicketPriceRuleResponseDTO result = priceRuleService.updateRule(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật quy tắc giá vé thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa quy tắc giá vé")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable Long id) {
        priceRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa quy tắc giá vé thành công"));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính giá vé động cho suất chiếu (dựa theo định dạng phòng, loại ghế, ngày thường/lễ/cuối tuần, khung giờ)")
    public ResponseEntity<ApiResponse<PriceCalculationResponseDTO>> calculatePrice(
            @Valid @RequestBody PriceCalculationRequestDTO dto) {
        PriceCalculationResponseDTO result = priceRuleService.calculatePrice(dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Tính giá vé thành công"));
    }
}
