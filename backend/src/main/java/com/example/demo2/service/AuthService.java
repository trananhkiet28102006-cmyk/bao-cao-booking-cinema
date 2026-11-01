package com.example.demo2.service;

import com.example.demo2.dto.auth.*;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO dto);

    AuthResponseDTO login(LoginRequestDTO dto);

    UserProfileDTO getCurrentProfile();

    void changePassword(ChangePasswordRequestDTO dto);
}
