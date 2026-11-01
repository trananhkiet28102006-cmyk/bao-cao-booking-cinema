package com.example.demo2.service;

import com.example.demo2.dto.fnb.FnbItemRequestDTO;
import com.example.demo2.dto.fnb.FnbItemResponseDTO;

import java.util.List;

public interface FnbItemService {

    FnbItemResponseDTO createFnbItem(FnbItemRequestDTO dto);

    FnbItemResponseDTO updateFnbItem(Long id, FnbItemRequestDTO dto);

    FnbItemResponseDTO getFnbItemById(Long id);

    void deleteFnbItem(Long id);

    List<FnbItemResponseDTO> getFnbItems(String category, Boolean activeOnly);
}
