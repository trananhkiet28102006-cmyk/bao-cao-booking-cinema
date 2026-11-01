package com.example.demo2.dto.booking;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {

    @Schema(description = "ID khách hàng đặt vé (có thể null nếu khách vãng lai)", example = "2")
    private Long userId;

    @Schema(description = "ID cụm rạp (tùy chọn để kiểm tra chống đặt nhầm rạp với suất chiếu)", example = "1")
    private Long cinemaId;

    @NotNull(message = "ID suất chiếu không được để trống")
    @Schema(description = "ID suất chiếu phim", example = "1")
    private Long showtimeId;

    @NotEmpty(message = "Danh sách ghế chọn không được để trống")
    @Schema(description = "Danh sách ID ghế ngồi muốn đặt (không được trùng nhau và phải thuộc đúng phòng/rạp của suất chiếu)", example = "[1, 2]")
    private List<Long> seatIds;

    @Builder.Default
    @Schema(description = "Đối tượng khách hàng: adult, student, child", example = "adult")
    private String customerType = "adult";

    @Valid
    @Schema(description = "Danh sách bắp nước/combo mua kèm (tùy chọn)")
    private List<BookingFnbItemRequestDTO> fnbItems;

    @Schema(description = "Mã giảm giá (Coupon Code) áp dụng (tùy chọn)", example = "CINEMA20")
    private String couponCode;

    @NotBlank(message = "Số điện thoại liên hệ không được để trống")
    @Schema(description = "Số điện thoại nhận vé", example = "0912345678")
    private String contactPhone;

    @NotBlank(message = "Email liên hệ không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email nhận mã vé QR", example = "khachhang@gmail.com")
    private String contactEmail;

    @Builder.Default
    @Schema(description = "Phương thức thanh toán dự kiến: VNPAY, MOMO, ZALOPAY, CASH", example = "VNPAY")
    private String paymentMethod = "VNPAY";
}
