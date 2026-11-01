package com.example.demo2.service.impl;

import com.example.demo2.dto.ticketpricerule.*;
import com.example.demo2.entity.Cinema;
import com.example.demo2.entity.Showtime;
import com.example.demo2.entity.TicketPriceRule;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.TicketPriceRuleMapper;
import com.example.demo2.repository.CinemaRepository;
import com.example.demo2.repository.HolidayRepository;
import com.example.demo2.repository.ShowtimeRepository;
import com.example.demo2.repository.TicketPriceRuleRepository;
import com.example.demo2.service.TicketPriceRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketPriceRuleServiceImpl implements TicketPriceRuleService {

    private final TicketPriceRuleRepository ruleRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeRepository showtimeRepository;
    private final HolidayRepository holidayRepository;

    @Override
    @Transactional
    public TicketPriceRuleResponseDTO createRule(TicketPriceRuleRequestDTO dto) {
        Cinema cinema = null;
        if (dto.getCinemaId() != null) {
            cinema = cinemaRepository.findById(dto.getCinemaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cinema", "id", dto.getCinemaId()));
        }

        TicketPriceRule rule = TicketPriceRuleMapper.toEntity(dto, cinema);
        TicketPriceRule saved = ruleRepository.save(rule);
        return TicketPriceRuleMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public TicketPriceRuleResponseDTO updateRule(Long id, TicketPriceRuleRequestDTO dto) {
        TicketPriceRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketPriceRule", "id", id));

        Cinema cinema = null;
        if (dto.getCinemaId() != null) {
            cinema = cinemaRepository.findById(dto.getCinemaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cinema", "id", dto.getCinemaId()));
        }

        TicketPriceRuleMapper.updateEntity(rule, dto, cinema);
        TicketPriceRule updated = ruleRepository.save(rule);
        return TicketPriceRuleMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketPriceRuleResponseDTO getRuleById(Long id) {
        TicketPriceRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketPriceRule", "id", id));
        return TicketPriceRuleMapper.toResponseDTO(rule);
    }

    @Override
    @Transactional
    public void deleteRule(Long id) {
        TicketPriceRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketPriceRule", "id", id));
        ruleRepository.delete(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketPriceRuleResponseDTO> getAllRules(Long cinemaId) {
        List<TicketPriceRule> list = cinemaId != null
                ? ruleRepository.findByCinemaId(cinemaId)
                : ruleRepository.findAll();
        return list.stream()
                .map(TicketPriceRuleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponseDTO calculatePrice(PriceCalculationRequestDTO dto) {
        Showtime showtime = showtimeRepository.findById(dto.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", dto.getShowtimeId()));

        String seatType = dto.getSeatType() != null ? dto.getSeatType().trim().toLowerCase() : "standard";
        String customerType = dto.getCustomerType() != null ? dto.getCustomerType().trim().toLowerCase() : "adult";

        Long cinemaId = showtime.getCinemaRoom() != null && showtime.getCinemaRoom().getCinema() != null
                ? showtime.getCinemaRoom().getCinema().getId()
                : null;

        String screenType = showtime.getScreenFormat() != null ? showtime.getScreenFormat() : "2D";

        // 1. Xác định DayType (weekday, weekend, holiday)
        String dayType = determineDayType(showtime.getShowDate());

        // 2. Xác định TimeSlot (morning, regular, evening)
        String timeSlot = determineTimeSlot(showtime.getStartTime());

        // 3. Tìm các quy tắc giá phù hợp
        List<TicketPriceRule> matchingRules = ruleRepository.findMatchingRules(
                cinemaId, screenType, seatType, dayType, timeSlot, customerType);

        TicketPriceRule selectedRule = selectBestMatchingRule(matchingRules, cinemaId, screenType, seatType, dayType, timeSlot);

        BigDecimal finalPrice;
        Long appliedRuleId = null;
        String message;

        if (selectedRule != null) {
            finalPrice = selectedRule.getPrice();
            appliedRuleId = selectedRule.getId();
            message = String.format("Áp dụng quy tắc giá #%d: [Phòng: %s | Ghế: %s | Ngày: %s | Giờ: %s | Đối tượng: %s]",
                    selectedRule.getId(), screenType, seatType, dayType, timeSlot, customerType);
        } else {
            // Giá mặc định nếu chưa cấu hình rule
            finalPrice = computeDefaultPrice(screenType, seatType, dayType, timeSlot, customerType);
            message = String.format("Áp dụng bảng giá mặc định tiêu chuẩn: [Phòng: %s | Ghế: %s | Ngày: %s | Giờ: %s]",
                    screenType, seatType, dayType, timeSlot);
        }

        return PriceCalculationResponseDTO.builder()
                .showtimeId(showtime.getId())
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .screenType(screenType)
                .seatType(seatType)
                .customerType(customerType)
                .dayType(dayType)
                .timeSlot(timeSlot)
                .finalPrice(finalPrice)
                .appliedRuleId(appliedRuleId)
                .message(message)
                .build();
    }

    private String determineDayType(LocalDate date) {
        if (date == null) return "weekday";
        if (holidayRepository.findByHolidayDate(date).isPresent()) {
            return "holiday";
        }
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return "weekend";
        }
        return "weekday";
    }

    private String determineTimeSlot(LocalTime time) {
        if (time == null) return "regular";
        if (time.isBefore(LocalTime.of(12, 0))) {
            return "morning";
        } else if (time.isAfter(LocalTime.of(18, 0))) {
            return "evening";
        } else {
            return "regular";
        }
    }

    private TicketPriceRule selectBestMatchingRule(List<TicketPriceRule> rules, Long cinemaId,
                                                  String screenType, String seatType,
                                                  String dayType, String timeSlot) {
        if (rules == null || rules.isEmpty()) return null;

        // Ưu tiên theo điểm số độ khớp chi tiết (càng chỉ định cụ thể càng ưu tiên cao)
        return rules.stream()
                .max(Comparator.comparingInt(r -> {
                    int score = 0;
                    if (r.getCinema() != null && r.getCinema().getId().equals(cinemaId)) score += 32;
                    if (r.getScreenType() != null && r.getScreenType().equalsIgnoreCase(screenType)) score += 16;
                    if (r.getSeatType() != null && r.getSeatType().equalsIgnoreCase(seatType)) score += 8;
                    if (r.getDayType() != null && r.getDayType().equalsIgnoreCase(dayType)) score += 4;
                    if (r.getTimeSlot() != null && r.getTimeSlot().equalsIgnoreCase(timeSlot)) score += 2;
                    return score;
                }))
                .orElse(rules.get(0));
    }

    private BigDecimal computeDefaultPrice(String screenType, String seatType, String dayType,
                                           String timeSlot, String customerType) {
        BigDecimal base = new BigDecimal("80000.00"); // Giá gốc 2D ngày thường

        if ("3D".equalsIgnoreCase(screenType)) {
            base = base.add(new BigDecimal("30000.00"));
        } else if ("IMAX".equalsIgnoreCase(screenType)) {
            base = base.add(new BigDecimal("60000.00"));
        }

        if ("vip".equalsIgnoreCase(seatType)) {
            base = base.add(new BigDecimal("15000.00"));
        } else if ("couple".equalsIgnoreCase(seatType)) {
            base = base.add(new BigDecimal("50000.00"));
        }

        if ("weekend".equalsIgnoreCase(dayType)) {
            base = base.add(new BigDecimal("15000.00"));
        } else if ("holiday".equalsIgnoreCase(dayType)) {
            base = base.add(new BigDecimal("25000.00"));
        }

        if ("morning".equalsIgnoreCase(timeSlot)) {
            base = base.subtract(new BigDecimal("10000.00"));
        }

        if ("student".equalsIgnoreCase(customerType) || "child".equalsIgnoreCase(customerType)) {
            base = base.multiply(new BigDecimal("0.85")); // Giảm 15% cho học sinh / trẻ em
        }

        return base;
    }
}
