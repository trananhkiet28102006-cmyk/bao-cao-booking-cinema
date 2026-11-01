package com.example.demo2.dto.ticketpricerule;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketPriceRuleRequestDTO {

    @Schema(description = "ID cụm rạp áp dụng (null nếu áp dụng chung cho tất cả các rạp)", example = "1")
    private Long cinemaId;

    @Schema(description = "Định dạng phòng chiếu (2D, 3D, IMAX)", example = "2D")
    private String screenType;

    @Schema(description = "Loại ghế (standard, vip, couple)", example = "standard")
    private String seatType;

    @Schema(description = "Loại ngày (weekday, weekend, holiday)", example = "weekday")
    private String dayType;

    @Schema(description = "Khung giờ (morning, regular, evening)", example = "regular")
    private String timeSlot;

    @Schema(description = "Đối tượng khách hàng (adult, student, child)", example = "adult")
    private String customerType;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    @Schema(description = "Giá vé áp dụng", example = "85000.00")
    private BigDecimal price;

    @Builder.Default
    @Schema(description = "Trạng thái kích hoạt (true/false)", example = "true")
    private Boolean isActive = true;
}
