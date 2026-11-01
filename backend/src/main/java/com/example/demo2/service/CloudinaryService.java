package com.example.demo2.service;

import com.example.demo2.dto.upload.CloudinaryUploadResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    CloudinaryUploadResponseDTO uploadImage(MultipartFile file, String subFolder);

    Map<String, Object> deleteImage(String publicId);
}
