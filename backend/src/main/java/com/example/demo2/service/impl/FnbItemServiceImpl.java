package com.example.demo2.service.impl;

import com.example.demo2.dto.fnb.FnbItemRequestDTO;
import com.example.demo2.dto.fnb.FnbItemResponseDTO;
import com.example.demo2.entity.FnbItem;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.FnbItemMapper;
import com.example.demo2.repository.FnbItemRepository;
import com.example.demo2.service.FnbItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FnbItemServiceImpl implements FnbItemService {

    private final FnbItemRepository fnbItemRepository;

    @Override
    @Transactional
    public FnbItemResponseDTO createFnbItem(FnbItemRequestDTO dto) {
        FnbItem item = FnbItemMapper.toEntity(dto);
        FnbItem saved = fnbItemRepository.save(item);
        return FnbItemMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional
    public FnbItemResponseDTO updateFnbItem(Long id, FnbItemRequestDTO dto) {
        FnbItem item = fnbItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FnbItem", "id", id));

        FnbItemMapper.updateEntity(item, dto);
        FnbItem updated = fnbItemRepository.save(item);
        return FnbItemMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public FnbItemResponseDTO getFnbItemById(Long id) {
        FnbItem item = fnbItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FnbItem", "id", id));
        return FnbItemMapper.toResponseDTO(item);
    }

    @Override
    @Transactional
    public void deleteFnbItem(Long id) {
        FnbItem item = fnbItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FnbItem", "id", id));
        fnbItemRepository.delete(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FnbItemResponseDTO> getFnbItems(String category, Boolean activeOnly) {
        List<FnbItem> list;
        boolean onlyActive = activeOnly == null || activeOnly;

        if (category != null && !category.isBlank()) {
            list = onlyActive
                    ? fnbItemRepository.findByCategoryAndIsActiveTrue(category.toLowerCase())
                    : fnbItemRepository.findByCategory(category.toLowerCase());
        } else {
            list = onlyActive
                    ? fnbItemRepository.findByIsActiveTrue()
                    : fnbItemRepository.findAll();
        }

        return list.stream()
                .map(FnbItemMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
