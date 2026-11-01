package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.userdevice.UserDeviceRequestDTO;
import com.example.demo2.dto.userdevice.UserDeviceResponseDTO;
import com.example.demo2.service.UserDeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-devices")
@RequiredArgsConstructor
@Tag(name = "User Device", description = "Đăng ký và quản lý thiết bị/push token người dùng")
public class UserDeviceController {

    private final UserDeviceService userDeviceService;

    @PostMapping
    @Operation(summary = "Đăng ký hoặc cập nhật thiết bị nhận thông báo")
    public ResponseEntity<ApiResponse<UserDeviceResponseDTO>> registerDevice(@Valid @RequestBody UserDeviceRequestDTO dto) {
        UserDeviceResponseDTO response = userDeviceService.registerDevice(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Đăng ký thiết bị thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách thiết bị đã đăng ký của tôi")
    public ResponseEntity<ApiResponse<List<UserDeviceResponseDTO>>> getMyDevices() {
        return ResponseEntity.ok(ApiResponse.success(userDeviceService.getMyDevices(), "Lấy danh sách thiết bị thành công"));
    }

    @DeleteMapping("/{deviceToken}")
    @Operation(summary = "Hủy kích hoạt thiết bị (khi đăng xuất)")
    public ResponseEntity<ApiResponse<Void>> deactivateDevice(@PathVariable String deviceToken) {
        userDeviceService.deactivateDevice(deviceToken);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy kích hoạt thiết bị thành công"));
    }
}
