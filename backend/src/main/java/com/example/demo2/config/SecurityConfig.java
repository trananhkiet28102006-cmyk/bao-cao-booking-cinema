package com.example.demo2.config;

import com.example.demo2.security.JwtAuthenticationFilter;
import com.example.demo2.security.RestAccessDeniedHandler;
import com.example.demo2.security.RestAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String STAFF = "STAFF";

    /** Các nhóm dữ liệu danh mục: ai cũng xem được (GET), chỉ ADMIN được thêm/sửa/xóa. */
    private static final String[] CATALOG_PATHS = {
            "/api/v1/movies/**",
            "/api/v1/genres/**",
            "/api/v1/cinemas/**",
            "/api/v1/showtimes/**",
            "/api/v1/banners/**",
            "/api/v1/fnb-items/**",
            "/api/v1/holidays/**",
            "/api/v1/rooms/**",
            "/api/v1/seats/**"
    };

    /** Dữ liệu cấu hình kinh doanh: STAFF/ADMIN xem, ADMIN thêm/sửa/xóa. */
    private static final String[] BUSINESS_CONFIG_PATHS = {
            "/api/v1/coupons/**",
            "/api/v1/ticket-price-rules/**"
    };

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // ---- Hạ tầng ----
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs", "/api-docs/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // ---- Auth ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll()

                        // ---- ZaloPay gọi vào (server-to-server & redirect trình duyệt) ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/zalopay/callback").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/zalopay/return").permitAll()

                        // ---- Tiện ích công khai ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/ticket-price-rules/calculate").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/coupons/apply").authenticated()

                        // ---- Đánh giá (Review) & Yêu thích (Favorite) ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/movies/*/reviews").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/reviews/*").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/admin").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/reviews/*/status").hasRole(ADMIN)
                        .requestMatchers("/api/v1/favorites/**").authenticated()

                        // ---- Thông báo, Thiết bị, Cá nhân, Upload Media ----
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        .requestMatchers("/api/v1/user-devices/**").authenticated()
                        .requestMatchers("/api/v1/uploads/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/profile").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/loyalty").authenticated()

                        // ---- Quản trị hệ thống: ADMIN ----
                        .requestMatchers("/api/v1/admin/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/**").hasRole(ADMIN)

                        // ---- Nghiệp vụ tại quầy: STAFF / ADMIN ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/tickets/check-in").hasAnyRole(STAFF, ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/fnb/claim").hasAnyRole(STAFF, ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/process").hasAnyRole(STAFF, ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/v1/refunds").hasAnyRole(STAFF, ADMIN)

                        // ---- Chỉ ADMIN ----
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/release-expired").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/v1/refunds/*/process").hasRole(ADMIN)

                        // ---- Danh mục: xem công khai, ghi chỉ ADMIN ----
                        .requestMatchers(HttpMethod.GET, CATALOG_PATHS).permitAll()
                        .requestMatchers(HttpMethod.GET, BUSINESS_CONFIG_PATHS).hasAnyRole(STAFF, ADMIN)
                        .requestMatchers(HttpMethod.POST, CATALOG_PATHS).hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, CATALOG_PATHS).hasRole(ADMIN)
                        .requestMatchers(HttpMethod.DELETE, CATALOG_PATHS).hasRole(ADMIN)
                        .requestMatchers(HttpMethod.POST, BUSINESS_CONFIG_PATHS).hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, BUSINESS_CONFIG_PATHS).hasRole(ADMIN)
                        .requestMatchers(HttpMethod.DELETE, BUSINESS_CONFIG_PATHS).hasRole(ADMIN)

                        // ---- Còn lại (booking, thanh toán, hoàn tiền, loyalty, /auth/me...): cần đăng nhập.
                        //      Quyền sở hữu dữ liệu được kiểm tra thêm ở tầng Service. ----
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
