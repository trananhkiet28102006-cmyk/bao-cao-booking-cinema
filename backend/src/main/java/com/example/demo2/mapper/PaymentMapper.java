package com.example.demo2.mapper;

import com.example.demo2.dto.payment.LoyaltyTransactionResponseDTO;
import com.example.demo2.dto.payment.PaymentAttemptResponseDTO;
import com.example.demo2.dto.payment.RefundResponseDTO;
import com.example.demo2.entity.Booking;
import com.example.demo2.entity.LoyaltyTransaction;
import com.example.demo2.entity.PaymentAttempt;
import com.example.demo2.entity.Refund;

public class PaymentMapper {

    public static PaymentAttemptResponseDTO toPaymentDTO(PaymentAttempt pa, Integer pointsEarned) {
        if (pa == null) return null;
        Booking b = pa.getBooking();
        return PaymentAttemptResponseDTO.builder()
                .id(pa.getId())
                .bookingId(b != null ? b.getId() : null)
                .bookingCode(b != null ? b.getBookingCode() : null)
                .bookingStatus(b != null ? b.getStatus() : null)
                .paymentStatus(b != null ? b.getPaymentStatus() : null)
                .paymentMethod(pa.getPaymentMethod())
                .transactionId(pa.getTransactionId())
                .amount(pa.getAmount())
                .status(pa.getStatus())
                .errorCode(pa.getErrorCode())
                .errorMessage(pa.getErrorMessage())
                .gatewayResponse(pa.getGatewayResponse())
                .loyaltyPointsEarned(pointsEarned != null ? pointsEarned : 0)
                .totalLoyaltyPoints(b != null && b.getUser() != null ? b.getUser().getLoyaltyPoints() : null)
                .memberTier(b != null && b.getUser() != null ? b.getUser().getMemberTier() : null)
                .createdAt(pa.getCreatedAt())
                .build();
    }

    public static RefundResponseDTO toRefundDTO(Refund r) {
        if (r == null) return null;
        return RefundResponseDTO.builder()
                .id(r.getId())
                .bookingId(r.getBooking() != null ? r.getBooking().getId() : null)
                .bookingCode(r.getBooking() != null ? r.getBooking().getBookingCode() : null)
                .approvedBy(r.getApprovedBy())
                .refundType(r.getRefundType())
                .refundAmount(r.getRefundAmount())
                .refundMethod(r.getRefundMethod())
                .transactionId(r.getTransactionId())
                .reason(r.getReason())
                .status(r.getStatus())
                .requestedAt(r.getRequestedAt())
                .processedAt(r.getProcessedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public static LoyaltyTransactionResponseDTO toLoyaltyDTO(LoyaltyTransaction lt) {
        if (lt == null) return null;
        return LoyaltyTransactionResponseDTO.builder()
                .id(lt.getId())
                .userId(lt.getUser() != null ? lt.getUser().getId() : null)
                .userFullName(lt.getUser() != null ? lt.getUser().getFullName() : null)
                .memberTier(lt.getUser() != null ? lt.getUser().getMemberTier() : null)
                .bookingId(lt.getBooking() != null ? lt.getBooking().getId() : null)
                .bookingCode(lt.getBooking() != null ? lt.getBooking().getBookingCode() : null)
                .type(lt.getType())
                .points(lt.getPoints())
                .balanceAfter(lt.getBalanceAfter())
                .description(lt.getDescription())
                .createdAt(lt.getCreatedAt())
                .build();
    }
}
