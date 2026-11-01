package com.example.demo2.service.impl;

import com.example.demo2.dto.holiday.HolidayRequestDTO;
import com.example.demo2.dto.holiday.HolidayResponseDTO;
import com.example.demo2.entity.Holiday;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.HolidayMapper;
import com.example.demo2.repository.HolidayRepository;
import com.example.demo2.service.HolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository holidayRepository;

    @Override
    @Transactional
    public HolidayResponseDTO createHoliday(HolidayRequestDTO dto) {
        if (holidayRepository.findByHolidayDate(dto.getHolidayDate()).isPresent()) {
            throw new DuplicateResourceException("Ngày lễ", "holidayDate", dto.getHolidayDate());
        }
        Holiday holiday = HolidayMapper.toEntity(dto);
        return HolidayMapper.toResponseDTO(holidayRepository.save(holiday));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HolidayResponseDTO> getHolidays(Integer year) {
        List<Holiday> holidays;
        if (year != null) {
            holidays = holidayRepository.findByYear(year);
        } else {
            holidays = holidayRepository.findAll();
        }
        return holidays.stream()
                .map(HolidayMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HolidayResponseDTO getHolidayById(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ngày lễ", "id", id));
        return HolidayMapper.toResponseDTO(holiday);
    }

    @Override
    @Transactional
    public HolidayResponseDTO updateHoliday(Long id, HolidayRequestDTO dto) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ngày lễ", "id", id));

        holidayRepository.findByHolidayDate(dto.getHolidayDate()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new DuplicateResourceException("Ngày lễ", "holidayDate", dto.getHolidayDate());
            }
        });

        HolidayMapper.updateEntity(holiday, dto);
        return HolidayMapper.toResponseDTO(holidayRepository.save(holiday));
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ngày lễ", "id", id));
        holidayRepository.delete(holiday);
    }
}
