package com.example.demo2.service;

import com.example.demo2.dto.ticketpricerule.*;

import java.util.List;

public interface TicketPriceRuleService {

    TicketPriceRuleResponseDTO createRule(TicketPriceRuleRequestDTO dto);

    TicketPriceRuleResponseDTO updateRule(Long id, TicketPriceRuleRequestDTO dto);

    TicketPriceRuleResponseDTO getRuleById(Long id);

    void deleteRule(Long id);

    List<TicketPriceRuleResponseDTO> getAllRules(Long cinemaId);

    PriceCalculationResponseDTO calculatePrice(PriceCalculationRequestDTO dto);
}
