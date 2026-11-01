package com.example.demo2.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal thisMonthRevenue;
    private Long totalBookings;
    private Long paidBookings;
    private Long cancelledBookings;
    private Long totalTicketsSold;
    private Long totalCustomers;
    private List<TopMovieDTO> topMovies;
    private Map<String, BigDecimal> revenueByPaymentMethod;
}
