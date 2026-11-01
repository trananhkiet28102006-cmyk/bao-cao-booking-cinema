package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.movie.MovieDetailResponseDTO;
import com.example.demo2.dto.movie.MovieRequestDTO;
import com.example.demo2.dto.movie.MovieResponseDTO;
import com.example.demo2.dto.moviecast.MovieCastRequestDTO;
import com.example.demo2.dto.moviecast.MovieCastResponseDTO;
import com.example.demo2.service.MovieCastService;
import com.example.demo2.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
@Tag(name = "Movie", description = "Quản lý phim và diễn viên")
public class MovieController {

    private final MovieService movieService;
    private final MovieCastService movieCastService;

    @PostMapping
    @Operation(summary = "Tạo phim mới")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> createMovie(@Valid @RequestBody MovieRequestDTO dto) {
        MovieResponseDTO result = movieService.createMovie(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo phim mới thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách phim (hỗ trợ filter status và tìm kiếm keyword)")
    public ResponseEntity<ApiResponse<List<MovieResponseDTO>>> getAllMovies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        List<MovieResponseDTO> list = movieService.getAllMovies(status, keyword);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách phim thành công"));
    }

    @GetMapping("/now-showing")
    @Operation(summary = "Lấy danh sách phim đang chiếu")
    public ResponseEntity<ApiResponse<List<MovieResponseDTO>>> getNowShowingMovies() {
        List<MovieResponseDTO> list = movieService.getNowShowingMovies();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách phim đang chiếu thành công"));
    }

    @GetMapping("/coming-soon")
    @Operation(summary = "Lấy danh sách phim sắp chiếu")
    public ResponseEntity<ApiResponse<List<MovieResponseDTO>>> getComingSoonMovies() {
        List<MovieResponseDTO> list = movieService.getComingSoonMovies();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách phim sắp chiếu thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết phim (kèm thể loại & diễn viên)")
    public ResponseEntity<ApiResponse<MovieDetailResponseDTO>> getMovieDetail(@PathVariable Long id) {
        MovieDetailResponseDTO result = movieService.getMovieDetail(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy chi tiết phim thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin phim")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieRequestDTO dto) {
        MovieResponseDTO result = movieService.updateMovie(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật phim thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phim")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phim thành công"));
    }

    // --- Cast endpoints ---

    @PostMapping("/{movieId}/casts")
    @Operation(summary = "Thêm diễn viên/đạo diễn vào phim")
    public ResponseEntity<ApiResponse<MovieCastResponseDTO>> addCast(
            @PathVariable Long movieId,
            @Valid @RequestBody MovieCastRequestDTO dto) {
        MovieCastResponseDTO result = movieCastService.addCast(movieId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Thêm diễn viên thành công"));
    }

    @GetMapping("/{movieId}/casts")
    @Operation(summary = "Lấy danh sách diễn viên của phim")
    public ResponseEntity<ApiResponse<List<MovieCastResponseDTO>>> getCastsByMovie(@PathVariable Long movieId) {
        List<MovieCastResponseDTO> list = movieCastService.getCastsByMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách diễn viên thành công"));
    }

    @PutMapping("/{movieId}/casts/{castId}")
    @Operation(summary = "Cập nhật thông tin diễn viên")
    public ResponseEntity<ApiResponse<MovieCastResponseDTO>> updateCast(
            @PathVariable Long movieId,
            @PathVariable Long castId,
            @Valid @RequestBody MovieCastRequestDTO dto) {
        MovieCastResponseDTO result = movieCastService.updateCast(castId, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật diễn viên thành công"));
    }

    @DeleteMapping("/{movieId}/casts/{castId}")
    @Operation(summary = "Xóa diễn viên khỏi phim")
    public ResponseEntity<ApiResponse<Void>> deleteCast(
            @PathVariable Long movieId,
            @PathVariable Long castId) {
        movieCastService.deleteCast(castId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa diễn viên thành công"));
    }
}
