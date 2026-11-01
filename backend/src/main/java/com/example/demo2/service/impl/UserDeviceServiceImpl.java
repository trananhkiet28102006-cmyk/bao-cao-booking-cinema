package com.example.demo2.service.impl;

import com.example.demo2.dto.userdevice.UserDeviceRequestDTO;
import com.example.demo2.dto.userdevice.UserDeviceResponseDTO;
import com.example.demo2.entity.User;
import com.example.demo2.entity.UserDevice;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.repository.UserDeviceRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.UserDeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDeviceServiceImpl implements UserDeviceService {

    private final UserDeviceRepository userDeviceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDeviceResponseDTO registerDevice(UserDeviceRequestDTO dto) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        String token = dto.getDeviceToken().trim();
        Optional<UserDevice> existing = userDeviceRepository.findByUserIdAndDeviceToken(currentUserId, token);

        UserDevice device;
        if (existing.isPresent()) {
            device = existing.get();
            device.setPlatform(dto.getPlatform());
            device.setDeviceName(dto.getDeviceName());
            device.setIsActive(true);
            device.setLastActiveAt(LocalDateTime.now());
        } else {
            device = UserDevice.builder()
                    .user(user)
                    .deviceToken(token)
                    .platform(dto.getPlatform())
                    .deviceName(dto.getDeviceName())
                    .isActive(true)
                    .lastActiveAt(LocalDateTime.now())
                    .build();
        }

        UserDevice saved = userDeviceRepository.save(device);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void deactivateDevice(String deviceToken) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        userDeviceRepository.findByUserIdAndDeviceToken(currentUserId, deviceToken.trim())
                .ifPresent(d -> {
                    d.setIsActive(false);
                    d.setLastActiveAt(LocalDateTime.now());
                    userDeviceRepository.save(d);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDeviceResponseDTO> getMyDevices() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return userDeviceRepository.findByUserIdOrderByLastActiveAtDesc(currentUserId).stream()
                .map(this::toDTO)
                .toList();
    }

    private UserDeviceResponseDTO toDTO(UserDevice d) {
        return UserDeviceResponseDTO.builder()
                .id(d.getId())
                .userId(d.getUser() != null ? d.getUser().getId() : null)
                .deviceToken(d.getDeviceToken())
                .platform(d.getPlatform())
                .deviceName(d.getDeviceName())
                .isActive(d.getIsActive())
                .lastActiveAt(d.getLastActiveAt())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
