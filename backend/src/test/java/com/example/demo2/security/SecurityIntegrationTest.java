package com.example.demo2.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String loginAndGetToken(String email, String password) throws Exception {
        String body = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("API công khai: Xem danh sách phim không cần token -> 200 OK")
    void testPublicGetMovies() throws Exception {
        mockMvc.perform(get("/api/v1/movies"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("API bảo vệ: Tạo phim khi chưa đăng nhập -> 401 Unauthorized")
    void testCreateMovieUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/movies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Đăng nhập sai mật khẩu -> 401 Unauthorized")
    void testLoginInvalidPassword() throws Exception {
        String body = "{\"email\":\"admin@cinema.com\",\"password\":\"WrongPassword@123\"}";
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Đăng nhập Admin thành công và lấy thông tin cá nhân qua /auth/me")
    void testAdminLoginAndMe() throws Exception {
        String token = loginAndGetToken("admin@cinema.com", "Admin@123");
        assertNotNull(token);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("admin@cinema.com"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Phân quyền: CUSTOMER cố gọi API của ADMIN (Tạo phim) -> 403 Forbidden")
    void testCustomerCannotCreateMovie() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        mockMvc.perform(post("/api/v1/movies")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Phân quyền: CUSTOMER cố gọi API của STAFF (Check-in vé) -> 403 Forbidden")
    void testCustomerCannotCheckinTicket() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        mockMvc.perform(post("/api/v1/bookings/tickets/check-in")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ticketCode\":\"TK-123456-A1\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Phân quyền: STAFF check-in vé không bị chặn 401/403")
    void testStaffCanCallCheckinTicket() throws Exception {
        String token = loginAndGetToken("staff@cinema.com", "Staff@123");

        // Gửi vé giả -> kỳ vọng 400 Bad Request (chặn vé giả trong logic), KHÔNG PHẢI 401/403
        mockMvc.perform(post("/api/v1/bookings/tickets/check-in")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ticketCode\":\"NON_EXISTING_TICKET\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("ZaloPay Return URL công khai: Trả về trang HTML kết quả mà không cần token")
    void testZaloPayReturnPublic() throws Exception {
        mockMvc.perform(get("/api/v1/payments/zalopay/return"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Review API: Khách hàng viết đánh giá phim và xem danh sách đánh giá công khai")
    void testCustomerReviewMovie() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        String reviewBody = "{\"rating\":5,\"comment\":\"Phim siêu xuất sắc, xứng đáng 10/10!\"}";
        mockMvc.perform(post("/api/v1/movies/1/reviews")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reviewBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.movieId").value(1));

        // Xem công khai không cần token
        mockMvc.perform(get("/api/v1/movies/1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews").isNumber())
                .andExpect(jsonPath("$.data.averageRating").isNumber());
    }

    @Test
    @DisplayName("Favorite API: Khách hàng thêm và xóa phim yêu thích")
    void testCustomerFavoriteMovie() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        // Xóa trước nếu đã có từ seeder
        mockMvc.perform(delete("/api/v1/favorites/movies/1")
                .header("Authorization", "Bearer " + token));

        // Thêm vào yêu thích
        mockMvc.perform(post("/api/v1/favorites/movies/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated());

        // Kiểm tra
        mockMvc.perform(get("/api/v1/favorites/check/1")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isFavorite").value(true));

        // Lấy danh sách yêu thích
        mockMvc.perform(get("/api/v1/favorites")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Notification & User Device: Khách hàng đăng ký thiết bị và quản lý thông báo")
    void testCustomerNotificationAndDevice() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        // 1. Đăng ký thiết bị
        String deviceJson = "{\"deviceToken\":\"FCM-TOKEN-TEST-123456\",\"platform\":\"Web\",\"deviceName\":\"Chrome Test\"}";
        mockMvc.perform(post("/api/v1/user-devices")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(deviceJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.deviceToken").value("FCM-TOKEN-TEST-123456"));

        // 2. Danh sách thiết bị
        mockMvc.perform(get("/api/v1/user-devices")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // 3. Lấy thông báo và đếm thông báo chưa đọc
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount").isNumber());

        // 4. Đánh dấu tất cả thông báo đã đọc
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/notifications/read-all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Loyalty & Profile: Khách hàng xem điểm thưởng và cập nhật hồ sơ cá nhân")
    void testCustomerLoyaltyAndProfile() throws Exception {
        String token = loginAndGetToken("khachhang@gmail.com", "Customer@123");

        // 1. Xem điểm thưởng
        mockMvc.perform(get("/api/v1/users/loyalty")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPoints").isNumber())
                .andExpect(jsonPath("$.data.memberTier").isString());

        // 2. Cập nhật hồ sơ cá nhân
        String profileJson = "{\"fullName\":\"Nguyễn Văn A Updated\",\"phone\":\"0912345678\"}";
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/users/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profileJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn A Updated"));
    }

    @Test
    @DisplayName("Admin Dashboard & User Management: Phân quyền ADMIN và truy cập báo cáo tổng quan")
    void testAdminDashboardAndUserManagement() throws Exception {
        String customerToken = loginAndGetToken("khachhang@gmail.com", "Customer@123");
        String adminToken = loginAndGetToken("admin@cinema.com", "Admin@123");

        // 1. CUSTOMER không thể truy cập dashboard -> 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // 2. CUSTOMER không thể xem danh sách users -> 403 Forbidden
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // 3. ADMIN truy cập dashboard -> 200 OK
        mockMvc.perform(get("/api/v1/admin/dashboard/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBookings").isNumber())
                .andExpect(jsonPath("$.data.totalRevenue").isNumber());

        // 4. ADMIN xem danh sách người dùng -> 200 OK
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("Cloudinary Upload: Chưa đăng nhập bị 401; đã đăng nhập nhưng thiếu file bị 400")
    void testCloudinaryUploadSecurity() throws Exception {
        // 1. Chưa đăng nhập -> 401
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/uploads/image"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // 2. Đã đăng nhập nhưng không có file -> 400 Bad Request
        String token = loginAndGetToken("admin@cinema.com", "Admin@123");
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/uploads/image")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }
}
