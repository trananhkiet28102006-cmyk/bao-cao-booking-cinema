package com.example.demo2.service.impl;

import com.example.demo2.dto.banner.BannerRequestDTO;
import com.example.demo2.dto.banner.BannerResponseDTO;
import com.example.demo2.entity.Banner;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.BannerMapper;
import com.example.demo2.repository.BannerRepository;
import com.example.demo2.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    @Transactional
    public BannerResponseDTO createBanner(BannerRequestDTO dto) {
        Banner banner = BannerMapper.toEntity(dto);
        return BannerMapper.toResponseDTO(bannerRepository.save(banner));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponseDTO> getAllBanners(Boolean isActive) {
        List<Banner> banners;
        if (isActive != null) {
            banners = bannerRepository.findByIsActiveOrderByDisplayOrderAsc(isActive);
        } else {
            banners = bannerRepository.findAll();
        }
        return banners.stream()
                .map(BannerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponseDTO> getActiveBanners() {
        return bannerRepository.findByIsActiveOrderByDisplayOrderAsc(true).stream()
                .map(BannerMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponseDTO getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        return BannerMapper.toResponseDTO(banner);
    }

    @Override
    @Transactional
    public BannerResponseDTO updateBanner(Long id, BannerRequestDTO dto) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));

        BannerMapper.updateEntity(banner, dto);
        return BannerMapper.toResponseDTO(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner", "id", id));
        bannerRepository.delete(banner);
    }
}
