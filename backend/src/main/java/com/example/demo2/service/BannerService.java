package com.example.demo2.service;

import com.example.demo2.dto.banner.BannerRequestDTO;
import com.example.demo2.dto.banner.BannerResponseDTO;

import java.util.List;

public interface BannerService {
    BannerResponseDTO createBanner(BannerRequestDTO dto);
    List<BannerResponseDTO> getAllBanners(Boolean isActive);
    List<BannerResponseDTO> getActiveBanners();
    BannerResponseDTO getBannerById(Long id);
    BannerResponseDTO updateBanner(Long id, BannerRequestDTO dto);
    void deleteBanner(Long id);
}
