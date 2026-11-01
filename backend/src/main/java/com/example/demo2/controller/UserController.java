package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.auth.UserProfileDTO;
import com.example.demo2.dto.loyalty.LoyaltySummaryDTO;
import com.example.demo2.dto.user.UpdateProfileRequestDTO;
import com.example.demo2.dto.user.UserRoleUpdateRequestDTO;
import com.example.demo2.dto.user.UserStatusUpdateRequestDTO;
import com.example.demo2.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Quản lý thông tin cá nhân và quản trị người dùng (ADMIN)")
public class UserController {

    private final UserService userService;

    // ---- Cá nhân ----

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân (họ tên, số điện thoại)")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateMyProfile(@Valid @RequestBody UpdateProfileRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateMyProfile(dto), "Cập nhật thông tin thành công"));
    }

    @GetMapping("/loyalty")
    @Operation(summary = "Lấy điểm thưởng tích lũy và lịch sử giao dịch điểm của tôi")
    public ResponseEntity<ApiResponse<LoyaltySummaryDTO>> getMyLoyaltySummary() {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyLoyaltySummary(), "Lấy điểm thưởng tích lũy thành công"));
    }

    // ---- Dành cho Quản trị viên (ADMIN) ----

    @GetMapping
    @Operation(summary = "[ADMIN] Danh sách người dùng (tìm kiếm, lọc theo vai trò, trạng thái, phân trang)")
    public ResponseEntity<ApiResponse<Page<UserProfileDTO>>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(role, status, keyword, pageable), "Lấy danh sách người dùng thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "[ADMIN] Xem chi tiết thông tin người dùng")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "Lấy thông tin người dùng thành công"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "[ADMIN] Cập nhật trạng thái người dùng (active, banned, inactive)")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateRequestDTO dto
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserStatus(id, dto), "Cập nhật trạng thái người dùng thành công"));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "[ADMIN] Thay đổi vai trò người dùng (CUSTOMER, STAFF, ADMIN)")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRoleUpdateRequestDTO dto
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRole(id, dto), "Cập nhật vai trò người dùng thành công"));
    }
}
