package com.example.demo2.mapper;

import com.example.demo2.dto.review.ReviewResponseDTO;
import com.example.demo2.entity.Review;

public class ReviewMapper {

    public static ReviewResponseDTO toResponseDTO(Review review) {
        if (review == null) return null;

        return ReviewResponseDTO.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : null)
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .movieId(review.getMovie() != null ? review.getMovie().getId() : null)
                .movieTitle(review.getMovie() != null ? review.getMovie().getTitle() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
