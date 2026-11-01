package com.example.demo2.service;

import com.example.demo2.dto.review.MovieReviewsSummaryDTO;
import com.example.demo2.dto.review.ReviewRequestDTO;
import com.example.demo2.dto.review.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    ReviewResponseDTO createOrUpdateReview(Long movieId, ReviewRequestDTO dto);

    MovieReviewsSummaryDTO getMovieReviews(Long movieId);

    List<ReviewResponseDTO> getAllReviewsForAdmin(Long movieId, String status);

    ReviewResponseDTO updateReviewStatus(Long reviewId, String status);

    void deleteReview(Long reviewId);
}
