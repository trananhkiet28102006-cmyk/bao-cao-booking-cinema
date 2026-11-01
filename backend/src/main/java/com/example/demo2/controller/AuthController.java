package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.auth.*;
import com.example.demo2.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Đăng ký, đăng nhập (JWT), thông tin tài khoản & đổi mật khẩu")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @SecurityRequirements
    @Operation(summary = "Đăng ký tài khoản khách hàng mới (role CUSTOMER) và nhận JWT")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO dto) {
        AuthResponseDTO result = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Đăng ký tài khoản thành công"));
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Đăng nhập bằng email + mật khẩu, trả về JWT access token")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto) {
        AuthResponseDTO result = authService.login(dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập thành công"));
    }

    @GetMapping("/me")
    @Operation(summary = "Xem thông tin tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserProfileDTO>> me() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentProfile(), "Lấy thông tin tài khoản thành công"));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<Object>> changePassword(@Valid @RequestBody ChangePasswordRequestDTO dto) {
        authService.changePassword(dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công"));
    }
}
