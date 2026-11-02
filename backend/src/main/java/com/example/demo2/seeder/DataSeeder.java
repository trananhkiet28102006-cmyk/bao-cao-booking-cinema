package com.example.demo2.seeder;

import com.example.demo2.entity.*;
import com.example.demo2.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final MovieCastRepository movieCastRepository;
    private final CinemaRepository cinemaRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final BannerRepository bannerRepository;
    private final HolidayRepository holidayRepository;
    private final UserRepository userRepository;

    // Repositories cho TuĂ¡ÂºÂ§n 2
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TicketPriceRuleRepository ticketPriceRuleRepository;
    private final FnbItemRepository fnbItemRepository;
    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;

    // Repositories cho TuĂ¡ÂºÂ§n 3
    private final CouponRepository couponRepository;
    private final BookingFnbRepository bookingFnbRepository;
    private final BookingStatusHistoryRepository bookingStatusHistoryRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RefundRepository refundRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedWeek1Data();
        seedWeek2Data();
        seedWeek3Data();
        syncDefaultUsersAndPasswords();
        seedReviewAndFavoriteData();
    }

    private void seedWeek1Data() {
        if (genreRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u mĂ¡ÂºÂ«u TuĂ¡ÂºÂ§n 1 Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("BĂ¡ÂºÂ¯t Ă„â€˜Ă¡ÂºÂ§u khĂ¡Â»Å¸i tĂ¡ÂºÂ¡o dĂ¡Â»Â¯ liĂ¡Â»â€¡u mĂ¡ÂºÂ«u TuĂ¡ÂºÂ§n 1...");

        // 1. ThĂ¡Â»Æ’ loĂ¡ÂºÂ¡i phim (Genres)
        Genre hanhDong = genreRepository.save(Genre.builder().name("HÄ‚Â nh Ă„ÂĂ¡Â»â„¢ng").slug("hanh-dong").build());
        Genre kinhDi = genreRepository.save(Genre.builder().name("Kinh DĂ¡Â»â€¹").slug("kinh-di").build());
        Genre haiHuoc = genreRepository.save(Genre.builder().name("HÄ‚Â i HĂ†Â°Ă¡Â»â€ºc").slug("hai-huoc").build());
        Genre tinhCam = genreRepository.save(Genre.builder().name("TÄ‚Â¬nh CĂ¡ÂºÂ£m").slug("tinh-cam").build());
        Genre hoatHinh = genreRepository.save(Genre.builder().name("HoĂ¡ÂºÂ¡t HÄ‚Â¬nh").slug("hoat-hinh").build());
        Genre sciFi = genreRepository.save(Genre.builder().name("Khoa HĂ¡Â»Âc ViĂ¡Â»â€¦n TĂ†Â°Ă¡Â»Å¸ng").slug("khoa-hoc-vien-tuong").build());
        Genre phieuLuu = genreRepository.save(Genre.builder().name("PhiÄ‚Âªu LĂ†Â°u").slug("phieu-luu").build());
        Genre tamLy = genreRepository.save(Genre.builder().name("TÄ‚Â¢m LÄ‚Â½").slug("tam-ly").build());

        // 2. Phim (Movies)
        Movie mai = movieRepository.save(Movie.builder()
                .title("Mai")
                .description("CÄ‚Â¢u chuyĂ¡Â»â€¡n vĂ¡Â»Â cuĂ¡Â»â„¢c Ă„â€˜Ă¡Â»Âi cĂ¡Â»Â§a Mai, mĂ¡Â»â„¢t phĂ¡Â»Â¥ nĂ¡Â»Â¯ lÄ‚Â m nghĂ¡Â»Â massage trĂ¡Â»â€¹ liĂ¡Â»â€¡u vĂ¡Â»â€ºi nhiĂ¡Â»Âu uĂ¡ÂºÂ©n khÄ‚Âºc trong quÄ‚Â¡ khĂ¡Â»Â©.")
                .durationMinutes(131)
                .ageRating("C18")
                .language("TiĂ¡ÂºÂ¿ng ViĂ¡Â»â€¡t")
                .director("TrĂ¡ÂºÂ¥n ThÄ‚Â nh")
                .status("now_showing")
                .releaseDate(LocalDate.of(2024, 2, 10))
                .endDate(LocalDate.of(2026, 12, 31))
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba")
                .trailerUrl("https://www.youtube.com/watch?v=EX6clvId19s")
                .build());

        movieGenreRepository.save(MovieGenre.builder().movie(mai).genre(tamLy).build());
        movieGenreRepository.save(MovieGenre.builder().movie(mai).genre(tinhCam).build());

        movieCastRepository.save(MovieCast.builder().movie(mai).roleType("director").personName("TrĂ¡ÂºÂ¥n ThÄ‚Â nh").displayOrder(1).build());
        movieCastRepository.save(MovieCast.builder().movie(mai).roleType("actor").personName("PhĂ†Â°Ă†Â¡ng Anh Ă„ÂÄ‚Â o").characterName("Mai").displayOrder(2).build());
        movieCastRepository.save(MovieCast.builder().movie(mai).roleType("actor").personName("TuĂ¡ÂºÂ¥n TrĂ¡ÂºÂ§n").characterName("DĂ†Â°Ă†Â¡ng").displayOrder(3).build());

        Movie dune2 = movieRepository.save(Movie.builder()
                .title("Dune: HÄ‚Â nh Tinh CÄ‚Â¡t - PhĂ¡ÂºÂ§n 2")
                .description("Paul Atreides hĂ¡Â»Â£p tÄ‚Â¡c cÄ‚Â¹ng Chani vÄ‚Â  ngĂ†Â°Ă¡Â»Âi Fremen trong cuĂ¡Â»â„¢c bÄ‚Â¡o thÄ‚Â¹ chĂ¡Â»â€˜ng lĂ¡ÂºÂ¡i nhĂ¡Â»Â¯ng kĂ¡ÂºÂ» Ă„â€˜Ä‚Â£ hĂ¡Â»Â§y hoĂ¡ÂºÂ¡i gia tĂ¡Â»â„¢c mÄ‚Â¬nh.")
                .durationMinutes(166)
                .ageRating("C16")
                .language("TiĂ¡ÂºÂ¿ng Anh - PhĂ¡Â»Â¥ Ă„â€˜Ă¡Â»Â tiĂ¡ÂºÂ¿ng ViĂ¡Â»â€¡t")
                .director("Denis Villeneuve")
                .status("now_showing")
                .releaseDate(LocalDate.of(2024, 3, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .posterUrl("/images/posters/dune2.jpg")
                .trailerUrl("https://www.youtube.com/watch?v=Way9Dexny3w")
                .build());

        movieGenreRepository.save(MovieGenre.builder().movie(dune2).genre(sciFi).build());
        movieGenreRepository.save(MovieGenre.builder().movie(dune2).genre(phieuLuu).build());
        movieGenreRepository.save(MovieGenre.builder().movie(dune2).genre(hanhDong).build());

        movieCastRepository.save(MovieCast.builder().movie(dune2).roleType("director").personName("Denis Villeneuve").displayOrder(1).build());
        movieCastRepository.save(MovieCast.builder().movie(dune2).roleType("actor").personName("TimothÄ‚Â©e Chalamet").characterName("Paul Atreides").displayOrder(2).build());
        movieCastRepository.save(MovieCast.builder().movie(dune2).roleType("actor").personName("Zendaya").characterName("Chani").displayOrder(3).build());

        Movie kungfuPanda = movieRepository.save(Movie.builder()
                .title("Kung Fu Panda 4")
                .description("Po chuĂ¡ÂºÂ©n bĂ¡Â»â€¹ trĂ¡Â»Å¸ thÄ‚Â nh ThĂ¡Â»Â§ lĂ„Â©nh Tinh thĂ¡ÂºÂ§n cĂ¡Â»Â§a Thung lĂ…Â©ng BÄ‚Â¬nh YÄ‚Âªn vÄ‚Â  phĂ¡ÂºÂ£i tÄ‚Â¬m kiĂ¡ÂºÂ¿m mĂ¡Â»â„¢t ThĂ¡ÂºÂ§n Long Ă„ÂĂ¡ÂºÂ¡i HiĂ¡Â»â€¡p mĂ¡Â»â€ºi.")
                .durationMinutes(94)
                .ageRating("P")
                .language("LĂ¡Â»â€œng tiĂ¡ÂºÂ¿ng ViĂ¡Â»â€¡t / PhĂ¡Â»Â¥ Ă„â€˜Ă¡Â»Â")
                .director("Mike Mitchell")
                .status("now_showing")
                .releaseDate(LocalDate.of(2024, 3, 8))
                .endDate(LocalDate.of(2026, 12, 31))
                .posterUrl("/images/posters/kungfupanda4.jpg")
                .trailerUrl("https://www.youtube.com/watch?v=_inKs4eeHiI")
                .build());

        movieGenreRepository.save(MovieGenre.builder().movie(kungfuPanda).genre(hoatHinh).build());
        movieGenreRepository.save(MovieGenre.builder().movie(kungfuPanda).genre(haiHuoc).build());
        movieGenreRepository.save(MovieGenre.builder().movie(kungfuPanda).genre(phieuLuu).build());

        // 3. CĂ¡Â»Â¥m rĂ¡ÂºÂ¡p & PhÄ‚Â²ng chiĂ¡ÂºÂ¿u (Cinemas & CinemaRooms)
        Cinema cgvVincom = cinemaRepository.save(Cinema.builder()
                .name("CGV Vincom Ă„ÂĂ¡Â»â€œng KhĂ¡Â»Å¸i")
                .address("TĂ¡ÂºÂ§ng 3, TTTM Vincom Center, 72 LÄ‚Âª ThÄ‚Â¡nh TÄ‚Â´n, BĂ¡ÂºÂ¿n NghÄ‚Â©")
                .city("HĂ¡Â»â€œ ChÄ‚Â­ Minh")
                .district("QuĂ¡ÂºÂ­n 1")
                .phone("1900 6017")
                .email("cgv_dongkhoi@cgv.vn")
                .latitude(new BigDecimal("10.7779"))
                .longitude(new BigDecimal("106.7018"))
                .build());

        cinemaRoomRepository.save(CinemaRoom.builder().cinema(cgvVincom).name("PhÄ‚Â²ng 1 (IMAX)").roomType("IMAX").totalSeats(120).status("active").build());
        cinemaRoomRepository.save(CinemaRoom.builder().cinema(cgvVincom).name("PhÄ‚Â²ng 2 (Gold Class)").roomType("2D").totalSeats(48).status("active").build());
        cinemaRoomRepository.save(CinemaRoom.builder().cinema(cgvVincom).name("PhÄ‚Â²ng 3 (Standard)").roomType("2D").totalSeats(90).status("active").build());

        Cinema lotteCanTho = cinemaRepository.save(Cinema.builder()
                .name("Lotte Cinema CĂ¡ÂºÂ§n ThĂ†Â¡")
                .address("TĂ¡ÂºÂ§ng 3 Lotte Mart, 84 MĂ¡ÂºÂ­u ThÄ‚Â¢n, An HÄ‚Â²a")
                .city("CĂ¡ÂºÂ§n ThĂ†Â¡")
                .district("Ninh KiĂ¡Â»Âu")
                .phone("0292 3696 868")
                .email("lotte_cantho@lotte.vn")
                .latitude(new BigDecimal("10.0452"))
                .longitude(new BigDecimal("105.7469"))
                .build());

        cinemaRoomRepository.save(CinemaRoom.builder().cinema(lotteCanTho).name("Cinema 1").roomType("2D").totalSeats(80).status("active").build());
        cinemaRoomRepository.save(CinemaRoom.builder().cinema(lotteCanTho).name("Cinema 2 (3D)").roomType("3D").totalSeats(75).status("active").build());

        Cinema galaxyNguyenDu = cinemaRepository.save(Cinema.builder()
                .name("Galaxy NguyĂ¡Â»â€¦n Du")
                .address("116 NguyĂ¡Â»â€¦n Du, PhĂ†Â°Ă¡Â»Âng BĂ¡ÂºÂ¿n ThÄ‚Â nh")
                .city("HĂ¡Â»â€œ ChÄ‚Â­ Minh")
                .district("QuĂ¡ÂºÂ­n 1")
                .phone("1900 2224")
                .email("galaxy_nguyendu@galaxy.vn")
                .latitude(new BigDecimal("10.7735"))
                .longitude(new BigDecimal("106.6934"))
                .build());

        cinemaRoomRepository.save(CinemaRoom.builder().cinema(galaxyNguyenDu).name("Screen 1").roomType("2D").totalSeats(100).status("active").build());
        cinemaRoomRepository.save(CinemaRoom.builder().cinema(galaxyNguyenDu).name("Screen 2").roomType("2D").totalSeats(85).status("active").build());

        // 4. Banner quĂ¡ÂºÂ£ng cÄ‚Â¡o
        bannerRepository.save(Banner.builder()
                .title("Dune 2 - Bom tĂ¡ÂºÂ¥n viĂ¡Â»â€¦n tĂ†Â°Ă¡Â»Å¸ng khÄ‚Â´ng thĂ¡Â»Æ’ bĂ¡Â»Â lĂ¡Â»Â¡")
                .imageUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1")
                .linkUrl("/movies/" + dune2.getId())
                .targetType("movie")
                .targetId(dune2.getId())
                .displayOrder(1)
                .isActive(true)
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .build());

        bannerRepository.save(Banner.builder()
                .title("Ă†Â¯u Ă„â€˜Ä‚Â£i thÄ‚Â nh viÄ‚Âªn - GiĂ¡ÂºÂ£m 20% bĂ¡ÂºÂ¯p nĂ†Â°Ă¡Â»â€ºc mĂ¡Â»â€”i thĂ¡Â»Â© TĂ†Â°")
                .imageUrl("https://images.unsplash.com/photo-1572177812156-58036aae439c")
                .linkUrl("/promotions/member-wednesday")
                .targetType("event")
                .displayOrder(2)
                .isActive(true)
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2026, 12, 31))
                .build());

        // 5. NgÄ‚Â y lĂ¡Â»â€¦ (Holidays)
        holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 1, 1)).name("TĂ¡ÂºÂ¿t DĂ†Â°Ă†Â¡ng LĂ¡Â»â€¹ch").type("national").build());
        holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 4, 30)).name("NgÄ‚Â y GiĂ¡ÂºÂ£i phÄ‚Â³ng MiĂ¡Â»Ân Nam").type("national").build());
        holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 5, 1)).name("QuĂ¡Â»â€˜c tĂ¡ÂºÂ¿ Lao Ă„â€˜Ă¡Â»â„¢ng").type("national").build());
        holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 9, 2)).name("QuĂ¡Â»â€˜c KhÄ‚Â¡nh").type("national").build());

        // 6. TÄ‚Â i khoĂ¡ÂºÂ£n mĂ¡ÂºÂ«u
        userRepository.save(User.builder()
                .fullName("QuĂ¡ÂºÂ£n TrĂ¡Â»â€¹ ViÄ‚Âªn")
                .email("admin@cinema.com")
                .phone("0901234567")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role("ADMIN")
                .loyaltyPoints(1000)
                .memberTier("platinum")
                .status("active")
                .build());

        userRepository.save(User.builder()
                .fullName("NguyĂ¡Â»â€¦n VĂ„Æ’n A")
                .email("khachhang@gmail.com")
                .phone("0912345678")
                .passwordHash(passwordEncoder.encode("Customer@123"))
                .role("CUSTOMER")
                .loyaltyPoints(50)
                .memberTier("bronze")
                .status("active")
                .build());

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o dĂ¡Â»Â¯ liĂ¡Â»â€¡u mĂ¡ÂºÂ«u TuĂ¡ÂºÂ§n 1 hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void seedWeek2Data() {
        seedSeats();
        seedTicketPriceRules();
        seedShowtimes();
        seedFnbItems();
        seedSampleBookingsAndTickets();
    }

    private void seedSeats() {
        if (seatRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u ghĂ¡ÂºÂ¿ Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("TĂ¡Â»Â± Ă„â€˜Ă¡Â»â„¢ng sinh ma trĂ¡ÂºÂ­n ghĂ¡ÂºÂ¿ cho tĂ¡ÂºÂ¥t cĂ¡ÂºÂ£ phÄ‚Â²ng chiĂ¡ÂºÂ¿u...");
        List<CinemaRoom> rooms = cinemaRoomRepository.findAll();

        for (CinemaRoom room : rooms) {
            int rows = 8;
            int cols = 10;
            Set<String> vipRows = new HashSet<>(Arrays.asList("D", "E", "F"));
            Set<String> coupleRows = new HashSet<>(Collections.singletonList("H"));

            if ("IMAX".equalsIgnoreCase(room.getRoomType())) {
                rows = 10;
                cols = 12;
                vipRows = new HashSet<>(Arrays.asList("D", "E", "F", "G"));
                coupleRows = new HashSet<>(Collections.singletonList("J"));
            } else if ("PhÄ‚Â²ng 2 (Gold Class)".equalsIgnoreCase(room.getName())) {
                rows = 6;
                cols = 8;
                vipRows = new HashSet<>(Arrays.asList("C", "D"));
                coupleRows = new HashSet<>(Collections.singletonList("F"));
            }

            List<Seat> seats = new ArrayList<>();
            for (int r = 1; r <= rows; r++) {
                char rowChar = (char) ('A' + r - 1);
                String rowName = String.valueOf(rowChar);

                String seatType = "standard";
                if (coupleRows.contains(rowName)) {
                    seatType = "couple";
                } else if (vipRows.contains(rowName)) {
                    seatType = "vip";
                }

                for (int c = 1; c <= cols; c++) {
                    String seatNumber = String.format("%s%02d", rowName, c);
                    seats.add(Seat.builder()
                            .cinemaRoom(room)
                            .seatNumber(seatNumber)
                            .seatType(seatType)
                            .rowIndex(r)
                            .colIndex(c)
                            .build());
                }
            }

            seatRepository.saveAll(seats);
            room.setTotalSeats(seats.size());
            cinemaRoomRepository.save(room);
        }
        log.info("Sinh ma trĂ¡ÂºÂ­n ghĂ¡ÂºÂ¿ thÄ‚Â nh cÄ‚Â´ng!");
    }

    private void seedTicketPriceRules() {
        if (ticketPriceRuleRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u bĂ¡ÂºÂ£ng giÄ‚Â¡ vÄ‚Â© Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o danh mĂ¡Â»Â¥c quy tĂ¡ÂºÂ¯c tÄ‚Â­nh giÄ‚Â¡ vÄ‚Â© (Ticket Price Rules)...");

        // Quy tĂ¡ÂºÂ¯c chuĂ¡ÂºÂ©n 2D
        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("standard").dayType("weekday").timeSlot("morning")
                .customerType("adult").price(new BigDecimal("65000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("standard").dayType("weekday").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("75000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("standard").dayType("weekend").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("95000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("standard").dayType("holiday").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("110000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("vip").dayType("weekday").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("90000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("vip").dayType("weekend").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("115000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("2D").seatType("couple").dayType("weekend").timeSlot("evening")
                .customerType("adult").price(new BigDecimal("190000.00")).isActive(true).build());

        // Quy tĂ¡ÂºÂ¯c 3D
        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("3D").seatType("standard").dayType("weekday").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("110000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("3D").seatType("standard").dayType("weekend").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("135000.00")).isActive(true).build());

        // Quy tĂ¡ÂºÂ¯c IMAX
        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("IMAX").seatType("standard").dayType("weekday").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("150000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("IMAX").seatType("standard").dayType("weekend").timeSlot("regular")
                .customerType("adult").price(new BigDecimal("180000.00")).isActive(true).build());

        ticketPriceRuleRepository.save(TicketPriceRule.builder()
                .screenType("IMAX").seatType("vip").dayType("weekend").timeSlot("evening")
                .customerType("adult").price(new BigDecimal("220000.00")).isActive(true).build());

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o bĂ¡ÂºÂ£ng giÄ‚Â¡ vÄ‚Â© hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void seedShowtimes() {
        if (showtimeRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u suĂ¡ÂºÂ¥t chiĂ¡ÂºÂ¿u Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o lĂ¡Â»â€¹ch chiĂ¡ÂºÂ¿u mĂ¡ÂºÂ«u (Showtimes)...");
        List<Movie> movies = movieRepository.findAll();
        List<CinemaRoom> rooms = cinemaRoomRepository.findAll();

        if (movies.isEmpty() || rooms.isEmpty()) return;

        Movie mai = movies.stream().filter(m -> m.getTitle().contains("Mai")).findFirst().orElse(movies.get(0));
        Movie dune2 = movies.stream().filter(m -> m.getTitle().contains("Dune")).findFirst().orElse(movies.get(0));
        Movie kungfu = movies.stream().filter(m -> m.getTitle().contains("Panda")).findFirst().orElse(movies.get(0));

        CinemaRoom imaxRoom = rooms.stream().filter(r -> "IMAX".equalsIgnoreCase(r.getRoomType())).findFirst().orElse(rooms.get(0));
        CinemaRoom room2D_1 = rooms.stream().filter(r -> "2D".equalsIgnoreCase(r.getRoomType())).findFirst().orElse(rooms.get(0));
        CinemaRoom room2D_2 = rooms.size() > 2 ? rooms.get(2) : room2D_1;

        LocalDate today = LocalDate.now();

        // LĂ¡Â»â€¹ch chiĂ¡ÂºÂ¿u hÄ‚Â´m nay & ngÄ‚Â y mai
        for (int dayOffset = 0; dayOffset <= 2; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);

            // IMAX Room: chiĂ¡ÂºÂ¿u Dune 2
            showtimeRepository.save(Showtime.builder()
                    .movie(dune2)
                    .cinemaRoom(imaxRoom)
                    .showDate(date)
                    .startTime(LocalTime.of(10, 0))
                    .screenFormat("IMAX")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(dune2)
                    .cinemaRoom(imaxRoom)
                    .showDate(date)
                    .startTime(LocalTime.of(14, 0))
                    .screenFormat("IMAX")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(dune2)
                    .cinemaRoom(imaxRoom)
                    .showDate(date)
                    .startTime(LocalTime.of(18, 0))
                    .screenFormat("IMAX")
                    .status("open")
                    .build());

            // 2D Room 1: chiĂ¡ÂºÂ¿u phim Mai
            showtimeRepository.save(Showtime.builder()
                    .movie(mai)
                    .cinemaRoom(room2D_1)
                    .showDate(date)
                    .startTime(LocalTime.of(9, 30))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(mai)
                    .cinemaRoom(room2D_1)
                    .showDate(date)
                    .startTime(LocalTime.of(13, 0))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(mai)
                    .cinemaRoom(room2D_1)
                    .showDate(date)
                    .startTime(LocalTime.of(16, 30))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(mai)
                    .cinemaRoom(room2D_1)
                    .showDate(date)
                    .startTime(LocalTime.of(20, 0))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            // 2D Room 2: chiĂ¡ÂºÂ¿u Kung Fu Panda
            showtimeRepository.save(Showtime.builder()
                    .movie(kungfu)
                    .cinemaRoom(room2D_2)
                    .showDate(date)
                    .startTime(LocalTime.of(10, 30))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(kungfu)
                    .cinemaRoom(room2D_2)
                    .showDate(date)
                    .startTime(LocalTime.of(14, 30))
                    .screenFormat("2D")
                    .status("open")
                    .build());

            showtimeRepository.save(Showtime.builder()
                    .movie(kungfu)
                    .cinemaRoom(room2D_2)
                    .showDate(date)
                    .startTime(LocalTime.of(17, 30))
                    .screenFormat("2D")
                    .status("open")
                    .build());
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o suĂ¡ÂºÂ¥t chiĂ¡ÂºÂ¿u hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void seedFnbItems() {
        if (fnbItemRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u bĂ¡ÂºÂ¯p nĂ†Â°Ă¡Â»â€ºc Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o danh mĂ¡Â»Â¥c bĂ¡ÂºÂ¯p nĂ†Â°Ă¡Â»â€ºc & combo F&B...");

        fnbItemRepository.save(FnbItem.builder()
                .itemName("BĂ¡ÂºÂ¯p Rang BĂ†Â¡ TruyĂ¡Â»Ân ThĂ¡Â»â€˜ng (L)")
                .category("popcorn")
                .description("BĂ¡ÂºÂ¯p rang thĂ†Â¡m bÄ‚Â©o vĂ¡Â»â€¹ bĂ†Â¡ ngĂ¡Â»Ât tĂ¡Â»Â± nhiÄ‚Âªn cĂ¡Â»Â¡ lĂ¡Â»â€ºn")
                .imageUrl("https://images.unsplash.com/photo-1578849278619-e73505e9610f")
                .basePrice(new BigDecimal("49000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("BĂ¡ÂºÂ¯p PhÄ‚Â´ Mai ThĂ†Â°Ă¡Â»Â£ng HĂ¡ÂºÂ¡ng (L)")
                .category("popcorn")
                .description("BĂ¡ÂºÂ¯p giÄ‚Â²n phĂ¡Â»Â§ lĂ¡Â»â€ºp bĂ¡Â»â„¢t phÄ‚Â´ mai hĂ¡ÂºÂ£o hĂ¡ÂºÂ¡ng Ă„â€˜Ă¡ÂºÂ­m Ă„â€˜Ä‚Â ")
                .imageUrl("https://images.unsplash.com/photo-1585647347483-22b66260dfff")
                .basePrice(new BigDecimal("55000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("BĂ¡ÂºÂ¯p Caramel ChÄ‚Â¡y (L)")
                .category("popcorn")
                .description("BĂ¡ÂºÂ¯p caramel giÄ‚Â²n rĂ¡Â»Â¥m thĂ†Â¡m lĂ¡Â»Â«ng ngĂ¡Â»Ât ngÄ‚Â o")
                .imageUrl("https://images.unsplash.com/photo-1505686994434-e3cc5abf1330")
                .basePrice(new BigDecimal("55000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("Coca-Cola TĂ†Â°Ă†Â¡i 32oz")
                .category("drink")
                .description("NĂ†Â°Ă¡Â»â€ºc ngĂ¡Â»Ât Coca-Cola tĂ†Â°Ă†Â¡i mÄ‚Â¡t lĂ¡ÂºÂ¡nh giĂ¡ÂºÂ£i khÄ‚Â¡t")
                .imageUrl("https://images.unsplash.com/photo-1622483767028-3f66f32aef97")
                .basePrice(new BigDecimal("35000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("Sprite Chanh TĂ†Â°Ă†Â¡i 32oz")
                .category("drink")
                .description("NĂ†Â°Ă¡Â»â€ºc ngĂ¡Â»Ât vĂ¡Â»â€¹ chanh Sprite sĂ¡ÂºÂ£ng khoÄ‚Â¡i mÄ‚Â¡t lĂ¡ÂºÂ¡nh")
                .imageUrl("https://images.unsplash.com/photo-1551024709-8f23befc6f87")
                .basePrice(new BigDecimal("35000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("Combo Solo (1 BĂ¡ÂºÂ¯p L + 1 NĂ†Â°Ă¡Â»â€ºc 32oz)")
                .category("combo")
                .description("TiĂ¡ÂºÂ¿t kiĂ¡Â»â€¡m 15% - ThÄ‚Â­ch hĂ¡Â»Â£p cho 1 ngĂ†Â°Ă¡Â»Âi xem phim")
                .imageUrl("https://images.unsplash.com/photo-1572177812156-58036aae439c")
                .basePrice(new BigDecimal("79000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("Combo Couple (1 BĂ¡ÂºÂ¯p L + 2 NĂ†Â°Ă¡Â»â€ºc 32oz)")
                .category("combo")
                .description("TiĂ¡ÂºÂ¿t kiĂ¡Â»â€¡m 20% - DÄ‚Â nh cho cÄ‚Â¡c cĂ¡ÂºÂ·p Ă„â€˜Ä‚Â´i hĂ¡ÂºÂ¹n hÄ‚Â² rĂ¡ÂºÂ¡p chiĂ¡ÂºÂ¿u")
                .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c")
                .basePrice(new BigDecimal("109000.00"))
                .isActive(true)
                .build());

        fnbItemRepository.save(FnbItem.builder()
                .itemName("Combo Family (2 BĂ¡ÂºÂ¯p L + 4 NĂ†Â°Ă¡Â»â€ºc 22oz)")
                .category("combo")
                .description("TiĂ¡ÂºÂ¿t kiĂ¡Â»â€¡m 25% - HoÄ‚Â n hĂ¡ÂºÂ£o cho gia Ă„â€˜Ä‚Â¬nh hoĂ¡ÂºÂ·c nhÄ‚Â³m bĂ¡ÂºÂ¡n 4 ngĂ†Â°Ă¡Â»Âi")
                .imageUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba")
                .basePrice(new BigDecimal("189000.00"))
                .isActive(true)
                .build());

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o danh mĂ¡Â»Â¥c bĂ¡ÂºÂ¯p nĂ†Â°Ă¡Â»â€ºc hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void seedSampleBookingsAndTickets() {
        if (ticketRepository.count() > 0) return;

        List<Showtime> showtimes = showtimeRepository.findAll();
        List<User> users = userRepository.findAll();
        if (showtimes.isEmpty() || users.isEmpty()) return;

        Showtime firstShowtime = showtimes.get(0);
        User customer = users.stream().filter(u -> "CUSTOMER".equals(u.getRole())).findFirst().orElse(users.get(0));

        List<Seat> roomSeats = seatRepository.findByCinemaRoomIdOrderByRowIndexAscColIndexAsc(firstShowtime.getCinemaRoom().getId());
        if (roomSeats.size() < 2) return;

        Seat seat1 = roomSeats.get(14); // VÄ‚Â­ dĂ¡Â»Â¥ ghĂ¡ÂºÂ¿ B03
        Seat seat2 = roomSeats.get(15); // VÄ‚Â­ dĂ¡Â»Â¥ ghĂ¡ÂºÂ¿ B04

        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-100001")
                .user(customer)
                .showtime(firstShowtime)
                .contactEmail(customer.getEmail())
                .contactPhone(customer.getPhone())
                .paymentMethod("VNPAY")
                .paymentStatus("paid")
                .paymentTransactionId("TXN-VNPAY-100001")
                .subtotal(new BigDecimal("180000.00"))
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("180000.00"))
                .paidAt(LocalDateTime.now().minusHours(2))
                .status("confirmed")
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(booking)
                .showtime(firstShowtime)
                .seat(seat1)
                .seatCode(seat1.getSeatNumber())
                .seatType(seat1.getSeatType())
                .finalPrice(new BigDecimal("90000.00"))
                .ticketCode("TK-100001-" + seat1.getSeatNumber())
                .qrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-100001-" + seat1.getSeatNumber())
                .checkinStatus("unchecked")
                .build());

        ticketRepository.save(Ticket.builder()
                .booking(booking)
                .showtime(firstShowtime)
                .seat(seat2)
                .seatCode(seat2.getSeatNumber())
                .seatType(seat2.getSeatType())
                .finalPrice(new BigDecimal("90000.00"))
                .ticketCode("TK-100001-" + seat2.getSeatNumber())
                .qrCodeUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-100001-" + seat2.getSeatNumber())
                .checkinStatus("unchecked")
                .build());

        log.info("Ă„ÂÄ‚Â£ tĂ¡ÂºÂ¡o mĂ¡ÂºÂ«u 1 Ă„â€˜Ă†Â¡n Ă„â€˜Ă¡ÂºÂ·t vÄ‚Â© vÄ‚Â  2 ghĂ¡ÂºÂ¿ Ă„â€˜Ä‚Â£ Ă„â€˜Ă¡ÂºÂ·t cho suĂ¡ÂºÂ¥t chiĂ¡ÂºÂ¿u #{} Ă„â€˜Ă¡Â»Æ’ kiĂ¡Â»Æ’m thĂ¡Â»Â­ giao diĂ¡Â»â€¡n sĂ†Â¡ Ă„â€˜Ă¡Â»â€œ ghĂ¡ÂºÂ¿!", firstShowtime.getId());
    }

    private void seedWeek3Data() {
        seedCoupons();
        seedTransactionsAndHistory();
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u mÄ‚Â£ giĂ¡ÂºÂ£m giÄ‚Â¡ (Coupons) Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o danh mĂ¡Â»Â¥c mÄ‚Â£ giĂ¡ÂºÂ£m giÄ‚Â¡ (Coupons) cho TuĂ¡ÂºÂ§n 3...");

        couponRepository.save(Coupon.builder()
                .code("CINEMA20")
                .type("percentage")
                .value(new BigDecimal("20.00"))
                .minOrderAmount(new BigDecimal("150000.00"))
                .maxDiscount(new BigDecimal("50000.00"))
                .usageLimit(100)
                .usedCount(1)
                .perUserLimit(2)
                .validFrom(LocalDateTime.of(2026, 1, 1, 0, 0))
                .validTo(LocalDateTime.of(2026, 12, 31, 23, 59))
                .status("active")
                .build());

        couponRepository.save(Coupon.builder()
                .code("WELCOME30K")
                .type("fixed_amount")
                .value(new BigDecimal("30000.00"))
                .minOrderAmount(new BigDecimal("100000.00"))
                .maxDiscount(new BigDecimal("30000.00"))
                .usageLimit(200)
                .usedCount(0)
                .perUserLimit(1)
                .validFrom(LocalDateTime.of(2026, 1, 1, 0, 0))
                .validTo(LocalDateTime.of(2026, 12, 31, 23, 59))
                .status("active")
                .build());

        couponRepository.save(Coupon.builder()
                .code("VIP50K")
                .type("fixed_amount")
                .value(new BigDecimal("50000.00"))
                .minOrderAmount(new BigDecimal("300000.00"))
                .maxDiscount(new BigDecimal("50000.00"))
                .usageLimit(50)
                .usedCount(0)
                .perUserLimit(3)
                .validFrom(LocalDateTime.of(2026, 1, 1, 0, 0))
                .validTo(LocalDateTime.of(2026, 12, 31, 23, 59))
                .status("active")
                .build());

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o mÄ‚Â£ giĂ¡ÂºÂ£m giÄ‚Â¡ hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void seedTransactionsAndHistory() {
        if (paymentAttemptRepository.count() > 0) {
            log.info("DĂ¡Â»Â¯ liĂ¡Â»â€¡u giao dĂ¡Â»â€¹ch thanh toÄ‚Â¡n & lĂ¡Â»â€¹ch sĂ¡Â»Â­ Ă„â€˜Ă†Â¡n TuĂ¡ÂºÂ§n 3 Ă„â€˜Ä‚Â£ tĂ¡Â»â€œn tĂ¡ÂºÂ¡i.");
            return;
        }

        List<Booking> bookings = bookingRepository.findAll();
        if (bookings.isEmpty()) return;

        Booking firstBooking = bookings.get(0);
        List<FnbItem> fnbItems = fnbItemRepository.findAll();

        // NĂ¡ÂºÂ¡p mĂ¡ÂºÂ«u bĂ¡ÂºÂ¯p nĂ†Â°Ă¡Â»â€ºc Ă„â€˜i kÄ‚Â¨m Ă„â€˜Ă†Â¡n Ă„â€˜Ă¡ÂºÂ§u tiÄ‚Âªn nĂ¡ÂºÂ¿u chĂ†Â°a cÄ‚Â³
        if (bookingFnbRepository.count() == 0 && !fnbItems.isEmpty()) {
            FnbItem combo = fnbItems.stream()
                    .filter(i -> "combo".equalsIgnoreCase(i.getCategory()))
                    .findFirst()
                    .orElse(fnbItems.get(0));

            bookingFnbRepository.save(BookingFnb.builder()
                    .booking(firstBooking)
                    .fnbItem(combo)
                    .quantity(1)
                    .unitPrice(combo.getBasePrice())
                    .totalPrice(combo.getBasePrice())
                    .pickupStatus("unclaimed")
                    .build());
        }

        // NĂ¡ÂºÂ¡p lĂ¡Â»â€¹ch sĂ¡Â»Â­ trĂ¡ÂºÂ¡ng thÄ‚Â¡i Ă„â€˜Ă†Â¡n Ă„â€˜Ă¡ÂºÂ·t vÄ‚Â©
        if (bookingStatusHistoryRepository.count() == 0) {
            bookingStatusHistoryRepository.save(BookingStatusHistory.builder()
                    .booking(firstBooking)
                    .oldStatus(null)
                    .newStatus("pending")
                    .note("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o Ă„â€˜Ă†Â¡n Ă„â€˜Ă¡ÂºÂ·t vÄ‚Â© mĂ¡ÂºÂ«u vÄ‚Â  giĂ¡Â»Â¯ ghĂ¡ÂºÂ¿ tĂ¡ÂºÂ¡m thĂ¡Â»Âi (5 phÄ‚Âºt)")
                    .changedBy(firstBooking.getContactEmail())
                    .build());

            bookingStatusHistoryRepository.save(BookingStatusHistory.builder()
                    .booking(firstBooking)
                    .oldStatus("pending")
                    .newStatus("confirmed")
                    .note("Thanh toÄ‚Â¡n thÄ‚Â nh cÄ‚Â´ng qua VNPAY (SĂ¡Â»â€˜ tiĂ¡Â»Ân: 180000.00 VNĂ„Â, Ă„ÂiĂ¡Â»Æ’m thĂ†Â°Ă¡Â»Å¸ng cĂ¡Â»â„¢ng: +180 Ă„â€˜iĂ¡Â»Æ’m)")
                    .changedBy("PAYMENT_GATEWAY")
                    .build());
        }

        // NĂ¡ÂºÂ¡p giao dĂ¡Â»â€¹ch thanh toÄ‚Â¡n mĂ¡ÂºÂ«u
        paymentAttemptRepository.save(PaymentAttempt.builder()
                .booking(firstBooking)
                .paymentMethod("VNPAY")
                .transactionId(firstBooking.getPaymentTransactionId() != null ? firstBooking.getPaymentTransactionId() : "TXN-VNPAY-100001")
                .amount(firstBooking.getTotalAmount())
                .status("success")
                .gatewayResponse("{\"resultCode\":0,\"message\":\"Giao dĂ¡Â»â€¹ch thÄ‚Â nh cÄ‚Â´ng\"}")
                .build());

        // NĂ¡ÂºÂ¡p giao dĂ¡Â»â€¹ch tÄ‚Â­ch Ă„â€˜iĂ¡Â»Æ’m thĂ†Â°Ă¡Â»Å¸ng thÄ‚Â nh viÄ‚Âªn mĂ¡ÂºÂ«u
        User user = firstBooking.getUser();
        if (user != null && loyaltyTransactionRepository.count() == 0) {
            int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 50;
            int newBalance = currentPoints + 180;
            user.setLoyaltyPoints(newBalance);
            user.setMemberTier(newBalance >= 200 ? "silver" : "bronze");
            userRepository.save(user);

            loyaltyTransactionRepository.save(LoyaltyTransaction.builder()
                    .user(user)
                    .booking(firstBooking)
                    .type("earn")
                    .points(180)
                    .balanceAfter(newBalance)
                    .description("TÄ‚Â­ch +180 Ă„â€˜iĂ¡Â»Æ’m thĂ†Â°Ă¡Â»Å¸ng tĂ¡Â»Â« Ă„â€˜Ă†Â¡n Ă„â€˜Ă¡ÂºÂ·t vÄ‚Â© " + firstBooking.getBookingCode())
                    .build());
        }

        log.info("KhĂ¡Â»Å¸i tĂ¡ÂºÂ¡o dĂ¡Â»Â¯ liĂ¡Â»â€¡u mĂ¡ÂºÂ«u TuĂ¡ÂºÂ§n 3 (Coupons, BookingFnb, BookingStatusHistory, PaymentAttempt, LoyaltyTransaction) hoÄ‚Â n tĂ¡ÂºÂ¥t!");
    }

    private void syncDefaultUsersAndPasswords() {
        // 1. Admin
        userRepository.findByEmail("admin@cinema.com").ifPresentOrElse(admin -> {
            if (!passwordEncoder.matches("Admin@123", admin.getPasswordHash())) {
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole("ADMIN");
                admin.setStatus("active");
                userRepository.save(admin);
                log.info("ÄĂ£ Ä‘á»“ng bá»™ láº¡i máº­t kháº©u BCrypt cho tĂ i khoáº£n admin@cinema.com");
            }
        }, () -> {
            userRepository.save(User.builder()
                    .fullName("Quáº£n Trá»‹ ViĂªn")
                    .email("admin@cinema.com")
                    .phone("0901234567")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role("ADMIN")
                    .loyaltyPoints(1000)
                    .memberTier("platinum")
                    .status("active")
                    .build());
            log.info("ÄĂ£ táº¡o má»›i tĂ i khoáº£n admin@cinema.com");
        });

        // 2. Staff
        userRepository.findByEmail("staff@cinema.com").ifPresentOrElse(staff -> {
            if (!passwordEncoder.matches("Staff@123", staff.getPasswordHash())) {
                staff.setPasswordHash(passwordEncoder.encode("Staff@123"));
                staff.setRole("STAFF");
                staff.setStatus("active");
                staff.setFullName("Nhân Viên Soát Vé");
                userRepository.save(staff);
                log.info("ÄĂ£ Ä‘á»“ng bá»™ láº¡i máº­t kháº©u BCrypt cho tĂ i khoáº£n staff@cinema.com");
            }
        }, () -> {
            userRepository.save(User.builder()
                    .fullName("Nhân Viên Soát Vé")
                    .email("staff@cinema.com")
                    .phone("0909999888")
                    .passwordHash(passwordEncoder.encode("Staff@123"))
                    .role("STAFF")
                    .loyaltyPoints(0)
                    .memberTier("bronze")
                    .status("active")
                    .build());
            log.info("ÄĂ£ táº¡o má»›i tĂ i khoáº£n staff@cinema.com");
        });

        // 3. Customer
        userRepository.findByEmail("khachhang@gmail.com").ifPresentOrElse(cust -> {
            if (!passwordEncoder.matches("Customer@123", cust.getPasswordHash())) {
                cust.setPasswordHash(passwordEncoder.encode("Customer@123"));
                cust.setRole("CUSTOMER");
                cust.setStatus("active");
                userRepository.save(cust);
                log.info("ÄĂ£ Ä‘á»“ng bá»™ láº¡i máº­t kháº©u BCrypt cho tĂ i khoáº£n khachhang@gmail.com");
            }
        }, () -> {
            userRepository.save(User.builder()
                    .fullName("Nguyá»…n VÄƒn A")
                    .email("khachhang@gmail.com")
                    .phone("0912345678")
                    .passwordHash(passwordEncoder.encode("Customer@123"))
                    .role("CUSTOMER")
                    .loyaltyPoints(50)
                    .memberTier("bronze")
                    .status("active")
                    .build());
            log.info("ÄĂ£ táº¡o má»›i tĂ i khoáº£n khachhang@gmail.com");
        });
    }

    private void seedReviewAndFavoriteData() {
        seedAdditionalMoviesAndShowtimes();

        if (reviewRepository.count() > 0 && favoriteRepository.count() > 0) {
            return;
        }

        java.util.Optional<User> customerOpt = userRepository.findByEmail("khachhang@gmail.com");
        if (customerOpt.isEmpty()) {
            return;
        }
        User customer = customerOpt.get();

        java.util.List<Movie> movies = movieRepository.findAll();
        if (movies.isEmpty()) {
            return;
        }

        Movie firstMovie = movies.get(0);

        if (reviewRepository.count() == 0) {
            reviewRepository.save(Review.builder()
                    .user(customer)
                    .movie(firstMovie)
                    .rating(5)
                    .comment("Phim rất hay, nội dung sâu sắc và dàn diễn viên xuất sắc!")
                    .status("approved")
                    .build());

            if (movies.size() > 1) {
                reviewRepository.save(Review.builder()
                        .user(customer)
                        .movie(movies.get(1))
                        .rating(4)
                        .comment("Hình ảnh và âm thanh hoành tráng, rất đáng xem tại rạp!")
                        .status("approved")
                        .build());
            }
            log.info("Khởi tạo đánh giá phim mẫu hoàn tất!");
        }

        if (favoriteRepository.count() == 0) {
            favoriteRepository.save(Favorite.builder()
                    .user(customer)
                    .movie(firstMovie)
                    .build());

            if (movies.size() > 1) {
                favoriteRepository.save(Favorite.builder()
                        .user(customer)
                        .movie(movies.get(1))
                        .build());
            }
            log.info("Khởi tạo danh sách phim yêu thích mẫu hoàn tất!");
        }
    }

    private void seedAdditionalMoviesAndShowtimes() {
        List<Movie> existingMovies = movieRepository.findAll();
        List<Genre> allGenres = genreRepository.findAll();
        if (allGenres.isEmpty()) return;

        Genre hanhDong = allGenres.stream().filter(g -> "hanh-dong".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre kinhDi = allGenres.stream().filter(g -> "kinh-di".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre haiHuoc = allGenres.stream().filter(g -> "hai-huoc".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre tinhCam = allGenres.stream().filter(g -> "tinh-cam".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre sciFi = allGenres.stream().filter(g -> "khoa-hoc-vien-tuong".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre phieuLuu = allGenres.stream().filter(g -> "phieu-luu".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));
        Genre tamLy = allGenres.stream().filter(g -> "tam-ly".equals(g.getSlug())).findFirst().orElse(allGenres.get(0));

        List<Movie> newlyAddedNowShowing = new ArrayList<>();

        // 1. Godzilla x Kong: Đế Chế Mới
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("godzilla"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Godzilla x Kong: Đế Chế Mới")
                    .description("Hai siêu quái thú Godzilla và Kong buộc phải hợp sức đối đầu với một mối đe dọa khổng lồ ẩn sâu trong Trái Đất Rỗng.")
                    .durationMinutes(115)
                    .ageRating("C13")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Adam Wingard")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 3, 29))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0")
                    .trailerUrl("https://www.youtube.com/watch?v=lV1OOlGwExM")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(phieuLuu).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Adam Wingard").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Rebecca Hall").characterName("Dr. Ilene Andrews").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Dan Stevens").characterName("Trapper").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 2. The First Omen: Điềm Báo Của Quỷ
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("omen"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("The First Omen: Điềm Báo Của Quỷ")
                    .description("Một phụ nữ trẻ người Mỹ được gửi đến Rome để bắt đầu cuộc đời phụng sự Giáo hội, nhưng lại đối mặt với bóng tối kinh hoàng.")
                    .durationMinutes(119)
                    .ageRating("C18")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Arkasha Stevenson")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 4, 5))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5")
                    .trailerUrl("https://www.youtube.com/watch?v=lmN1Op8ygno")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(kinhDi).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(tamLy).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Arkasha Stevenson").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Nell Tiger Free").characterName("Margaret").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Bill Nighy").characterName("Cardinal Lawrence").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 3. Poor Things
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("poor things"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Poor Things")
                    .description("Câu chuyện kỳ ảo về sự hồi sinh và hành trình khám phá thế giới đầy tự do của Bella Baxter dưới bàn tay nhà khoa học Godwin Baxter.")
                    .durationMinutes(141)
                    .ageRating("C18")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Yorgos Lanthimos")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 1, 19))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1514539079130-25950c84af65")
                    .trailerUrl("https://www.youtube.com/watch?v=RlbR5N6veqw")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(haiHuoc).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(tinhCam).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Yorgos Lanthimos").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Emma Stone").characterName("Bella Baxter").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Mark Ruffalo").characterName("Duncan Wedderburn").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 4. Oppenheimer
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("oppenheimer"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Oppenheimer")
                    .description("Chân dung nhà vật lý lý thuyết J. Robert Oppenheimer và vai trò lịch sử của ông trong Dự án Manhattan chế tạo vũ khí nguyên tử.")
                    .durationMinutes(180)
                    .ageRating("C18")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Christopher Nolan")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2023, 7, 21))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1")
                    .trailerUrl("https://www.youtube.com/watch?v=uYPbbksJxIg")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(tamLy).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Christopher Nolan").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Cillian Murphy").characterName("J. Robert Oppenheimer").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Robert Downey Jr.").characterName("Lewis Strauss").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 5. Interstellar: Hố Tử Thần
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("interstellar"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Interstellar: Hố Tử Thần")
                    .description("Một nhóm nhà thám hiểm vũ trụ du hành xuyên qua lỗ sâu không gian nhằm tìm kiếm hành tinh mới cho sự sống của nhân loại.")
                    .durationMinutes(169)
                    .ageRating("C13")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Christopher Nolan")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 4, 12))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa")
                    .trailerUrl("https://www.youtube.com/watch?v=zSWdZVtXT7E")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(phieuLuu).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Christopher Nolan").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Matthew McConaughey").characterName("Cooper").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Anne Hathaway").characterName("Brand").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 6. The Batman
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("batman"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("The Batman: Vạch Trần Sự Thật")
                    .description("Khi kẻ sát nhân hàng loạt Riddler gieo rắc nỗi kinh hoàng cho giới tinh hoa Gotham, Batman phải điều tra những bí mật đen tối nhất của thành phố.")
                    .durationMinutes(176)
                    .ageRating("C16")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Matt Reeves")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 3, 15))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1509347528160-9a9e33742cdb")
                    .trailerUrl("https://www.youtube.com/watch?v=mqqft2x_Aa4")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(tamLy).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Matt Reeves").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Robert Pattinson").characterName("Bruce Wayne / Batman").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Zoë Kravitz").characterName("Selina Kyle").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 7. John Wick: Phần 4
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("john wick"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("John Wick: Phần 4")
                    .description("John Wick khám phá ra con đường đánh bại Hội Tối Cao, nhưng trước hết anh phải đối mặt với một kẻ thù mới có liên minh hùng mạnh trên toàn cầu.")
                    .durationMinutes(169)
                    .ageRating("C18")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Chad Stahelski")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 2, 24))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401")
                    .trailerUrl("https://www.youtube.com/watch?v=qEVUtrk8_B4")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(phieuLuu).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Chad Stahelski").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Keanu Reeves").characterName("John Wick").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Donnie Yen").characterName("Caine").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 8. Spider-Man: No Way Home
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("spider-man"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Spider-Man: No Way Home")
                    .description("Khi danh tính Người Nhện bị tiết lộ, Peter Parker nhờ Doctor Strange giúp đỡ nhưng vô tình mở ra vết nứt Đa Vũ Trụ đầy nguy hiểm.")
                    .durationMinutes(148)
                    .ageRating("C13")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Jon Watts")
                    .status("now_showing")
                    .releaseDate(LocalDate.of(2024, 3, 20))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1635805737707-575885ab0820")
                    .trailerUrl("https://www.youtube.com/watch?v=JfVOs4VSpmA")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(phieuLuu).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Jon Watts").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Tom Holland").characterName("Peter Parker").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Zendaya").characterName("MJ").displayOrder(3).build());
            newlyAddedNowShowing.add(m);
        }

        // 9. Argylle: Siêu Điệp Viên (Coming Soon)
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("argylle"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Argylle: Siêu Điệp Viên")
                    .description("Một nữ nhà văn viết tiểu thuyết điệp viên bất ngờ phát hiện cốt truyện trong sách của cô đang diễn ra ngoài đời thực.")
                    .durationMinutes(139)
                    .ageRating("C16")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Matthew Vaughn")
                    .status("coming_soon")
                    .releaseDate(LocalDate.of(2026, 11, 15))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c")
                    .trailerUrl("https://www.youtube.com/watch?v=7mGu9XyNz2I")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(haiHuoc).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Matthew Vaughn").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Henry Cavill").characterName("Argylle").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Bryce Dallas Howard").characterName("Elly Conway").displayOrder(3).build());
        }

        // 10. The Marvels (Coming Soon)
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("marvels"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("The Marvels")
                    .description("Carol Danvers, Kamala Khan và Monica Rambeau buộc phải hợp tác khi sức mạnh ánh sáng của họ bị vướng vào nhau.")
                    .durationMinutes(105)
                    .ageRating("C13")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Nia DaCosta")
                    .status("coming_soon")
                    .releaseDate(LocalDate.of(2026, 11, 28))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .posterUrl("https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe")
                    .trailerUrl("https://www.youtube.com/watch?v=wS_qbDztgVY")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Nia DaCosta").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Brie Larson").characterName("Captain Marvel").displayOrder(2).build());
        }

        // 11. Deadpool & Wolverine (Coming Soon)
        if (existingMovies.stream().noneMatch(m -> m.getTitle().toLowerCase().contains("deadpool"))) {
            Movie m = movieRepository.save(Movie.builder()
                    .title("Deadpool & Wolverine")
                    .description("Wade Wilson tái xuất cùng Wolverine trong một nhiệm vụ xoay chuyển toàn bộ lịch sử Đa Vũ Trụ Điện Ảnh Marvel.")
                    .durationMinutes(128)
                    .ageRating("C18")
                    .language("Tiếng Anh - Phụ đề Tiếng Việt")
                    .director("Shawn Levy")
                    .status("coming_soon")
                    .releaseDate(LocalDate.of(2026, 12, 10))
                    .endDate(LocalDate.of(2027, 3, 31))
                    .posterUrl("https://images.unsplash.com/photo-1608889175123-8ee362201f81")
                    .trailerUrl("https://www.youtube.com/watch?v=73_1biulkYk")
                    .build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(hanhDong).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(haiHuoc).build());
            movieGenreRepository.save(MovieGenre.builder().movie(m).genre(sciFi).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("director").personName("Shawn Levy").displayOrder(1).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Ryan Reynolds").characterName("Deadpool").displayOrder(2).build());
            movieCastRepository.save(MovieCast.builder().movie(m).roleType("actor").personName("Hugh Jackman").characterName("Wolverine").displayOrder(3).build());
        }

        // Tự động tạo lịch chiếu (Showtimes) cho các phim đang chiếu mới bổ sung
        if (!newlyAddedNowShowing.isEmpty()) {
            List<CinemaRoom> rooms = cinemaRoomRepository.findAll();
            if (rooms.size() >= 4) {
                LocalDate baseDate = LocalDate.now();
                LocalTime[] slots = new LocalTime[] {
                        LocalTime.of(9, 15),
                        LocalTime.of(13, 30),
                        LocalTime.of(17, 15),
                        LocalTime.of(20, 45)
                };
                for (int day = 0; day <= 1; day++) {
                    LocalDate d = baseDate.plusDays(day);
                    int idx = 0;
                    for (Movie mv : newlyAddedNowShowing) {
                        CinemaRoom targetRoom = rooms.get(3 + (idx % (rooms.size() - 3)));
                        LocalTime slot = slots[idx % slots.length];
                        String fmt = "3D".equalsIgnoreCase(targetRoom.getRoomType()) ? "3D" : "2D";
                        showtimeRepository.save(Showtime.builder()
                                .movie(mv)
                                .cinemaRoom(targetRoom)
                                .showDate(d)
                                .startTime(slot)
                                .screenFormat(fmt)
                                .status("open")
                                .build());
                        idx++;
                    }
                }
            }
            log.info("Đã tự động bổ sung {} bộ phim bom tấn mới kèm diễn viên & suất chiếu vào MySQL!", newlyAddedNowShowing.size());
        }
    }
}