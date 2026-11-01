package com.example.demo2.service.impl;

import com.example.demo2.dto.review.MovieReviewsSummaryDTO;
import com.example.demo2.dto.review.ReviewRequestDTO;
import com.example.demo2.dto.review.ReviewResponseDTO;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.Review;
import com.example.demo2.entity.User;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.ReviewMapper;
import com.example.demo2.repository.MovieRepository;
import com.example.demo2.repository.ReviewRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponseDTO createOrUpdateReview(Long movieId, ReviewRequestDTO dto) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", movieId));

        Optional<Review> existingOpt = reviewRepository.findByMovieIdAndUserId(movieId, currentUserId);
        Review review;
        if (existingOpt.isPresent()) {
            review = existingOpt.get();
            review.setRating(dto.getRating());
            review.setComment(dto.getComment().trim());
            // Giữ status hiện tại hoặc chuyển pending nếu đã bị ẩn
            if ("hidden".equalsIgnoreCase(review.getStatus())) {
                review.setStatus("approved");
            }
        } else {
            review = Review.builder()
                    .user(user)
                    .movie(movie)
                    .rating(dto.getRating())
                    .comment(dto.getComment().trim())
                    .status("approved")
                    .build();
        }

        Review saved = reviewRepository.save(review);
        return ReviewMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieReviewsSummaryDTO getMovieReviews(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", movieId));

        List<Review> approvedReviews = reviewRepository.findByMovieIdAndStatusOrderByCreatedAtDesc(movieId, "approved");
        Double avg = reviewRepository.getAverageRatingByMovieId(movieId);
        Long total = reviewRepository.countApprovedByMovieId(movieId);

        Double roundedAvg = avg != null
                ? BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        List<ReviewResponseDTO> reviewDTOs = approvedReviews.stream()
                .map(ReviewMapper::toResponseDTO)
                .collect(Collectors.toList());

        return MovieReviewsSummaryDTO.builder()
                .movieId(movie.getId())
                .movieTitle(movie.getTitle())
                .averageRating(roundedAvg)
                .totalReviews(total != null ? total : 0L)
                .reviews(reviewDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getAllReviewsForAdmin(Long movieId, String status) {
        List<Review> list;
        if (movieId != null && status != null && !status.isBlank()) {
            list = reviewRepository.findByMovieIdAndStatusOrderByCreatedAtDesc(movieId, status.trim().toLowerCase());
        } else if (movieId != null) {
            list = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
        } else {
            list = reviewRepository.findAll();
        }

        return list.stream()
                .map(ReviewMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewResponseDTO updateReviewStatus(Long reviewId, String status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        String normalizedStatus = status.trim().toLowerCase();
        if (!"approved".equals(normalizedStatus) && !"hidden".equals(normalizedStatus) && !"pending".equals(normalizedStatus)) {
            throw new BadRequestException("Trạng thái đánh giá chỉ nhận 'approved', 'hidden' hoặc 'pending'");
        }

        review.setStatus(normalizedStatus);
        Review saved = reviewRepository.save(review);
        return ReviewMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isOwner = review.getUser() != null && currentUserId.equals(review.getUser().getId());
        boolean isAdmin = SecurityUtils.isStaffOrAdmin();

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xóa đánh giá của người khác");
        }

        reviewRepository.delete(review);
    }
}
