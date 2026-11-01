package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.upload.CloudinaryUploadResponseDTO;
import com.example.demo2.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
@Tag(name = "Cloudinary Media Upload", description = "Tích hợp dịch vụ lưu trữ và tối ưu hóa hình ảnh đám mây Cloudinary")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải ảnh lên Cloudinary (hỗ trợ thư mục: movies, banners, fnb, avatars...)")
    public ResponseEntity<ApiResponse<CloudinaryUploadResponseDTO>> uploadImage(
            @Parameter(description = "File hình ảnh (JPG, PNG, WEBP, GIF, SVG - tối đa 10MB)")
            @RequestParam(value = "file", required = false) MultipartFile file,
            @Parameter(description = "Thư mục phân loại (movies, banners, fnb, avatars...)")
            @RequestParam(value = "folder", required = false, defaultValue = "movies") String folder
    ) {
        CloudinaryUploadResponseDTO response = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tải ảnh lên dịch vụ Cloudinary thành công"));
    }

    @DeleteMapping("/image")
    @Operation(summary = "Xóa ảnh trên Cloudinary bằng publicId")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteImage(
            @Parameter(description = "Mã publicId của ảnh trên Cloudinary", required = true)
            @RequestParam("publicId") String publicId
    ) {
        Map<String, Object> result = cloudinaryService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResponse.success(result, "Xóa ảnh trên Cloudinary thành công"));
    }
}
