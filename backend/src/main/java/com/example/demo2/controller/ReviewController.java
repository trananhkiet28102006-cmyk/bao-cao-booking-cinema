package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.review.MovieReviewsSummaryDTO;
import com.example.demo2.dto.review.ReviewRequestDTO;
import com.example.demo2.dto.review.ReviewResponseDTO;
import com.example.demo2.dto.review.ReviewStatusUpdateRequestDTO;
import com.example.demo2.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Review", description = "Đánh giá, bình luận phim & kiểm duyệt phản hồi")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/movies/{movieId}/reviews")
    @Operation(summary = "Viết hoặc cập nhật đánh giá (1-5 sao kèm bình luận) cho phim")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> addOrUpdateReview(
            @PathVariable Long movieId,
            @Valid @RequestBody ReviewRequestDTO dto) {
        ReviewResponseDTO result = reviewService.createOrUpdateReview(movieId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Gửi đánh giá phim thành công"));
    }

    @GetMapping("/movies/{movieId}/reviews")
    @SecurityRequirements
    @Operation(summary = "Xem danh sách đánh giá công khai và điểm số trung bình của phim")
    public ResponseEntity<ApiResponse<MovieReviewsSummaryDTO>> getMovieReviews(@PathVariable Long movieId) {
        MovieReviewsSummaryDTO result = reviewService.getMovieReviews(movieId);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy danh sách đánh giá của phim thành công"));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Xóa đánh giá (chính chủ sở hữu hoặc Quản trị viên)")
    public ResponseEntity<ApiResponse<Object>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }

    @GetMapping("/reviews/admin")
    @Operation(summary = "Quản trị: Xem tất cả đánh giá để kiểm duyệt (lọc theo movieId, status)")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getAllReviewsForAdmin(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) String status) {
        List<ReviewResponseDTO> list = reviewService.getAllReviewsForAdmin(movieId, status);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách đánh giá kiểm duyệt thành công"));
    }

    @PatchMapping("/reviews/{id}/status")
    @Operation(summary = "Quản trị: Cập nhật trạng thái kiểm duyệt đánh giá (approved, hidden, pending)")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReviewStatusUpdateRequestDTO dto) {
        ReviewResponseDTO result = reviewService.updateReviewStatus(id, dto.getStatus());
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật trạng thái đánh giá thành công"));
    }
}
