package com.example.demo2.service.impl;

import com.example.demo2.dto.booking.*;
import com.example.demo2.dto.coupon.CouponApplyRequestDTO;
import com.example.demo2.dto.coupon.CouponCalculationResponseDTO;
import com.example.demo2.dto.ticketpricerule.PriceCalculationRequestDTO;
import com.example.demo2.dto.ticketpricerule.PriceCalculationResponseDTO;
import com.example.demo2.entity.*;
import com.example.demo2.exception.BadRequestException;
import com.example.demo2.exception.ResourceNotFoundException;
import com.example.demo2.mapper.BookingMapper;
import com.example.demo2.repository.*;
import com.example.demo2.security.SecurityUtils;
import com.example.demo2.service.BookingService;
import com.example.demo2.service.CouponService;
import com.example.demo2.service.TicketPriceRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final int SEAT_HOLD_MINUTES = 5;

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingFnbRepository bookingFnbRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final FnbItemRepository fnbItemRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final TicketPriceRuleRepository priceRuleRepository;

    private final TicketPriceRuleService ticketPriceRuleService;
    private final CouponService couponService;

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {
        // 1. Tự động giải phóng các đơn giữ ghế đã quá hạn 5 phút trước khi kiểm tra ghế trống
        releaseExpiredHoldBookings();

        Showtime showtime = showtimeRepository.findById(dto.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", "id", dto.getShowtimeId()));

        if (!"open".equalsIgnoreCase(showtime.getStatus())) {
            throw new BadRequestException("Suất chiếu #" + showtime.getId() + " hiện không mở bán vé (status: " + showtime.getStatus() + ")");
        }

        CinemaRoom showtimeRoom = showtime.getCinemaRoom();
        Cinema showtimeCinema = showtimeRoom.getCinema();

        // 2. Kiểm tra chống lệch rạp nếu người dùng gửi kèm cinemaId
        if (dto.getCinemaId() != null && showtimeCinema != null && !showtimeCinema.getId().equals(dto.getCinemaId())) {
            throw new BadRequestException(String.format(
                    "Xung đột cụm rạp: Suất chiếu #%d thuộc rạp '%s' (ID: %d), không thuộc rạp có ID: %d!",
                    showtime.getId(), showtimeCinema.getName(), showtimeCinema.getId(), dto.getCinemaId()));
        }

        // Bắt buộc đăng nhập: lấy thông tin tài khoản từ SecurityContext
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        String contactEmail = (dto.getContactEmail() != null && !dto.getContactEmail().isBlank())
                ? dto.getContactEmail().trim()
                : user.getEmail();
        String contactPhone = (dto.getContactPhone() != null && !dto.getContactPhone().isBlank())
                ? dto.getContactPhone().trim()
                : (user.getPhone() != null ? user.getPhone() : "");

        // 3. Chống gửi trùng ghế ngay trong cùng 1 request đặt vé (ví dụ: seatIds = [1, 1])
        Set<Long> uniqueCheck = new HashSet<>();
        List<Long> duplicateInRequest = new ArrayList<>();
        for (Long seatId : dto.getSeatIds()) {
            if (!uniqueCheck.add(seatId)) {
                duplicateInRequest.add(seatId);
            }
        }
        if (!duplicateInRequest.isEmpty()) {
            throw new BadRequestException("Danh sách ghế chọn có chứa ID ghế bị trùng lặp trong cùng một yêu cầu: " + duplicateInRequest);
        }

        // 4. Kiểm tra từng ghế phải tồn tại và thuộc đúng Phòng chiếu & Cụm rạp của suất chiếu
        Long roomId = showtimeRoom.getId();
        List<Seat> selectedSeats = new ArrayList<>();
        for (Long seatId : dto.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat", "id", seatId));

            CinemaRoom seatRoom = seat.getCinemaRoom();
            Cinema seatCinema = seatRoom != null ? seatRoom.getCinema() : null;

            if (seatRoom == null || !seatRoom.getId().equals(roomId)) {
                throw new BadRequestException(String.format(
                        "Sai phòng/rạp chiếu: Ghế %s (ID: %d - thuộc '%s', rạp '%s') không thuộc phòng '%s' (rạp '%s') của suất chiếu #%d!",
                        seat.getSeatNumber(),
                        seat.getId(),
                        seatRoom != null ? seatRoom.getName() : "N/A",
                        seatCinema != null ? seatCinema.getName() : "N/A",
                        showtimeRoom.getName(),
                        showtimeCinema != null ? showtimeCinema.getName() : "N/A",
                        showtime.getId()));
            }
            selectedSeats.add(seat);
        }

        // 5. Kiểm tra chống đặt trùng ghế đã bán hoặc đang được giữ chỗ (trong hạn 5 phút)
        Set<Long> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtimeId(showtime.getId());
        List<String> conflictSeats = selectedSeats.stream()
                .filter(s -> bookedSeatIds.contains(s.getId()))
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

        if (!conflictSeats.isEmpty()) {
            throw new BadRequestException("Không thể đặt vé! Các ghế sau tại phòng '" + showtimeRoom.getName()
                    + "' (Rạp: " + (showtimeCinema != null ? showtimeCinema.getName() : "")
                    + ") đã có người đặt hoặc đang trong thời gian giữ chỗ (5 phút): " + String.join(", ", conflictSeats));
        }

        // 6. Tính giá vé động cho từng ghế thông qua TicketPriceRuleService
        String customerType = dto.getCustomerType() != null ? dto.getCustomerType().trim().toLowerCase() : "adult";
        BigDecimal ticketSubtotal = BigDecimal.ZERO;

        String bookingCode = generateUniqueBookingCode();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .showtime(showtime)
                .contactPhone(contactPhone)
                .contactEmail(contactEmail)
                .status("pending")
                .paymentStatus("unpaid")
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod().trim().toUpperCase() : "VNPAY")
                .holdExpiresAt(LocalDateTime.now().plusMinutes(SEAT_HOLD_MINUTES))
                .tickets(new ArrayList<>())
                .bookingFnbs(new ArrayList<>())
                .build();

        for (Seat seat : selectedSeats) {
            PriceCalculationResponseDTO priceCalc = ticketPriceRuleService.calculatePrice(
                    PriceCalculationRequestDTO.builder()
                            .showtimeId(showtime.getId())
                            .seatType(seat.getSeatType())
                            .customerType(customerType)
                            .build()
            );

            TicketPriceRule appliedRule = priceCalc.getAppliedRuleId() != null
                    ? priceRuleRepository.findById(priceCalc.getAppliedRuleId()).orElse(null)
                    : null;

            BigDecimal seatPrice = priceCalc.getFinalPrice();
            ticketSubtotal = ticketSubtotal.add(seatPrice);

            String ticketCode = "TK-" + bookingCode.substring(3) + "-" + seat.getSeatNumber();
            String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + ticketCode;

            Ticket ticket = Ticket.builder()
                    .booking(booking)
                    .showtime(showtime)
                    .seat(seat)
                    .priceRule(appliedRule)
                    .seatCode(seat.getSeatNumber())
                    .seatType(seat.getSeatType())
                    .finalPrice(seatPrice)
                    .ticketCode(ticketCode)
                    .qrCodeUrl(qrCodeUrl)
                    .checkinStatus("unchecked")
                    .build();

            booking.getTickets().add(ticket);
        }

        // 7. Xử lý danh sách Bắp nước & Combo (BookingFnb)
        BigDecimal fnbSubtotal = BigDecimal.ZERO;
        if (dto.getFnbItems() != null && !dto.getFnbItems().isEmpty()) {
            for (BookingFnbItemRequestDTO fnbReq : dto.getFnbItems()) {
                FnbItem fnbItem = fnbItemRepository.findById(fnbReq.getFnbItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("FnbItem", "id", fnbReq.getFnbItemId()));

                if (!Boolean.TRUE.equals(fnbItem.getIsActive())) {
                    throw new BadRequestException("Món bắp nước '" + fnbItem.getItemName() + "' hiện đang ngừng kinh doanh");
                }

                BigDecimal unitPrice = fnbItem.getBasePrice();
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(fnbReq.getQuantity()));
                fnbSubtotal = fnbSubtotal.add(lineTotal);

                BookingFnb bookingFnb = BookingFnb.builder()
                        .booking(booking)
                        .fnbItem(fnbItem)
                        .quantity(fnbReq.getQuantity())
                        .unitPrice(unitPrice)
                        .totalPrice(lineTotal)
                        .pickupStatus("unclaimed")
                        .build();

                booking.getBookingFnbs().add(bookingFnb);
            }
        }

        BigDecimal subtotal = ticketSubtotal.add(fnbSubtotal);
        BigDecimal discountAmount = BigDecimal.ZERO;

        // 8. Kiểm tra & áp dụng Mã giảm giá (Coupon) nếu có
        if (dto.getCouponCode() != null && !dto.getCouponCode().trim().isEmpty()) {
            String code = dto.getCouponCode().trim().toUpperCase();
            CouponCalculationResponseDTO couponCalc = couponService.validateAndCalculateDiscount(
                    CouponApplyRequestDTO.builder()
                            .code(code)
                            .orderAmount(subtotal)
                            .userId(user.getId())
                            .build()
            );

            Coupon coupon = couponRepository.findById(couponCalc.getCouponId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponCalc.getCouponId()));

            discountAmount = couponCalc.getDiscountAmount();
            booking.setCoupon(coupon);

            int currentUsed = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            coupon.setUsedCount(currentUsed + 1);
            couponRepository.save(coupon);
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        booking.setSubtotal(subtotal);
        booking.setDiscountAmount(discountAmount);
        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        // 9. Ghi nhận lịch sử trạng thái đơn đặt vé (BookingStatusHistory)
        BookingStatusHistory initialHistory = historyRepository.save(BookingStatusHistory.builder()
                .booking(savedBooking)
                .oldStatus(null)
                .newStatus("pending")
                .note(String.format("Khởi tạo đơn đặt vé (%d ghế, tạm tính: %s VNĐ, giảm giá: %s VNĐ, tổng thanh toán: %s VNĐ). Thời hạn giữ ghế 5 phút (đến %s)",
                        selectedSeats.size(), subtotal.toPlainString(), discountAmount.toPlainString(),
                        totalAmount.toPlainString(), savedBooking.getHoldExpiresAt()))
                .changedBy(user.getEmail())
                .build());

        return BookingMapper.toResponseDTO(savedBooking, Collections.singletonList(initialHistory));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        SecurityUtils.checkBookingAccess(booking);
        List<BookingStatusHistory> history = historyRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        return BookingMapper.toResponseDTO(booking, history);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "bookingCode", bookingCode));
        SecurityUtils.checkBookingAccess(booking);
        List<BookingStatusHistory> history = historyRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        return BookingMapper.toResponseDTO(booking, history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings(Long userId, Long showtimeId, String status) {
        if (!SecurityUtils.isStaffOrAdmin()) {
            // Khách hàng (CUSTOMER) chỉ được xem đơn đặt vé của chính mình
            userId = SecurityUtils.getCurrentUserId();
        }

        List<Booking> bookings;
        if (userId != null) {
            bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (showtimeId != null) {
            bookings = bookingRepository.findByShowtimeIdOrderByCreatedAtDesc(showtimeId);
        } else if (status != null && !status.trim().isEmpty()) {
            bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(status.trim().toLowerCase());
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .map(b -> BookingMapper.toResponseDTO(b, historyRepository.findByBookingIdOrderByCreatedAtAsc(b.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id, BookingCancelRequestDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        SecurityUtils.checkBookingAccess(booking);

        if ("cancelled".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã ở trạng thái hủy từ trước");
        }

        if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " đã thanh toán. Vui lòng sử dụng API Yêu cầu hoàn tiền (/api/v1/refunds) để hủy và hoàn tiền");
        }

        String oldStatus = booking.getStatus();
        booking.setStatus("cancelled");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setHoldExpiresAt(null);

        // Hoàn lại lượt sử dụng mã giảm giá nếu có
        Coupon coupon = booking.getCoupon();
        if (coupon != null && coupon.getUsedCount() != null && coupon.getUsedCount() > 0) {
            coupon.setUsedCount(coupon.getUsedCount() - 1);
            couponRepository.save(coupon);
        }

        Booking updated = bookingRepository.save(booking);

        String reason = dto != null && dto.getReason() != null && !dto.getReason().isBlank()
                ? dto.getReason().trim()
                : "Người dùng hủy đơn đặt vé";
        String changedBy = SecurityUtils.findCurrentUser()
                .map(u -> u.getEmail() + " (" + u.getRole() + ")")
                .orElse("CUSTOMER");
        if (dto != null && dto.getChangedBy() != null && !dto.getChangedBy().isBlank() && SecurityUtils.isStaffOrAdmin()) {
            changedBy = dto.getChangedBy().trim();
        }

        historyRepository.save(BookingStatusHistory.builder()
                .booking(updated)
                .oldStatus(oldStatus)
                .newStatus("cancelled")
                .note("Hủy đơn đặt vé & giải phóng ghế: " + reason)
                .changedBy(changedBy)
                .build());

        List<BookingStatusHistory> history = historyRepository.findByBookingIdOrderByCreatedAtAsc(updated.getId());
        return BookingMapper.toResponseDTO(updated, history);
    }

    @Override
    @Transactional
    public TicketResponseDTO checkinTicket(TicketCheckinRequestDTO dto) {
        String code = dto.getTicketCode().trim();

        // 1. Chặn vé giả / Mã vé không tồn tại trong cơ sở dữ liệu
        Ticket ticket = ticketRepository.findByTicketCode(code)
                .orElseThrow(() -> new BadRequestException(
                        "Cảnh báo vé giả hoặc không hợp lệ: Mã vé '" + code + "' hoàn toàn không tồn tại trong hệ thống!"));

        // 2. Chặn vé thuộc đơn đã hủy hoặc chưa thanh toán
        Booking booking = ticket.getBooking();
        if (booking != null) {
            if ("cancelled".equalsIgnoreCase(booking.getStatus()) || "refunded".equalsIgnoreCase(booking.getPaymentStatus())) {
                throw new BadRequestException(
                        "Chặn vé không hợp lệ: Vé '" + code + "' thuộc đơn hàng #" + booking.getBookingCode() + " đã bị hủy hoặc đã hoàn tiền!");
            }
            if (!"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
                throw new BadRequestException(
                        "Chặn vé chưa thanh toán: Vé '" + code + "' thuộc đơn hàng #" + booking.getBookingCode() + " chưa hoàn tất thanh toán (paymentStatus: " + booking.getPaymentStatus() + ")!");
            }
        }

        // 3. Kiểm tra chống lệch rạp hoặc lệch suất chiếu nếu nhân viên truyền cinemaId / showtimeId tại cổng soát vé
        Showtime ticketShowtime = ticket.getShowtime();
        if (ticketShowtime != null) {
            CinemaRoom room = ticketShowtime.getCinemaRoom();
            Cinema cinema = room != null ? room.getCinema() : null;

            if (dto.getCinemaId() != null && cinema != null && !cinema.getId().equals(dto.getCinemaId())) {
                throw new BadRequestException(String.format(
                        "Sai cụm rạp: Vé '%s' thuộc rạp '%s' (ID: %d), không được phép check-in tại rạp có ID: %d!",
                        code, cinema.getName(), cinema.getId(), dto.getCinemaId()));
            }

            if (dto.getShowtimeId() != null && !ticketShowtime.getId().equals(dto.getShowtimeId())) {
                throw new BadRequestException(String.format(
                        "Sai suất chiếu: Vé '%s' thuộc suất chiếu #%d, không khớp với suất chiếu đang soát vé (#%d)!",
                        code, ticketShowtime.getId(), dto.getShowtimeId()));
            }
        }

        // 4. Chặn vé đã được sử dụng (đã Check-in từ trước)
        if ("checked".equalsIgnoreCase(ticket.getCheckinStatus())) {
            throw new BadRequestException(String.format(
                    "Cảnh báo vé đã sử dụng: Vé '%s' (Ghế %s) đã được soát vé (Check-in) trước đó vào lúc %s! Không thể sử dụng lại.",
                    code, ticket.getSeatCode(), ticket.getCheckinAt()));
        }

        ticket.setCheckinStatus("checked");
        ticket.setCheckinAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        return BookingMapper.toTicketDTO(saved);
    }

    @Override
    @Transactional
    public List<BookingFnbResponseDTO> claimBookingFnb(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " chưa thanh toán, không thể xuất bắp nước");
        }

        List<BookingFnb> fnbList = bookingFnbRepository.findByBookingId(bookingId);
        if (fnbList.isEmpty()) {
            throw new BadRequestException("Đơn đặt vé #" + booking.getBookingCode() + " không có món bắp nước nào đi kèm");
        }

        for (BookingFnb bf : fnbList) {
            bf.setPickupStatus("claimed");
        }
        List<BookingFnb> saved = bookingFnbRepository.saveAll(fnbList);
        return saved.stream().map(BookingMapper::toBookingFnbDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingStatusHistoryResponseDTO> getBookingStatusHistory(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        SecurityUtils.checkBookingAccess(booking);
        return historyRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(BookingMapper::toHistoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int releaseExpiredHoldBookings() {
        List<Booking> expiredList = bookingRepository.findExpiredPendingBookings(LocalDateTime.now());
        for (Booking b : expiredList) {
            String oldStatus = b.getStatus();
            b.setStatus("cancelled");
            b.setCancelledAt(LocalDateTime.now());

            Coupon coupon = b.getCoupon();
            if (coupon != null && coupon.getUsedCount() != null && coupon.getUsedCount() > 0) {
                coupon.setUsedCount(coupon.getUsedCount() - 1);
                couponRepository.save(coupon);
            }

            bookingRepository.save(b);

            historyRepository.save(BookingStatusHistory.builder()
                    .booking(b)
                    .oldStatus(oldStatus)
                    .newStatus("cancelled")
                    .note("Hệ thống tự động hủy đơn & giải phóng ghế do hết thời gian giữ ghế (5 phút)")
                    .changedBy("SYSTEM")
                    .build());
        }
        return expiredList.size();
    }

    private String generateUniqueBookingCode() {
        String code;
        do {
            long suffix = System.currentTimeMillis() % 1000000L;
            int rand = new Random().nextInt(900) + 100;
            code = String.format("BK-%06d%d", suffix, rand);
        } while (bookingRepository.findByBookingCode(code).isPresent());
        return code;
    }
}
