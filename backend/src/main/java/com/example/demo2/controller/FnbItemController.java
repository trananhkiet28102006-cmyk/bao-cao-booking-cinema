package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.fnb.FnbItemRequestDTO;
import com.example.demo2.dto.fnb.FnbItemResponseDTO;
import com.example.demo2.service.FnbItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fnb-items")
@RequiredArgsConstructor
@Tag(name = "F&B Items", description = "Quản lý danh mục Bắp Nước & Combo (F&B)")
public class FnbItemController {

    private final FnbItemService fnbItemService;

    @PostMapping
    @Operation(summary = "Tạo món bắp nước / combo mới")
    public ResponseEntity<ApiResponse<FnbItemResponseDTO>> createFnbItem(
            @Valid @RequestBody FnbItemRequestDTO dto) {
        FnbItemResponseDTO result = fnbItemService.createFnbItem(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo món bắp nước thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách bắp nước (hỗ trợ lọc theo danh mục: popcorn, drink, combo và trạng thái kinh doanh)")
    public ResponseEntity<ApiResponse<List<FnbItemResponseDTO>>> getFnbItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly) {
        List<FnbItemResponseDTO> list = fnbItemService.getFnbItems(category, activeOnly);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách bắp nước thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết món bắp nước theo ID")
    public ResponseEntity<ApiResponse<FnbItemResponseDTO>> getFnbItemById(@PathVariable Long id) {
        FnbItemResponseDTO result = fnbItemService.getFnbItemById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết bắp nước thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin món bắp nước")
    public ResponseEntity<ApiResponse<FnbItemResponseDTO>> updateFnbItem(
            @PathVariable Long id,
            @Valid @RequestBody FnbItemRequestDTO dto) {
        FnbItemResponseDTO result = fnbItemService.updateFnbItem(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật bắp nước thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa món bắp nước")
    public ResponseEntity<ApiResponse<Void>> deleteFnbItem(@PathVariable Long id) {
        fnbItemService.deleteFnbItem(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bắp nước thành công"));
    }
}
