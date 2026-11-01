package com.example.demo2.dto.upload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryUploadResponseDTO {
    private String publicId;
    private String url;
    private String secureUrl;
    private String format;
    private String resourceType;
    private Integer width;
    private Integer height;
    private Long bytes;
    private String originalFilename;
}
