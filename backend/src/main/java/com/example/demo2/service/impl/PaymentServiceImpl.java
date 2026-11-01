package com.example.demo2.service.impl;

import com.example.demo2.config.ZaloPayConfig;
import com.example.demo2.dto.payment.*;
import com.example.demo2.entity.*;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.PaymentMapper;
import com.example.demo2.repository.*;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.NotificationService;
import com.example.demo2.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RefundRepository refundRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final ZaloPayConfig zaloPayConfig;
    private final NotificationService notificationService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Override
    @Transactional
    public PaymentAttemptResponseDTO processPayment(PaymentRequestDTO dto) {
        Booking booking = validateBookingPayable(dto.getBookingId());
        SecurityUtils.checkBookingAccess(booking);

        String method = dto.getPaymentMethod().trim().toUpperCase();
        String txnId = "TXN-" + method + "-" + System.currentTimeMillis();
        boolean isSuccess = dto.getSimulateSuccess() == null || Boolean.TRUE.equals(dto.getSimulateSuccess());

        if (!isSuccess) {
            String errCode = dto.getErrorCode() != null ? dto.getErrorCode() : "PAYMENT_FAILED";
            String errMsg = dto.getErrorMessage() != null ? dto.getErrorMessage() : "Giao dịch thanh toán bị từ chối bởi cổng " + method;

            PaymentAttempt failedAttempt = paymentAttemptRepository.save(PaymentAttempt.builder()
                    .booking(booking)
                    .paymentMethod(method)
                    .transactionId(txnId)
                    .amount(booking.getTotalAmount())
                    .status("failed")
                    .errorCode(errCode)
                    .errorMessage(errMsg)
                    .gatewayResponse("{\"resultCode\":99,\"message\":\"" + errMsg + "\"}")
                    .build());

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(booking)
                    .oldStatus(booking.getStatus())
                    .newStatus(booking.getStatus())
                    .note("Thanh toán thất bại qua " + method + " (Mã GD: " + txnId + "): " + errMsg)
                    .changedBy("PAYMENT_GATEWAY")
                    .build());

            return PaymentMapper.toPaymentDTO(failedAttempt, 0);
        }

        int pointsEarned = confirmBookingPayment(booking, method, txnId);

        PaymentAttempt successAttempt = paymentAttemptRepository.save(PaymentAttempt.builder()
                    .booking(booking)
                    .paymentMethod(method)
                    .transactionId(txnId)
                    .amount(booking.getTotalAmount())
                    .status("success")
                    .gatewayResponse("{\"resultCode\":0,\"message\":\"Giao dịch thành công\",\"transactionId\":\"" + txnId + "\"}")
                    .build());

        return PaymentMapper.toPaymentDTO(successAttempt, pointsEarned);
    }

    @Override
    @Transactional
    public ZaloPayCreateOrderResponseDTO createZaloPayOrder(Long bookingId) {
        Booking booking = validateBookingPayable(bookingId);
        SecurityUtils.checkBookingAccess(booking);

        // Định dạng app_trans_id bắt buộc của ZaloPay: yyMMdd_xxxx (Múi giờ Việt Nam GMT+7)
        String yyMMdd = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("yyMMdd"));
        String appTransId = yyMMdd + "_" + booking.getId() + "_" + (System.currentTimeMillis() % 1000000L);

        long amount = booking.getTotalAmount().setScale(0, RoundingMode.HALF_UP).longValue();
        if (amount < 1000L) {
            amount = 1000L; // ZaloPay yêu cầu tối thiểu 1,000 VNĐ
        }

        long appTime = System.currentTimeMillis();
        String appUser = booking.getContactEmail() != null && !booking.getContactEmail().isBlank()
                ? booking.getContactEmail().trim()
                : "CinemaCustomer";

        String embedData = String.format("{\"redirecturl\":\"%s\",\"preferred_payment_method\":[],\"bookingId\":%d,\"bookingCode\":\"%s\"}",
                zaloPayConfig.getRedirectUrl(), booking.getId(), booking.getBookingCode());

        String itemJson = String.format("[{\"itemid\":\"%s\",\"itemname\":\"Don dat ve xem phim %s\",\"itemprice\":%d,\"itemquantity\":1}]",
                booking.getBookingCode(), booking.getBookingCode(), amount);

        String description = "Cinema Booking - Thanh toan don dat ve " + booking.getBookingCode();

        // Công thức chữ ký HMAC-SHA256 chuẩn ZaloPay v2/create:
        // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        String macData = zaloPayConfig.getAppId() + "|"
                + appTransId + "|"
                + appUser + "|"
                + amount + "|"
                + appTime + "|"
                + embedData + "|"
                + itemJson;

        String mac = ZaloPayConfig.hmacSha256(zaloPayConfig.getKey1(), macData);

        Map<String, String> formParams = new LinkedHashMap<>();
        formParams.put("app_id", String.valueOf(zaloPayConfig.getAppId()));
        formParams.put("app_user", appUser);
        formParams.put("app_time", String.valueOf(appTime));
        formParams.put("amount", String.valueOf(amount));
        formParams.put("app_trans_id", appTransId);
        formParams.put("embed_data", embedData);
        formParams.put("item", itemJson);
        formParams.put("bank_code", "");
        formParams.put("description", description);
        formParams.put("callback_url", zaloPayConfig.getCallbackUrl());
        formParams.put("mac", mac);

        String formBody = buildFormUrlEncoded(formParams);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(zaloPayConfig.getCreateUrl()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            String responseBody = response.body();
            log.info("ZaloPay /v2/create response for {}: {}", appTransId, responseBody);

            Integer returnCode = extractJsonInt(responseBody, "return_code");
            String returnMessage = extractJsonString(responseBody, "return_message");
            Integer subReturnCode = extractJsonInt(responseBody, "sub_return_code");
            String subReturnMessage = extractJsonString(responseBody, "sub_return_message");
            String orderUrl = extractJsonString(responseBody, "order_url");
            String zpTransToken = extractJsonString(responseBody, "zp_trans_token");
            String orderToken = extractJsonString(responseBody, "order_token");
            String qrCode = extractJsonString(responseBody, "qr_code");

            boolean createdOk = returnCode != null && returnCode == 1;

            PaymentAttempt attempt = paymentAttemptRepository.save(PaymentAttempt.builder()
                    .booking(booking)
                    .paymentMethod("ZALOPAY")
                    .transactionId(appTransId)
                    .amount(BigDecimal.valueOf(amount))
                    .status(createdOk ? "pending" : "failed")
                    .errorCode(createdOk ? null : String.valueOf(subReturnCode))
                    .errorMessage(createdOk ? null : subReturnMessage)
                    .gatewayResponse(responseBody)
                    .build());

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(booking)
                    .oldStatus(booking.getStatus())
                    .newStatus(booking.getStatus())
                    .note(createdOk
                            ? "Khởi tạo cổng thanh toán ZaloPay Sandbox thành công (Mã GD: " + appTransId + "). Đang chờ khách thanh toán."
                            : "Khởi tạo giao dịch ZaloPay thất bại: " + returnMessage + " (" + subReturnMessage + ")")
                    .changedBy("ZALOPAY_GATEWAY")
                    .build());

            if (!createdOk) {
                throw new BadRequestException("ZaloPay từ chối tạo đơn thanh toán: " + returnMessage + " - " + subReturnMessage);
            }

            return ZaloPayCreateOrderResponseDTO.builder()
                    .paymentAttemptId(attempt.getId())
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .appTransId(appTransId)
                    .amount(BigDecimal.valueOf(amount))
                    .returnCode(returnCode)
                    .returnMessage(returnMessage)
                    .subReturnCode(subReturnCode)
                    .subReturnMessage(subReturnMessage)
                    .orderUrl(orderUrl)
                    .zpTransToken(zpTransToken)
                    .orderToken(orderToken)
                    .qrCode(qrCode)
                    .status(attempt.getStatus())
                    .createdAt(attempt.getCreatedAt())
                    .build();

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Lỗi kết nối tới cổng thanh toán ZaloPay Sandbox: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ZaloPayQueryStatusResponseDTO queryZaloPayStatus(String appTransId) {
        String trimmedTransId = appTransId.trim();
        PaymentAttempt attempt = paymentAttemptRepository.findByTransactionId(trimmedTransId)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentAttempt (ZaloPay)", "appTransId", trimmedTransId));

        Booking booking = attempt.getBooking();

        // Công thức chữ ký HMAC-SHA256 chuẩn ZaloPay v2/query:
        // app_id|app_trans_id|key1
        String macData = zaloPayConfig.getAppId() + "|" + trimmedTransId + "|" + zaloPayConfig.getKey1();
        String mac = ZaloPayConfig.hmacSha256(zaloPayConfig.getKey1(), macData);

        Map<String, String> formParams = new LinkedHashMap<>();
        formParams.put("app_id", String.valueOf(zaloPayConfig.getAppId()));
        formParams.put("app_trans_id", trimmedTransId);
        formParams.put("mac", mac);

        String formBody = buildFormUrlEncoded(formParams);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(zaloPayConfig.getQueryUrl()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            String responseBody = response.body();
            log.info("ZaloPay /v2/query response for {}: {}", trimmedTransId, responseBody);

            Integer returnCode = extractJsonInt(responseBody, "return_code");
            String returnMessage = extractJsonString(responseBody, "return_message");
            Integer subReturnCode = extractJsonInt(responseBody, "sub_return_code");
            String subReturnMessage = extractJsonString(responseBody, "sub_return_message");
            Boolean isProcessing = extractJsonBoolean(responseBody, "is_processing");
            Long zpTransId = extractJsonLong(responseBody, "zp_trans_id");

            int pointsEarned = 0;

            if (returnCode != null && returnCode == 1) {
                // Giao dịch đã thanh toán thành công trên ZaloPay!
                attempt.setStatus("success");
                attempt.setGatewayResponse(responseBody);
                paymentAttemptRepository.save(attempt);

                if (!"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                    pointsEarned = confirmBookingPayment(booking, "ZALOPAY", trimmedTransId);
                }
            } else if (returnCode != null && returnCode == 2) {
                attempt.setStatus("failed");
                attempt.setErrorCode(String.valueOf(subReturnCode));
                attempt.setErrorMessage(returnMessage + " (" + subReturnMessage + ")");
                attempt.setGatewayResponse(responseBody);
                paymentAttemptRepository.save(attempt);
            }

            User user = booking.getUser();
            return ZaloPayQueryStatusResponseDTO.builder()
                    .bookingId(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .bookingStatus(booking.getStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .appTransId(trimmedTransId)
                    .zpTransId(zpTransId)
                    .amount(attempt.getAmount())
                    .returnCode(returnCode)
                    .returnMessage(returnMessage)
                    .subReturnCode(subReturnCode)
                    .subReturnMessage(subReturnMessage)
                    .isProcessing(isProcessing)
                    .loyaltyPointsEarned(pointsEarned)
                    .totalLoyaltyPoints(user != null ? user.getLoyaltyPoints() : null)
                    .memberTier(user != null ? user.getMemberTier() : null)
                    .build();

        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi truy vấn trạng thái giao dịch ZaloPay: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> handleZaloPayCallback(ZaloPayCallbackRequestDTO callbackDto) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            String dataStr = callbackDto.getData();
            String reqMac = callbackDto.getMac();
            String computedMac = ZaloPayConfig.hmacSha256(zaloPayConfig.getKey2(), dataStr);

            if (!computedMac.equalsIgnoreCase(reqMac)) {
                result.put("return_code", -1);
                result.put("return_message", "mac not equal");
                return result;
            }

            String appTransId = extractJsonString(dataStr, "app_trans_id");
            if (appTransId != null) {
                Optional<PaymentAttempt> attemptOpt = paymentAttemptRepository.findByTransactionId(appTransId);
                if (attemptOpt.isPresent()) {
                    PaymentAttempt attempt = attemptOpt.get();
                    attempt.setStatus("success");
                    attempt.setGatewayResponse(dataStr);
                    paymentAttemptRepository.save(attempt);

                    Booking booking = attempt.getBooking();
                    if (booking != null && !"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                        confirmBookingPayment(booking, "ZALOPAY", appTransId);
                    }
                }
            }

            result.put("return_code", 1);
            result.put("return_message", "success");
        } catch (Exception e) {
            result.put("return_code", 0);
            result.put("return_message", e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public String handleZaloPayReturnHtml(Map<String, String> params) {
        String appTransId = params.getOrDefault("apptransid", "");
        String statusParam = params.getOrDefault("status", "");

        if (appTransId.isBlank()) {
            return buildSimpleHtml("Không tìm thấy mã giao dịch ZaloPay (apptransid)", false, null, null);
        }

        ZaloPayQueryStatusResponseDTO queryResult = null;
        try {
            queryResult = queryZaloPayStatus(appTransId);
        } catch (Exception e) {
            log.warn("Không thể query ZaloPay cho {}: {}", appTransId, e.getMessage());
        }

        Optional<PaymentAttempt> attemptOpt = paymentAttemptRepository.findByTransactionId(appTransId);
        Booking booking = attemptOpt.map(PaymentAttempt::getBooking).orElse(null);

        // Nếu trên URL ZaloPay redirect về báo status=1 thì cũng đảm bảo kích hoạt vé
        if ("1".equals(statusParam) && booking != null && !"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            PaymentAttempt attempt = attemptOpt.get();
            attempt.setStatus("success");
            paymentAttemptRepository.save(attempt);
            confirmBookingPayment(booking, "ZALOPAY", appTransId);
        }

        boolean isPaid = booking != null && "paid".equalsIgnoreCase(booking.getPaymentStatus());
        String title = isPaid
                ? "THANH TOÁN ZALOPAY THÀNH CÔNG!"
                : "GIAO DỊCH ZALOPAY CHƯA HOÀN TẤT / ĐANG XỬ LÝ";

        return buildSimpleHtml(title, isPaid, booking, queryResult);
    }

    private Booking validateBookingPayable(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã bị hủy, không thể thanh toán");
        }

        if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã được thanh toán trước đó");
        }

        if (booking.getHoldExpiresAt() != null && LocalDateTime.now().isAfter(booking.getHoldExpiresAt())) {
            String oldStatus = booking.getStatus();
            booking.setStatus("cancelled");
            booking.setCancelledAt(LocalDateTime.now());
            bookingRepository.save(booking);

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(booking)
                    .oldStatus(oldStatus)
                    .newStatus("cancelled")
                    .note("Tự động hủy đơn do quá thời hạn giữ ghế (5 phút) khi gọi thanh toán")
                    .changedBy("SYSTEM")
                    .build());

            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã hết thời gian giữ ghế (5 phút) và bị hủy tự động");
        }
        return booking;
    }

    private int confirmBookingPayment(Booking booking, String method, String txnId) {
        String oldStatus = booking.getStatus();
        booking.setStatus("confirmed");
        booking.setPaymentStatus("paid");
        booking.setPaymentMethod(method);
        booking.setPaymentTransactionId(txnId);
        booking.setPaidAt(LocalDateTime.now());
        booking.setHoldExpiresAt(null);
        bookingRepository.save(booking);

        int pointsEarned = 0;
        User user = booking.getUser();
        if (user != null && booking.getTotalAmount() != null) {
            pointsEarned = booking.getTotalAmount()
                    .divide(new BigDecimal("1000"), 0, RoundingMode.FLOOR)
                    .intValue();

            if (pointsEarned > 0) {
                int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
                int newBalance = currentPoints + pointsEarned;
                user.setLoyaltyPoints(newBalance);
                user.setMemberTier(determineMemberTier(newBalance));
                userRepository.save(user);

                loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                        .user(user)
                        .booking(booking)
                        .type("earn")
                        .points(pointsEarned)
                        .balanceAfter(newBalance)
                        .description(String.format("Tích +%d điểm thưởng từ đơn đặt vé %s qua %s (Thanh toán: %s VNĐ)",
                                pointsEarned, booking.getBookingCode(), method, booking.getTotalAmount().toPlainString()))
                        .build());
            }
        }

        historyRepository.save(BookingStatusHistory.builder()
                .booking(booking)
                .oldStatus(oldStatus)
                .newStatus("confirmed")
                .note(String.format("Thanh toán thành công qua %s (Mã GD: %s, Số tiền: %s VNĐ, Điểm thưởng cộng: +%d điểm)",
                        method, txnId, booking.getTotalAmount().toPlainString(), pointsEarned))
                .changedBy("PAYMENT_GATEWAY")
                .build());

        if (user != null) {
            try {
                notificationService.sendNotification(
                        user.getId(),
                        "Đặt vé thành công: #" + booking.getBookingCode(),
                        String.format("Đơn hàng #%s đã được thanh toán thành công qua %s (%s VNĐ). Chúc bạn xem phim vui vẻ!",
                                booking.getBookingCode(), method, booking.getTotalAmount().toPlainString()),
                        "booking",
                        "in_app"
                );
            } catch (Exception ex) {
                log.warn("Không thể gửi thông báo đặt vé thành công cho user {}: {}", user.getId(), ex.getMessage());
            }
        }

        return pointsEarned;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentAttemptResponseDTO> getPaymentAttemptsByBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        SecurityUtils.checkBookingAccess(booking);

        return paymentAttemptRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(pa -> PaymentMapper.toPaymentDTO(pa, 0))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RefundResponseDTO requestRefund(RefundRequestDTO dto) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", dto.getBookingId()));
        SecurityUtils.checkBookingAccess(booking);

        if (!"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new BadRequestException("Chỉ có thể yêu cầu hoàn tiền cho đơn đặt vé đã thanh toán (paymentStatus hiện tại: " + booking.getPaymentStatus() + ")");
        }

        List<Refund> existingRefunds = refundRepository.findByBookingIdOrderByCreatedAtDesc(booking.getId());
        boolean hasActiveRefund = existingRefunds.stream()
                .anyMatch(r -> "pending".equalsIgnoreCase(r.getStatus()) || "processed".equalsIgnoreCase(r.getStatus()));
        if (hasActiveRefund) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã có yêu cầu hoàn tiền đang chờ xử lý hoặc đã hoàn tất");
        }

        BigDecimal refundAmount = dto.getRefundAmount() != null ? dto.getRefundAmount() : booking.getTotalAmount();
        if (refundAmount.compareTo(booking.getTotalAmount()) > 0) {
            throw new BadRequestException("Số tiền yêu cầu hoàn (" + refundAmount + ") không được vượt quá tổng tiền đã thanh toán (" + booking.getTotalAmount() + ")");
        }

        Refund refund = refundRepository.save(Refund.builder()
                .booking(booking)
                .refundType(dto.getRefundType() != null ? dto.getRefundType().trim().toLowerCase() : "full")
                .refundAmount(refundAmount)
                .refundMethod(dto.getRefundMethod() != null ? dto.getRefundMethod().trim().toUpperCase() : booking.getPaymentMethod())
                .reason(dto.getReason().trim())
                .status("pending")
                .requestedAt(LocalDateTime.now())
                .build());

        String changedBy = SecurityUtils.findCurrentUser()
                .map(u -> u.getEmail())
                .orElse("CUSTOMER");

        historyRepository.save(BookingStatusHistory.builder()
                .booking(booking)
                .oldStatus(booking.getStatus())
                .newStatus(booking.getStatus())
                .note("Khách hàng gửi yêu cầu hoàn tiền (" + refundAmount.toPlainString() + " VNĐ): " + dto.getReason())
                .changedBy(changedBy)
                .build());

        return PaymentMapper.toRefundDTO(refund);
    }

    @Override
    @Transactional
    public RefundResponseDTO processRefund(Long refundId, RefundProcessRequestDTO dto) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", "id", refundId));

        if (!"pending".equalsIgnoreCase(refund.getStatus())) {
            throw new BadRequestException("Yêu cầu hoàn tiền #" + refundId + " đã được xử lý trước đó (status: " + refund.getStatus() + ")");
        }

        Booking booking = refund.getBooking();
        Long adminId = SecurityUtils.getCurrentUserId();
        refund.setApprovedBy(adminId);
        refund.setProcessedAt(LocalDateTime.now());

        if (Boolean.TRUE.equals(dto.getApprove())) {
            String refundTxnId = "RF-" + System.currentTimeMillis();
            refund.setStatus("processed");
            refund.setTransactionId(refundTxnId);

            String oldStatus = booking.getStatus();
            booking.setStatus("cancelled");
            booking.setPaymentStatus("refunded");
            booking.setCancelledAt(LocalDateTime.now());
            bookingRepository.save(booking);

            Coupon coupon = booking.getCoupon();
            if (coupon != null && coupon.getUsedCount() != null && coupon.getUsedCount() > 0) {
                coupon.setUsedCount(coupon.getUsedCount() - 1);
                couponRepository.save(coupon);
            }

            User user = booking.getUser();
            if (user != null) {
                List<LoyaltyTransaction> earnedTxns = loyaltyTransactionRepository.findByBookingId(booking.getId());
                int totalEarnedForBooking = earnedTxns.stream()
                        .filter(t -> "earn".equalsIgnoreCase(t.getType()))
                        .mapToInt(LoyaltyTransaction::getPoints)
                        .sum();

                if (totalEarnedForBooking > 0) {
                    int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
                    int newBalance = Math.max(0, currentPoints - totalEarnedForBooking);
                    user.setLoyaltyPoints(newBalance);
                    user.setMemberTier(determineMemberTier(newBalance));
                    userRepository.save(user);

                    loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                            .user(user)
                            .booking(booking)
                            .type("redeem")
                            .points(-totalEarnedForBooking)
                            .balanceAfter(newBalance)
                            .description("Thu hồi " + totalEarnedForBooking + " điểm thưởng do hoàn tiền & hủy đơn đặt vé " + booking.getBookingCode())
                            .build());
                }
            }

            if (booking.getUser() != null) {
                try {
                    notificationService.sendNotification(
                            booking.getUser().getId(),
                            "Hoàn tiền thành công: #" + booking.getBookingCode(),
                            String.format("Yêu cầu hoàn tiền %s VNĐ cho đơn vé #%s đã được xử lý hoàn tất.",
                                    refund.getRefundAmount().toPlainString(), booking.getBookingCode()),
                            "refund",
                            "in_app"
                    );
                } catch (Exception ex) {
                    log.warn("Không thể gửi thông báo hoàn tiền cho user {}: {}", booking.getUser().getId(), ex.getMessage());
                }
            }

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(booking)
                    .oldStatus(oldStatus)
                    .newStatus("cancelled")
                    .note(String.format("Đã phê duyệt hoàn tiền %s VNĐ (Mã GD hoàn: %s) & giải phóng ghế. Ghi chú: %s",
                            refund.getRefundAmount().toPlainString(), refundTxnId,
                            dto.getNote() != null ? dto.getNote() : "Hoàn tiền hợp lệ"))
                    .changedBy("ADMIN#" + adminId)
                    .build());
        } else {
            refund.setStatus("rejected");

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(booking)
                    .oldStatus(booking.getStatus())
                    .newStatus(booking.getStatus())
                    .note("Từ chối yêu cầu hoàn tiền #" + refundId + ". Lý do: " + (dto.getNote() != null ? dto.getNote() : "Không đủ điều kiện hoàn vé"))
                    .changedBy("ADMIN#" + adminId)
                    .build());
        }

        Refund saved = refundRepository.save(refund);
        return PaymentMapper.toRefundDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponseDTO> getAllRefunds(String status) {
        List<Refund> list = (status != null && !status.trim().isEmpty())
                ? refundRepository.findByStatusOrderByCreatedAtDesc(status.trim().toLowerCase())
                : refundRepository.findAll();
        return list.stream().map(PaymentMapper::toRefundDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponseDTO> getRefundsByBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        SecurityUtils.checkBookingAccess(booking);

        return refundRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(PaymentMapper::toRefundDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoyaltyTransactionResponseDTO> getLoyaltyTransactionsByUser(Long userId) {
        SecurityUtils.checkSelfOrStaff(userId);

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PaymentMapper::toLoyaltyDTO)
                .collect(Collectors.toList());
    }

    private String determineMemberTier(int points) {
        if (points >= 1000) return "platinum";
        if (points >= 500) return "gold";
        if (points >= 200) return "silver";
        return "bronze";
    }

    private String buildFormUrlEncoded(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "="
                        + URLEncoder.encode(e.getValue() != null ? e.getValue() : "", StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private String extractJsonString(String json, String key) {
        if (json == null) return null;
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1).replace("\\\"", "\"").replace("\\/", "/");
        }
        return null;
    }

    private Integer extractJsonInt(String json, String key) {
        if (json == null) return null;
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(-?\\d+)");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return null;
    }

    private Long extractJsonLong(String json, String key) {
        if (json == null) return null;
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(-?\\d+)");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return Long.parseLong(m.group(1));
        }
        return null;
    }

    private Boolean extractJsonBoolean(String json, String key) {
        if (json == null) return null;
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(true|false)");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return Boolean.parseBoolean(m.group(1));
        }
        return null;
    }

    private String buildSimpleHtml(String title, boolean success, Booking booking, ZaloPayQueryStatusResponseDTO query) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'><title>Kết quả thanh toán ZaloPay</title>");
        sb.append("<style>body{font-family:Segoe UI,Arial,sans-serif;background:#0f172a;color:#f8fafc;display:flex;justify-content:center;padding:40px;}");
        sb.append(".card{background:#1e293b;border-radius:16px;padding:32px;max-width:650px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid #334155;}");
        sb.append(".badge{display:inline-block;padding:8px 16px;border-radius:999px;font-weight:bold;margin-bottom:16px;background:")
                .append(success ? "#16a34a" : "#dc2626").append(";color:#fff;}");
        sb.append(".tickets{display:flex;flex-wrap:wrap;gap:16px;margin-top:20px;}");
        sb.append(".ticket{background:#0f172a;padding:16px;border-radius:12px;border:1px dashed #38bdf8;text-align:center;}");
        sb.append("a.btn{display:inline-block;margin-top:24px;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;}");
        sb.append("</style></head><body><div class='card'>");
        sb.append("<div class='badge'>").append(success ? "ĐÃ THANH TOÁN (PAID)" : "CHƯA HOÀN TẤT").append("</div>");
        sb.append("<h2>").append(title).append("</h2>");
        if (booking != null) {
            sb.append("<p><b>Mã đơn đặt vé:</b> ").append(booking.getBookingCode()).append("</p>");
            sb.append("<p><b>Trạng thái đơn:</b> ").append(booking.getStatus()).append(" / ").append(booking.getPaymentStatus()).append("</p>");
            sb.append("<p><b>Tổng tiền thanh toán:</b> ").append(booking.getTotalAmount().toPlainString()).append(" VNĐ</p>");
            sb.append("<p><b>Mã giao dịch ZaloPay:</b> ").append(booking.getPaymentTransactionId()).append("</p>");
            if (booking.getTickets() != null && !booking.getTickets().isEmpty()) {
                sb.append("<h3>Vé điện tử & Mã QR Check-in của bạn:</h3><div class='tickets'>");
                for (Ticket t : booking.getTickets()) {
                    sb.append("<div class='ticket'>");
                    sb.append("<p><b>Ghế: ").append(t.getSeatCode()).append("</b> (").append(t.getSeatType()).append(")</p>");
                    sb.append("<p>Mã vé: <code>").append(t.getTicketCode()).append("</code></p>");
                    if (t.getQrCodeUrl() != null) {
                        sb.append("<img src='").append(t.getQrCodeUrl()).append("' width='150' height='150' alt='QR'/>");
                    }
                    sb.append("</div>");
                }
                sb.append("</div>");
            }
        }
        if (query != null && query.getReturnMessage() != null) {
            sb.append("<p style='margin-top:16px;color:#94a3b8;'>Phản hồi từ ZaloPay Server: ").append(query.getReturnMessage()).append("</p>");
        }
        sb.append("<a class='btn' href='/swagger-ui.html'>Quay lại Swagger UI</a>");
        sb.append("</div></body></html>");
        return sb.toString();
    }
}
