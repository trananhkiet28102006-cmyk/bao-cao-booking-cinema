package com.example.demo2.service;

import com.example.demo2.dto.holiday.HolidayRequestDTO;
import com.example.demo2.dto.holiday.HolidayResponseDTO;

import java.util.List;

public interface HolidayService {
    HolidayResponseDTO createHoliday(HolidayRequestDTO dto);
    List<HolidayResponseDTO> getHolidays(Integer year);
    HolidayResponseDTO getHolidayById(Long id);
    HolidayResponseDTO updateHoliday(Long id, HolidayRequestDTO dto);
    void deleteHoliday(Long id);
}
