package com.example.demo2.dto.fnb;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FnbItemRequestDTO {

    @NotBlank(message = "Tên món bắp nước không được để trống")
    @Schema(description = "Tên món bắp nước / combo", example = "Combo Bắp Phô Mai & Coca")
    private String itemName;

    @Schema(description = "Danh mục (popcorn, drink, combo)", example = "combo")
    private String category;

    @Schema(description = "Mô tả chi tiết", example = "1 bắp phô mai cỡ lớn + 1 ly Coca Cola 32oz")
    private String description;

    @Schema(description = "URL hình ảnh sản phẩm", example = "https://images.unsplash.com/photo-1585647347483-22b66260dfff")
    private String imageUrl;

    @NotNull(message = "Giá gốc không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá gốc phải lớn hơn 0")
    @Schema(description = "Giá gốc (VNĐ)", example = "89000.00")
    private BigDecimal basePrice;

    @Builder.Default
    @Schema(description = "Trạng thái kinh doanh (true/false)", example = "true")
    private Boolean isActive = true;
}
