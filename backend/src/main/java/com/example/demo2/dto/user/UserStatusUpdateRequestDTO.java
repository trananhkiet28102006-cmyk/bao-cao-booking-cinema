package com.example.demo2.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequestDTO {

    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // active, banned, inactive
}
