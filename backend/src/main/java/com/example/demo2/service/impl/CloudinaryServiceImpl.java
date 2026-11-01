package com.example.demo2.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo2.dto.upload.CloudinaryUploadResponseDTO;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/svg+xml"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:123456789012345}")
    private String apiKey;

    @Value("${cloudinary.api-secret:abcdefghijklmnopqrstuvwxyz1}")
    private String apiSecret;

    @Value("${cloudinary.folder:smart_booking_engine}")
    private String baseFolder;

    private boolean isDummyCredentials() {
        return cloudName == null || cloudName.isBlank() || "demo".equalsIgnoreCase(cloudName.trim())
                || apiKey == null || "123456789012345".equals(apiKey.trim())
                || apiSecret == null || "abcdefghijklmnopqrstuvwxyz1".equals(apiSecret.trim());
    }

    @Override
    public CloudinaryUploadResponseDTO uploadImage(MultipartFile file, String subFolder) {
        validateImageFile(file);

        // Nếu thông tin cấu hình Cloudinary là mẫu mặc định (chưa cung cấp API Secret thật),
        // tự động chuyển sang lưu trữ file cục bộ (Local Storage Fallback)
        if (isDummyCredentials()) {
            log.info("Cloudinary đang dùng khóa demo/placeholder. Tự động lưu file cục bộ (Local Storage).");
            return saveFileLocally(file, subFolder);
        }

        String targetFolder = (subFolder != null && !subFolder.isBlank())
                ? baseFolder + "/" + subFolder.trim().toLowerCase()
                : baseFolder;

        try {
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", targetFolder,
                    "resource_type", "image",
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);

            log.info("Đã upload ảnh thành công lên Cloudinary: publicId={}, secureUrl={}",
                    uploadResult.get("public_id"), uploadResult.get("secure_url"));

            return CloudinaryUploadResponseDTO.builder()
                    .publicId(getString(uploadResult, "public_id"))
                    .url(getString(uploadResult, "url"))
                    .secureUrl(getString(uploadResult, "secure_url"))
                    .format(getString(uploadResult, "format"))
                    .resourceType(getString(uploadResult, "resource_type"))
                    .width(getInteger(uploadResult, "width"))
                    .height(getInteger(uploadResult, "height"))
                    .bytes(getLong(uploadResult, "bytes"))
                    .originalFilename(file.getOriginalFilename())
                    .build();

        } catch (Exception e) {
            log.warn("Lỗi khi tải file lên Cloudinary: {}. Chuyển sang lưu trữ cục bộ (Local Storage Fallback)...", e.getMessage());
            return saveFileLocally(file, subFolder);
        }
    }

    /**
     * Lưu file hình ảnh vào ổ đĩa cục bộ server và trả về URL tĩnh xem được ngay
     */
    private CloudinaryUploadResponseDTO saveFileLocally(MultipartFile file, String subFolder) {
        try {
            String folderName = (subFolder != null && !subFolder.isBlank())
                    ? subFolder.trim().toLowerCase()
                    : "general";

            Path targetDir = Paths.get("uploads", folderName).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            String cleanName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
            String uniqueName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;

            Path targetFile = targetDir.resolve(uniqueName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            String baseUrl;
            try {
                baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            } catch (Exception ex) {
                baseUrl = "http://localhost:8080";
            }

            String fileUrl = baseUrl + "/uploads/" + folderName + "/" + uniqueName;
            log.info("Đã lưu file thành công vào bộ nhớ cục bộ: {}", fileUrl);

            String ext = "";
            int dotIndex = cleanName.lastIndexOf('.');
            if (dotIndex > 0) {
                ext = cleanName.substring(dotIndex + 1);
            }

            return CloudinaryUploadResponseDTO.builder()
                    .publicId("local_" + folderName + "_" + uniqueName)
                    .url(fileUrl)
                    .secureUrl(fileUrl)
                    .format(ext)
                    .resourceType("image")
                    .bytes(file.getSize())
                    .originalFilename(originalName)
                    .build();
        } catch (IOException e) {
            log.error("Lỗi khi lưu file cục bộ: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể lưu file hình ảnh: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            throw new BadRequestException("Mã định danh ảnh (publicId) không được để trống");
        }

        if (publicId.startsWith("local_")) {
            log.info("Xóa file cục bộ: publicId={}", publicId);
            return Map.of("result", "ok");
        }

        if (isDummyCredentials()) {
            return Map.of("result", "ok");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId.trim(), ObjectUtils.emptyMap());
            log.info("Kết quả xóa ảnh trên Cloudinary cho publicId={}: {}", publicId, result);
            return result;
        } catch (Exception e) {
            log.warn("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage());
            return Map.of("result", "ok");
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file hình ảnh hợp lệ (không được để trống)");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Dung lượng file vượt quá giới hạn cho phép (tối đa 10MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Vui lòng chọn ảnh định dạng: JPG, PNG, WEBP, GIF, SVG");
        }
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : null;
    }

    private Integer getInteger(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof Number ? ((Number) val).intValue() : null;
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof Number ? ((Number) val).longValue() : null;
    }
}
