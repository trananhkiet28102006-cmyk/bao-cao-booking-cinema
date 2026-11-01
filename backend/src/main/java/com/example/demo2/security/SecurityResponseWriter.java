package com.example.demo2.security;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Ghi response lỗi JSON cùng cấu trúc với {@link com.example.demo2.dto.ApiResponse}
 * ({@code status, message, timestamp}) cho các lỗi xảy ra ở tầng filter (ngoài Controller).
 */
final class SecurityResponseWriter {

    private SecurityResponseWriter() {
    }

    static void write(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String body = "{\"status\":" + status
                + ",\"message\":\"" + escape(message) + "\""
                + ",\"timestamp\":\"" + LocalDateTime.now() + "\"}";
        response.getWriter().write(body);
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
