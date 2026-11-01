package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.banner.BannerRequestDTO;
import com.example.demo2.dto.banner.BannerResponseDTO;
import com.example.demo2.service.BannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
@Tag(name = "Banner", description = "Quản lý banner quảng cáo")
public class BannerController {

    private final BannerService bannerService;

    @PostMapping
    @Operation(summary = "Tạo banner mới")
    public ResponseEntity<ApiResponse<BannerResponseDTO>> createBanner(@Valid @RequestBody BannerRequestDTO dto) {
        BannerResponseDTO result = bannerService.createBanner(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo banner thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách banner (hỗ trợ filter isActive)")
    public ResponseEntity<ApiResponse<List<BannerResponseDTO>>> getAllBanners(
            @RequestParam(required = false) Boolean isActive) {
        List<BannerResponseDTO> list = bannerService.getAllBanners(isActive);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách banner thành công"));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách banner đang hoạt động cho trang chủ")
    public ResponseEntity<ApiResponse<List<BannerResponseDTO>>> getActiveBanners() {
        List<BannerResponseDTO> list = bannerService.getActiveBanners();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách banner hoạt động thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết banner theo ID")
    public ResponseEntity<ApiResponse<BannerResponseDTO>> getBannerById(@PathVariable Long id) {
        BannerResponseDTO result = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy thông tin banner thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật banner")
    public ResponseEntity<ApiResponse<BannerResponseDTO>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequestDTO dto) {
        BannerResponseDTO result = bannerService.updateBanner(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật banner thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa banner")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa banner thành công"));
    }
}
