package com.example.demo2.service.impl;

import com.example.demo2.dto.auth.UserProfileDTO;
import com.example.demo2.dto.loyalty.LoyaltySummaryDTO;
import com.example.demo2.dto.loyalty.LoyaltyTransactionResponseDTO;
import com.example.demo2.dto.user.UpdateProfileRequestDTO;
import com.example.demo2.dto.user.UserRoleUpdateRequestDTO;
import com.example.demo2.dto.user.UserStatusUpdateRequestDTO;
import com.example.demo2.entity.LoyaltyTransaction;
import com.example.demo2.entity.User;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.DuplicateResourceException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.repository.LoyaltyTransactionRepository;
import com.example.demo2.repository.UserRepository;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Set<String> VALID_ROLES = Set.of(
            SecurityUtils.ROLE_CUSTOMER,
            SecurityUtils.ROLE_STAFF,
            SecurityUtils.ROLE_ADMIN
    );

    private static final Set<String> VALID_STATUSES = Set.of("active", "banned", "inactive");

    private final UserRepository userRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Override
    @Transactional
    public UserProfileDTO updateMyProfile(UpdateProfileRequestDTO dto) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        String newPhone = dto.getPhone() != null && !dto.getPhone().isBlank() ? dto.getPhone().trim() : null;
        if (newPhone != null && !newPhone.equals(user.getPhone())) {
            userRepository.findByPhone(newPhone).ifPresent(other -> {
                if (!other.getId().equals(currentUserId)) {
                    throw new DuplicateResourceException("User", "phone", newPhone);
                }
            });
        }

        user.setFullName(dto.getFullName().trim());
        user.setPhone(newPhone);
        User saved = userRepository.save(user);
        return toProfile(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltySummaryDTO getMyLoyaltySummary() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        List<LoyaltyTransaction> transactions = loyaltyTransactionRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
        List<LoyaltyTransactionResponseDTO> txnDTOs = transactions.stream()
                .map(this::toLoyaltyDTO)
                .toList();

        return LoyaltySummaryDTO.builder()
                .currentPoints(user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0)
                .memberTier(user.getMemberTier() != null ? user.getMemberTier() : "bronze")
                .recentTransactions(txnDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserProfileDTO> getAllUsers(String role, String status, String keyword, Pageable pageable) {
        String cleanRole = role != null && !role.isBlank() ? role.trim().toUpperCase() : null;
        String cleanStatus = status != null && !status.isBlank() ? status.trim().toLowerCase() : null;
        String cleanKeyword = keyword != null && !keyword.isBlank() ? keyword.trim() : null;

        return userRepository.searchUsers(cleanRole, cleanStatus, cleanKeyword, pageable)
                .map(this::toProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toProfile(user);
    }

    @Override
    @Transactional
    public UserProfileDTO updateUserStatus(Long id, UserStatusUpdateRequestDTO dto) {
        String status = dto.getStatus().trim().toLowerCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Trạng thái không hợp lệ. Các giá trị cho phép: " + VALID_STATUSES);
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (id.equals(currentUserId) && "banned".equals(status)) {
            throw new BadRequestException("Không thể tự khóa tài khoản của chính mình");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setStatus(status);
        return toProfile(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserProfileDTO updateUserRole(Long id, UserRoleUpdateRequestDTO dto) {
        String role = dto.getRole().trim().toUpperCase();
        if (!VALID_ROLES.contains(role)) {
            throw new BadRequestException("Vai trò không hợp lệ. Các giá trị cho phép: " + VALID_ROLES);
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (id.equals(currentUserId)) {
            throw new BadRequestException("Không thể tự thay đổi vai trò của chính mình");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setRole(role);
        return toProfile(userRepository.save(user));
    }

    private UserProfileDTO toProfile(User u) {
        return UserProfileDTO.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole())
                .loyaltyPoints(u.getLoyaltyPoints() != null ? u.getLoyaltyPoints() : 0)
                .memberTier(u.getMemberTier() != null ? u.getMemberTier() : "bronze")
                .status(u.getStatus() != null ? u.getStatus() : "active")
                .createdAt(u.getCreatedAt())
                .build();
    }

    private LoyaltyTransactionResponseDTO toLoyaltyDTO(LoyaltyTransaction t) {
        return LoyaltyTransactionResponseDTO.builder()
                .id(t.getId())
                .type(t.getType())
                .points(t.getPoints())
                .balanceAfter(t.getBalanceAfter())
                .description(t.getDescription())
                .bookingId(t.getBooking() != null ? t.getBooking().getId() : null)
                .bookingCode(t.getBooking() != null ? t.getBooking().getBookingCode() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
