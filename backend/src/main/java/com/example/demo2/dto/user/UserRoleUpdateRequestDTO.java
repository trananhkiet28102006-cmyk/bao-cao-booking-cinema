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
public class UserRoleUpdateRequestDTO {

    @NotBlank(message = "Vai trò không được để trống")
    private String role; // CUSTOMER, STAFF, ADMIN
}
