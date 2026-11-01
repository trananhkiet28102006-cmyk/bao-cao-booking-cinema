package com.example.demo2.service.impl;

import com.example.demo2.dto.favorite.FavoriteResponseDTO;
import com.example.demo2.entity.Favorite;
import com.example.demo2.entity.Movie;
import com.example.demo2.entity.User;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.FavoriteMapper;
import com.example.demo2.repository.FavoriteRepository;
import com.example.demo2.repository.MovieRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public FavoriteResponseDTO addFavorite(Long movieId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", "id", movieId));

        if (favoriteRepository.existsByUserIdAndMovieId(currentUserId, movieId)) {
            throw new BadRequestException("Phim '" + movie.getTitle() + "' đã có trong danh sách yêu thích của bạn");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .movie(movie)
                .build();

        Favorite saved = favoriteRepository.save(favorite);
        return FavoriteMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public void removeFavorite(Long movieId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!favoriteRepository.existsByUserIdAndMovieId(currentUserId, movieId)) {
            throw new ResourceNotFoundException("Phim này chưa có trong danh sách yêu thích của bạn");
        }
        favoriteRepository.deleteByUserIdAndMovieId(currentUserId, movieId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteResponseDTO> getMyFavorites() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(FavoriteMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long movieId) {
        return SecurityUtils.findCurrentUser()
                .map(u -> favoriteRepository.existsByUserIdAndMovieId(u.getId(), movieId))
                .orElse(false);
    }
}
