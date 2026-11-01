package com.example.demo2.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopMovieDTO {
    private Long movieId;
    private String title;
    private String posterUrl;
    private Long ticketsSold;
    private BigDecimal revenue;
}
