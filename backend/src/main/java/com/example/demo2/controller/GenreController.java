package com.example.demo2.controller;

import com.example.demo2.dto.ApiResponse;
import com.example.demo2.dto.genre.GenreRequestDTO;
import com.example.demo2.dto.genre.GenreResponseDTO;
import com.example.demo2.service.GenreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genres")
@RequiredArgsConstructor
@Tag(name = "Genre", description = "Quản lý thể loại phim")
public class GenreController {

    private final GenreService genreService;

    @PostMapping
    @Operation(summary = "Tạo thể loại mới")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> createGenre(@Valid @RequestBody GenreRequestDTO dto) {
        GenreResponseDTO result = genreService.createGenre(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Tạo thể loại thành công"));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả thể loại")
    public ResponseEntity<ApiResponse<List<GenreResponseDTO>>> getAllGenres() {
        List<GenreResponseDTO> list = genreService.getAllGenres();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách thể loại thành công"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết thể loại theo ID")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> getGenreById(@PathVariable Long id) {
        GenreResponseDTO result = genreService.getGenreById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Lấy thông tin thể loại thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin thể loại")
    public ResponseEntity<ApiResponse<GenreResponseDTO>> updateGenre(
            @PathVariable Long id,
            @Valid @RequestBody GenreRequestDTO dto) {
        GenreResponseDTO result = genreService.updateGenre(id, dto);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật thể loại thành công"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thể loại")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thể loại thành công"));
    }
}
