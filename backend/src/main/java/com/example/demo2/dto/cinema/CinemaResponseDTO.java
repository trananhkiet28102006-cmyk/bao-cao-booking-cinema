package com.example.demo2.dto.cinema;

import com.example.demo2.dto.cinemaroom.CinemaRoomResponseDTO;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String district;
    private String email;
    private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<CinemaRoomResponseDTO> rooms;
    private LocalDateTime createdAt;
}
