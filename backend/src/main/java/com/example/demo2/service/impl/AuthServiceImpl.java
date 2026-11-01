package com.example.demo2.service.impl;

import com.example.demo2.dto.auth.*;
import com.example.demo2.entity.User;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.CustomUserDetails;
import com.example.demo2.security.JwtService;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        String email = dto.getEmail().trim().toLowerCase();
        String phone = dto.getPhone() != null && !dto.getPhone().isBlank() ? dto.getPhone().trim() : null;

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("User", "phone", phone);
        }

        User user = userRepository.save(User.builder()
                .fullName(dto.getFullName().trim())
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(SecurityUtils.ROLE_CUSTOMER) // Đăng ký công khai luôn là CUSTOMER
                .build());

        return buildAuthResponse(new CustomUserDetails(user), user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        // Ném BadCredentialsException / DisabledException / LockedException nếu sai -> GlobalExceptionHandler trả 401
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail().trim().toLowerCase(), dto.getPassword()));

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return buildAuthResponse(principal, user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toProfile(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequestDTO dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        if (dto.getCurrentPassword().equals(dto.getNewPassword())) {
            throw new BadRequestException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }
        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponseDTO buildAuthResponse(CustomUserDetails principal, User user) {
        return AuthResponseDTO.builder()
                .accessToken(jwtService.generateToken(principal))
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationSeconds())
                .user(toProfile(user))
                .build();
    }

    private UserProfileDTO toProfile(User user) {
        return UserProfileDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(CustomUserDetails.normalizeRole(user.getRole()))
                .loyaltyPoints(user.getLoyaltyPoints())
                .memberTier(user.getMemberTier())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
