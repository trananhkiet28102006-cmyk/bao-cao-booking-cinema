package com.example.demo2.security;

import com.example.demo2.entity.Booking;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/** Tiện ích lấy thông tin user đang đăng nhập & kiểm tra quyền sở hữu dữ liệu. */
public final class SecurityUtils {

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_STAFF = "STAFF";
    public static final String ROLE_CUSTOMER = "CUSTOMER";

    private SecurityUtils() {
    }

    public static Optional<CustomUserDetails> findCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken
                || !(auth.getPrincipal() instanceof CustomUserDetails principal)) {
            return Optional.empty();
        }
        return Optional.of(principal);
    }

    public static CustomUserDetails getCurrentUser() {
        return findCurrentUser().orElseThrow(
                () -> new AuthenticationCredentialsNotFoundException("Bạn cần đăng nhập để thực hiện chức năng này"));
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /** ADMIN hoặc STAFF — được thao tác trên dữ liệu của mọi khách hàng. */
    public static boolean isStaffOrAdmin() {
        return findCurrentUser()
                .map(u -> ROLE_ADMIN.equals(u.getRole()) || ROLE_STAFF.equals(u.getRole()))
                .orElse(false);
    }

    /** Ném 403 nếu user hiện tại là CUSTOMER và booking không thuộc về họ. */
    public static void checkBookingAccess(Booking booking) {
        if (isStaffOrAdmin()) {
            return;
        }
        Long currentUserId = getCurrentUserId();
        Long ownerId = booking.getUser() != null ? booking.getUser().getId() : null;
        if (!currentUserId.equals(ownerId)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập đơn đặt vé #" + booking.getBookingCode());
        }
    }

    /** Ném 403 nếu user hiện tại là CUSTOMER và đang truy cập dữ liệu của user khác. */
    public static void checkSelfOrStaff(Long userId) {
        if (!isStaffOrAdmin() && !getCurrentUserId().equals(userId)) {
            throw new AccessDeniedException("Bạn chỉ được xem dữ liệu của chính mình");
        }
    }
}
