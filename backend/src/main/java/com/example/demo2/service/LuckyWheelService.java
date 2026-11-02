package com.example.demo2.service;

import com.example.demo2.dto.luckywheel.PrizeResponseDTO;
import com.example.demo2.dto.luckywheel.SpinHistoryDTO;
import com.example.demo2.dto.luckywheel.SpinResultDTO;

import java.util.List;

public interface LuckyWheelService {
    List<PrizeResponseDTO> getPrizes();
    SpinResultDTO spinWheel();
    List<SpinHistoryDTO> getMyHistory();
}
