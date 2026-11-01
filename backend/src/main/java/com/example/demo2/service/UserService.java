package com.example.demo2.service;

import com.example.demo2.dto.auth.UserProfileDTO;
import com.example.demo2.dto.loyalty.LoyaltySummaryDTO;
import com.example.demo2.dto.user.UpdateProfileRequestDTO;
import com.example.demo2.dto.user.UserRoleUpdateRequestDTO;
import com.example.demo2.dto.user.UserStatusUpdateRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserProfileDTO updateMyProfile(UpdateProfileRequestDTO dto);

    LoyaltySummaryDTO getMyLoyaltySummary();

    Page<UserProfileDTO> getAllUsers(String role, String status, String keyword, Pageable pageable);

    UserProfileDTO getUserById(Long id);

    UserProfileDTO updateUserStatus(Long id, UserStatusUpdateRequestDTO dto);

    UserProfileDTO updateUserRole(Long id, UserRoleUpdateRequestDTO dto);
}
