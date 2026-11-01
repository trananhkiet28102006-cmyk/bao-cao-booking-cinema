package com.example.demo2.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Integer loyaltyPoints;
    private String memberTier;
    private String status;
    private LocalDateTime createdAt;
}
