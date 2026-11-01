package com.example.demo2.security;

import com.example.demo2.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Bọc entity {@link User} thành {@link UserDetails} cho Spring Security.
 * - username = email
 * - password = passwordHash (BCrypt)
 * - authority = "ROLE_" + role (CUSTOMER / STAFF / ADMIN)
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String fullName;
    private final String passwordHash;
    private final String role;
    private final String status;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.passwordHash = user.getPasswordHash();
        this.role = normalizeRole(user.getRole());
        this.status = user.getStatus();
    }

    public static String normalizeRole(String role) {
        return role == null || role.isBlank() ? "CUSTOMER" : role.trim().toUpperCase();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"banned".equalsIgnoreCase(status);
    }

    @Override
    public boolean isEnabled() {
        return status == null || "active".equalsIgnoreCase(status);
    }
}
