package com.example.demo2.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieReviewsSummaryDTO {
    private Long movieId;
    private String movieTitle;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewResponseDTO> reviews;
}
