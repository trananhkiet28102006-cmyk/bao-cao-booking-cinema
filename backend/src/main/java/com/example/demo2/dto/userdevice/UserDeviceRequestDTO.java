package com.example.demo2.dto.userdevice;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDeviceRequestDTO {

    @NotBlank(message = "deviceToken không được để trống")
    private String deviceToken;

    private String platform; // iOS, Android, Web

    private String deviceName;
}
