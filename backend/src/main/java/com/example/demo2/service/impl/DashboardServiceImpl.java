package com.example.demo2.service.impl;

import com.example.demo2.dto.dashboard.DashboardSummaryDTO;
import com.example.demo2.dto.dashboard.TopMovieDTO;
import com.example.demo2.repository.BookingRepository;
import com.example.demo2.repository.TicketRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        BigDecimal totalRevenue = bookingRepository.sumTotalRevenue();
        BigDecimal todayRevenue = bookingRepository.sumRevenueSince(startOfToday);
        BigDecimal thisMonthRevenue = bookingRepository.sumRevenueSince(startOfMonth);

        long totalBookings = bookingRepository.count();
        long paidBookings = bookingRepository.countByPaymentStatus("paid");
        long cancelledBookings = bookingRepository.countByStatus("cancelled");
        long totalTicketsSold = ticketRepository.countPaidTickets();
        long totalCustomers = userRepository.countByRole(SecurityUtils.ROLE_CUSTOMER);

        List<Object[]> topMovieRows = ticketRepository.findTopSellingMovies(PageRequest.of(0, 5));
        List<TopMovieDTO> topMovies = topMovieRows.stream().map(row -> TopMovieDTO.builder()
                .movieId((Long) row[0])
                .title((String) row[1])
                .posterUrl((String) row[2])
                .ticketsSold((Long) row[3])
                .revenue((BigDecimal) row[4])
                .build()
        ).toList();

        List<Object[]> methodRows = bookingRepository.sumRevenueByPaymentMethod();
        Map<String, BigDecimal> revenueByPaymentMethod = new HashMap<>();
        for (Object[] row : methodRows) {
            String method = row[0] != null ? row[0].toString() : "UNKNOWN";
            BigDecimal amount = (BigDecimal) row[1];
            revenueByPaymentMethod.put(method, amount);
        }

        return DashboardSummaryDTO.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .thisMonthRevenue(thisMonthRevenue != null ? thisMonthRevenue : BigDecimal.ZERO)
                .totalBookings(totalBookings)
                .paidBookings(paidBookings)
                .cancelledBookings(cancelledBookings)
                .totalTicketsSold(totalTicketsSold)
                .totalCustomers(totalCustomers)
                .topMovies(topMovies)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .build();
    }
}
