package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.favorite.FavoriteResponseDTO;
import com.example.demo2.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Tag(name = "Favorite", description = "Quản lý danh sách phim yêu thích cá nhân")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/movies/{movieId}")
    @Operation(summary = "Thêm một bộ phim vào danh sách yêu thích của tôi")
    public ResponseEntity<ApiResponse<FavoriteResponseDTO>> addFavorite(@PathVariable Long movieId) {
        FavoriteResponseDTO result = favoriteService.addFavorite(movieId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Đã thêm phim vào danh sách yêu thích"));
    }

    @DeleteMapping("/movies/{movieId}")
    @Operation(summary = "Xóa bộ phim khỏi danh sách yêu thích của tôi")
    public ResponseEntity<ApiResponse<Object>> removeFavorite(@PathVariable Long movieId) {
        favoriteService.removeFavorite(movieId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa phim khỏi danh sách yêu thích"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các bộ phim tôi đã yêu thích")
    public ResponseEntity<ApiResponse<List<FavoriteResponseDTO>>> getMyFavorites() {
        List<FavoriteResponseDTO> list = favoriteService.getMyFavorites();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách phim yêu thích thành công"));
    }

    @GetMapping("/check/{movieId}")
    @Operation(summary = "Kiểm tra xem tôi đã thích bộ phim này chưa")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFavorite(@PathVariable Long movieId) {
        boolean fav = favoriteService.isFavorite(movieId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavorite", fav), "Kiểm tra trạng thái yêu thích thành công"));
    }
}
