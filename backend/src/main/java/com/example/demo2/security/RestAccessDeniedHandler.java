package com.example.demo2.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Trả về 403 dạng JSON (theo format ApiResponse) khi đã đăng nhập nhưng không đủ quyền. */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        SecurityResponseWriter.write(response, HttpServletResponse.SC_FORBIDDEN,
                "Bạn không có quyền truy cập chức năng này");
    }
}
