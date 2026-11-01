package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.coupon.CouponApplyRequestDTO;
import com.example.demo2.dto.coupon.CouponCalculationResponseDTO;
import com.example.demo2.dto.coupon.CouponRequestDTO;
import com.example.demo2.dto.coupon.CouponResponseDTO;
import com.example.demo2.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupon", description = "Quản lý mã giảm giá (Khuyến mãi) và tính mức giảm giá đơn hàng")
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "Tạo mã giảm giá (Coupon) mới")
    public ResponseEntity<ApiResponse<CouponResponseDTO>> createCoupon(
            @Valid @RequestBody CouponRequestDTO dto) {
        CouponResponseDTO result = couponService.createCoupon(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo mã giảm giá thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách mã giảm giá (có thể lọc activeOnly=true)")
    public ResponseEntity<ApiResponse<List<CouponResponseDTO>>> getAllCoupons(
            @RequestParam(required = false) Boolean activeOnly) {
        List<CouponResponseDTO> list = couponService.getAllCoupons(activeOnly);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách mã giảm giá thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết mã giảm giá theo ID")
    public ResponseEntity<ApiResponse<CouponResponseDTO>> getCouponById(@PathVariable Long id) {
        CouponResponseDTO result = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết mã giảm giá thành công"));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Tra cứu thông tin mã giảm giá theo chuỗi Code")
    public ResponseEntity<ApiResponse<CouponResponseDTO>> getCouponByCode(@PathVariable String code) {
        CouponResponseDTO result = couponService.getCouponByCode(code);
        return ResponseEntity.ok(ApiResponse.success(result, "Tra cứu mã giảm giá thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin mã giảm giá")
    public ResponseEntity<ApiResponse<CouponResponseDTO>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequestDTO dto) {
        CouponResponseDTO result = couponService.updateCoupon(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật mã giảm giá thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mã giảm giá")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa mã giảm giá thành công"));
    }

    @PostMapping("/apply")
    @Operation(summary = "Kiểm tra tính hợp lệ của mã giảm giá và tính số tiền được giảm cho đơn hàng")
    public ResponseEntity<ApiResponse<CouponCalculationResponseDTO>> applyCoupon(
            @Valid @RequestBody CouponApplyRequestDTO dto) {
        CouponCalculationResponseDTO result = couponService.validateAndCalculateDiscount(dto);
        return ResponseEntity.ok(ApiResponse.success(result, result.getMessage()));
    }
}
