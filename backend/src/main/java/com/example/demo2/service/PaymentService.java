package com.example.demo2.service;

import com.example.demo2.dto.payment.*;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    PaymentAttemptResponseDTO processPayment(PaymentRequestDTO dto);

    List<PaymentAttemptResponseDTO> getPaymentAttemptsByBooking(Long bookingId);

    RefundResponseDTO requestRefund(RefundRequestDTO dto);

    RefundResponseDTO processRefund(Long refundId, RefundProcessRequestDTO dto);

    List<RefundResponseDTO> getAllRefunds(String status);

    List<RefundResponseDTO> getRefundsByBooking(Long bookingId);

    List<LoyaltyTransactionResponseDTO> getLoyaltyTransactionsByUser(Long userId);

    // Tích hợp cổng thanh toán ZaloPay Sandbox OpenAPI v2
    ZaloPayCreateOrderResponseDTO createZaloPayOrder(Long bookingId);

    ZaloPayQueryStatusResponseDTO queryZaloPayStatus(String appTransId);

    Map<String, Object> handleZaloPayCallback(ZaloPayCallbackRequestDTO callbackDto);

    String handleZaloPayReturnHtml(Map<String, String> params);
}
