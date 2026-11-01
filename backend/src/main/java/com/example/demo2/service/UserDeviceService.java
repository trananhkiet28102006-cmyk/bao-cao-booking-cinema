package com.example.demo2.service;

import com.example.demo2.dto.userdevice.UserDeviceRequestDTO;
import com.example.demo2.dto.userdevice.UserDeviceResponseDTO;

import java.util.List;

public interface UserDeviceService {

    UserDeviceResponseDTO registerDevice(UserDeviceRequestDTO dto);

    void deactivateDevice(String deviceToken);

    List<UserDeviceResponseDTO> getMyDevices();
}
