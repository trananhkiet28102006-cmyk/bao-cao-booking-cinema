package com.example.demo2.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Trả về 401 dạng JSON (theo format ApiResponse) khi chưa đăng nhập hoặc token không hợp lệ. */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        SecurityResponseWriter.write(response, HttpServletResponse.SC_UNAUTHORIZED,
                "Bạn chưa đăng nhập hoặc token không hợp lệ/đã hết hạn");
    }
}
