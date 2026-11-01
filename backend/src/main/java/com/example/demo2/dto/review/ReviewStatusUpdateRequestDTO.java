package com.example.demo2.dto.review;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatusUpdateRequestDTO {

    @NotBlank(message = "Trạng thái kiểm duyệt không được để trống")
    @Schema(description = "Trạng thái: approved, hidden, pending", example = "approved")
    private String status;
}
