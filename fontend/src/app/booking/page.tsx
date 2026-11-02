'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Search,
  Bot,
  Sun,
  Moon,
  Bell,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  Download,
  Share2,
  Ticket,
  ShieldCheck,
  QrCode,
  Minimize2,
  Maximize2,
  User,
  Lock,
  Wallet,
  Gift,
  History,
  LogOut,
  LogIn,
  Sparkles,
  Check,
  Copy,
} from 'lucide-react';
import { useSeatStore, SeatData } from '@/stores/useSeatStore';
import SeatMap2D from '@/components/SeatMap2D';
import {
  cineBookingApi,
  ensureBackendAuth,
  clearAuthSession,
  BackendMovie,
  BackendCinema,
  BackendShowtime,
  BackendFnbItem,
  BackendBookingResponse,
  BackendUserProfile,
  BackendNotification,
} from '@/lib/api';
import { triggerCinemaConfetti, playTimelineChoreography } from '@/lib/motion';

export default function BookingPage() {
  const {
    seats,
    selectedSeats,
    toggleSeat,
    clearSelection,
    zoomIn,
    zoomOut,
    resetZoom,
    syncFromBackend,
    updateLiveSeats,
    markSelectedAsBooked,
  } = useSeatStore();

  // ================= REAL DATABASE STATE =================
  const [backendShowtimes, setBackendShowtimes] = useState<BackendShowtime[]>([]);
  const [backendCinemas, setBackendCinemas] = useState<BackendCinema[]>([]);
  const [activeShowtime, setActiveShowtime] = useState<BackendShowtime | null>(null);
  const [activeMovie, setActiveMovie] = useState<BackendMovie | null>(null);
  const [activeCinema, setActiveCinema] = useState<BackendCinema | null>(null);
  const [movieAvgRating, setMovieAvgRating] = useState<number>(0);

  const [fnbList, setFnbList] = useState<BackendFnbItem[]>([]);
  const [selectedFnbQuantities, setSelectedFnbQuantities] = useState<Record<number, number>>({});
  const [userProfile, setUserProfile] = useState<BackendUserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<BackendBookingResponse[]>([]);

  // Coupon state connected to POST /api/v1/coupons/apply
  const [couponInput, setCouponInput] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<any[]>([]);

  // Danh sách các mã coupon mà user này ĐÃ ĐỔI THÀNH CÔNG bằng điểm thưởng
  const userRedeemedCoupons = useMemo(() => {
    if (!userProfile?.id) return [];
    const set = new Set<string>();

    // 1. Đọc từ LocalStorage theo userId
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`cinebooking_redeemed_${userProfile.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          for (const [code, count] of Object.entries(parsed)) {
            if (Number(count) > 0) set.add(code.toUpperCase());
          }
        }
      }
    } catch {}

    // 2. Đọc từ lịch sử giao dịch đổi điểm trong CSDL
    if (loyaltyTransactions.length) {
      for (const tx of loyaltyTransactions) {
        if (tx.type === 'REDEEM_COUPON' || (tx.description && tx.description.includes('Đổi điểm'))) {
          const desc = (tx.description || '').toUpperCase();
          for (const c of ['CINEMA20', 'WELCOME30K', 'VIP50K']) {
            if (desc.includes(c)) set.add(c);
          }
        }
      }
    }

    return Array.from(set);
  }, [userProfile?.id, loyaltyTransactions]);

  // Booking & ZaloPay QR Payment transaction state
  const [createdBooking, setCreatedBooking] = useState<BackendBookingResponse | null>(null);
  const [zaloPayOrder, setZaloPayOrder] = useState<{
    bookingId: number;
    bookingCode: string;
    appTransId: string;
    orderUrl: string;
    qrCode: string;
    amount: number;
  } | null>(null);
  const [zaloPayStatusMsg, setZaloPayStatusMsg] = useState<string>('');
  const [isCheckingZaloPay, setIsCheckingZaloPay] = useState(false);
  const [showZaloPayQRModal, setShowZaloPayQRModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState<number>(0);

  // Modal & UI states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showFnbModal, setShowFnbModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showETicketModal, setShowETicketModal] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>('');
  const [copiedTicketMsg, setCopiedTicketMsg] = useState<string>('');
  const [miniMapCompact, setMiniMapCompact] = useState(false);

  // Showtime Switcher Filter State (populated from DB showtimes)
  const [selectedDateTab, setSelectedDateTab] = useState<string>('');
  const [selectedFormatTab, setSelectedFormatTab] = useState<string>('ALL');
  const [countdown, setCountdown] = useState(300); // 5 phút giữ ghế theo đúng chuẩn Backend

  // GSAP Animation Refs & Choreography Hooks
  const showtimeModalRef = useRef<HTMLDivElement>(null);
  const fnbModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showShowtimeModal && showtimeModalRef.current) {
      playTimelineChoreography(showtimeModalRef.current, {
        barSelector: '.dtl__bar',
        todaySelector: '.dtl__today',
        delay: 0.05,
      });
    }
  }, [showShowtimeModal]);

  useEffect(() => {
    if (showFnbModal && fnbModalRef.current) {
      playTimelineChoreography(fnbModalRef.current, {
        barSelector: '.dtl__bar',
        todaySelector: '.dtl__today',
        delay: 0.05,
      });
    }
  }, [showFnbModal]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('cinebooking_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('theme-light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove('theme-light');
    }
  }, []);

  const toggleThemeMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.remove('theme-light');
      localStorage.setItem('cinebooking_theme', 'dark');
    } else {
      document.documentElement.classList.add('theme-light');
      localStorage.setItem('cinebooking_theme', 'light');
    }
  };

  // 1. Khởi tạo phiên đăng nhập & tải danh sách Suất chiếu, Cụm rạp, F&B từ MySQL
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryShowtimeId = Number(params.get('showtimeId'));
        const queryMovieId = Number(params.get('movieId') || params.get('movie'));

        const [auth, showtimes, cinemas, fnbs] = await Promise.all([
          ensureBackendAuth().catch(() => null),
          cineBookingApi.getShowtimes().catch(() => []),
          cineBookingApi.getCinemas().catch(() => []),
          cineBookingApi.getFnbItems().catch(() => []),
        ]);

        if (!mounted) return;

        if (auth?.user) {
          setUserProfile(auth.user);
          const [bookings, notifs, unreadRes, loyaltySum] = await Promise.all([
            cineBookingApi.getUserBookings(auth.user.id).catch(() => []),
            cineBookingApi.getMyNotifications().catch(() => []),
            cineBookingApi.getUnreadNotificationCount().catch(() => ({ unreadCount: 0 })),
            cineBookingApi.getMyLoyaltySummary().catch(() => null),
          ]);
          if (mounted) {
            if (bookings) setUserBookings(bookings);
            setNotifications(notifs || []);
            setUnreadNotifCount(unreadRes?.unreadCount || 0);
            if (loyaltySum?.recentTransactions) {
              setLoyaltyTransactions(loyaltySum.recentTransactions);
            }
          }
        }

        setBackendShowtimes(showtimes);
        setBackendCinemas(cinemas);
        setFnbList(fnbs);

        // Mặc định chọn 1 Combo Solo từ DB nếu có
        const defaultCombo = fnbs.find((f) => f.category === 'combo') || fnbs[0];
        if (defaultCombo) {
          setSelectedFnbQuantities({ [defaultCombo.id]: 1 });
        }

        // Chọn suất chiếu từ URL hoặc mặc định suất chiếu IMAX đầu tiên trong DB
        let initialSt =
          showtimes.find((s) => s.id === queryShowtimeId) ||
          (queryMovieId ? showtimes.find((s) => s.movieId === queryMovieId) : null) ||
          showtimes.find((s) => s.screenFormat === 'IMAX') ||
          showtimes[0];

        if (initialSt) {
          setActiveShowtime(initialSt);
          setSelectedDateTab(initialSt.showDate);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu từ Backend:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Khi activeShowtime thay đổi -> Tải chi tiết Phim, Rạp, Bảng giá động & Sơ đồ ghế 3D thực tế từ MySQL
  useEffect(() => {
    if (!activeShowtime) return;
    let mounted = true;

    (async () => {
      try {
        const [movieDetail, reviewsSummary, cinemaDetail, seatLayout] = await Promise.all([
          cineBookingApi.getMovieDetail(activeShowtime.movieId),
          cineBookingApi.getMovieReviews(activeShowtime.movieId).catch(() => null),
          cineBookingApi.getCinemaById(activeShowtime.cinemaId),
          cineBookingApi.getSeatLayoutByShowtime(activeShowtime.id),
        ]);

        // Tính giá vé động từ bảng ticket_price_rules của Backend cho 3 loại ghế
        const [stdPriceRes, vipPriceRes, couplePriceRes] = await Promise.all([
          cineBookingApi
            .calculateTicketPrice({
              showtimeId: activeShowtime.id,
              seatType: 'standard',
            })
            .catch(() => ({ finalPrice: 90000 })),
          cineBookingApi
            .calculateTicketPrice({
              showtimeId: activeShowtime.id,
              seatType: 'vip',
            })
            .catch(() => ({ finalPrice: 120000 })),
          cineBookingApi
            .calculateTicketPrice({
              showtimeId: activeShowtime.id,
              seatType: 'couple',
            })
            .catch(() => ({ finalPrice: 190000 })),
        ]);

        if (!mounted) return;
        setActiveMovie(movieDetail);
        if (reviewsSummary && reviewsSummary.totalReviews > 0) {
          setMovieAvgRating(Number(reviewsSummary.averageRating.toFixed(1)));
        } else {
          setMovieAvgRating(0);
        }
        setActiveCinema(cinemaDetail);

        if (seatLayout?.seats) {
          syncFromBackend(seatLayout.seats, {
            STANDARD: Number(stdPriceRes.finalPrice),
            VIP: Number(vipPriceRes.finalPrice),
            COUPLE: Number(couplePriceRes.finalPrice),
          });
        }
      } catch (err) {
        console.error('Lỗi đồng bộ suất chiếu & sơ đồ ghế:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeShowtime, syncFromBackend]);

  // =========================================================================
  // 2.5. ĐỒNG BỘ TRẠNG THÁI GHẾ THEO THỜI GIAN THỰC (CÁCH 1: REST API POLLING CHUẨN GIÁO TRÌNH)
  // Tự động kiểm tra mỗi 3 giây qua API GET /api/v1/showtimes/{id}/seats
  // Nếu có người khác đặt/thanh toán cùng lúc: tự động đổi màu ghế đã bán và gỡ khỏi danh sách chọn
  // =========================================================================
  const [conflictSeatAlert, setConflictSeatAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!activeShowtime?.id) return;

    const seatPollTimer = setInterval(async () => {
      try {
        const layout = await cineBookingApi.getSeatLayoutByShowtime(activeShowtime.id);
        if (layout?.seats && layout.seats.length > 0) {
          const conflicts = updateLiveSeats(layout.seats);
          if (conflicts.length > 0) {
            const msg = `Ghế ${conflicts.join(', ')} vừa được khách hàng khác đặt thành công! Hệ thống đã tự động chuyển sang màu đã bán và gỡ khỏi danh sách của bạn.`;
            setConflictSeatAlert(msg);
            setBookingError(msg);
            setTimeout(() => setConflictSeatAlert(null), 8000);
          }
        }
      } catch (err) {
        // Bỏ qua lỗi mạng nền tạm thời
      }
    }, 3000);

    return () => clearInterval(seatPollTimer);
  }, [activeShowtime?.id, updateLiveSeats]);

  // 3. Tự động kiểm tra mã giảm giá qua API POST /api/v1/coupons/apply khi mở Modal Thanh toán
  const seatTotal = useMemo(
    () => selectedSeats.reduce((acc, s) => acc + s.price, 0),
    [selectedSeats]
  );

  const fnbTotal = useMemo(() => {
    return fnbList.reduce((sum, item) => {
      const qty = selectedFnbQuantities[item.id] || 0;
      return sum + qty * Number(item.basePrice);
    }, 0);
  }, [fnbList, selectedFnbQuantities]);

  const rawOrderSubtotal = seatTotal + fnbTotal;

  useEffect(() => {
    if (!showCheckoutModal || !couponInput.trim() || rawOrderSubtotal <= 0) {
      if (!couponInput.trim()) setDiscountAmount(0);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await cineBookingApi.applyCoupon(
          couponInput.trim(),
          rawOrderSubtotal,
          userProfile?.id
        );
        if (!active) return;
        if (res.valid) {
          setDiscountAmount(Number(res.discountAmount));
          setCouponMessage(res.message);
        } else {
          setDiscountAmount(0);
          setCouponMessage(res.message);
        }
      } catch (err: any) {
        if (!active) return;
        setDiscountAmount(0);
        setCouponMessage(err?.message || 'Mã giảm giá không áp dụng cho đơn này');
      }
    })();
    return () => {
      active = false;
    };
  }, [showCheckoutModal, couponInput, rawOrderSubtotal, userProfile?.id]);

  // Hàm tính số giây còn lại dựa trên thời điểm hết hạn holdExpiresAt lưu trong CSDL
  const getRemainingHoldSeconds = (holdExpiresAt?: string | null) => {
    if (!holdExpiresAt) return 0;
    const target = new Date(holdExpiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((target - now) / 1000));
  };

  // Đồng hồ đếm ngược thời gian thực giữ ghế theo CSDL Backend
  useEffect(() => {
    if (!showCheckoutModal && !showZaloPayQRModal) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showCheckoutModal, showZaloPayQRModal]);

  // Tự động đóng modal, hủy đơn & giải phóng ghế khi hết thời gian giữ ghế
  useEffect(() => {
    if (countdown === 0 && showZaloPayQRModal) {
      setShowZaloPayQRModal(false);
      alert('Đơn giữ ghế đã hết thời gian (5 phút). Hệ thống đã tự động hủy đơn và giải phóng ghế.');
      clearSelection();
      if (activeShowtime) {
        cineBookingApi.getSeatLayoutByShowtime(activeShowtime.id).then((seatLayout) => {
          if (seatLayout?.seats) syncFromBackend(seatLayout.seats);
        }).catch(() => {});
      }
      if (userProfile?.id) {
        cineBookingApi.getUserBookings(userProfile.id).then(setUserBookings).catch(() => {});
      }
    }
  }, [countdown, showZaloPayQRModal, activeShowtime, userProfile?.id, clearSelection, syncFromBackend]);

  // Hàm truy vấn trạng thái thanh toán thật từ máy chủ ZaloPay Sandbox (POST /api/v1/payments/zalopay/query/{appTransId})
  const checkZaloPayPaymentStatus = async (silent = false) => {
    if (!zaloPayOrder?.appTransId) return;
    try {
      if (!silent) setIsCheckingZaloPay(true);
      const qRes = await cineBookingApi.queryZaloPayOrder(zaloPayOrder.appTransId);
      if (qRes.returnCode === 1 || qRes.paymentStatus?.toLowerCase() === 'paid') {
        // Thanh toán ZaloPay Sandbox thành công!
        if (qRes.loyaltyPointsEarned) {
          setLoyaltyPointsEarned(qRes.loyaltyPointsEarned);
        }
        const confirmedBooking = await cineBookingApi.getBookingById(
          zaloPayOrder.bookingId
        );
        setCreatedBooking(confirmedBooking);
        markSelectedAsBooked();

        const [freshUser, freshBookings] = await Promise.all([
          cineBookingApi.getMe().catch(() => null),
          cineBookingApi.getUserBookings(userProfile?.id || 2).catch(() => []),
        ]);
        if (freshUser) setUserProfile(freshUser);
        if (freshBookings.length) setUserBookings(freshBookings);

        setShowZaloPayQRModal(false);
        setShowETicketModal(true);
        triggerCinemaConfetti();
      } else {
        setZaloPayStatusMsg(
          qRes.returnMessage ||
            'Đang chờ bạn quét mã QR hoặc hoàn tất thanh toán trên ZaloPay Sandbox...'
        );
      }
    } catch (err: any) {
      if (!silent) {
        setZaloPayStatusMsg(
          err?.message || 'Chưa nhận được xác nhận thanh toán từ ZaloPay Sandbox.'
        );
      }
    } finally {
      if (!silent) setIsCheckingZaloPay(false);
    }
  };

  // Tự động polling kiểm tra kết quả thanh toán ZaloPay Sandbox mỗi 3 giây khi đang mở bảng QR
  useEffect(() => {
    if (!showZaloPayQRModal || !zaloPayOrder?.appTransId) return;
    const pollTimer = setInterval(() => {
      checkZaloPayPaymentStatus(true);
    }, 3000);
    return () => clearInterval(pollTimer);
  }, [showZaloPayQRModal, zaloPayOrder?.appTransId]);

  // Hàm xử lý Đặt vé & Gọi Cổng Thanh Toán Mã QR ZaloPay Sandbox (/api/v1/payments/zalopay/create/{bookingId})
  const handleExecuteBookingAndPayment = async () => {
    if (!activeShowtime || selectedSeats.length === 0) return;
    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      const seatIds = selectedSeats.map((s) => s.seatDbId);
      const fnbPayload = Object.entries(selectedFnbQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([fnbItemId, quantity]) => ({
          fnbItemId: Number(fnbItemId),
          quantity,
        }));

      const bookingRes = await cineBookingApi.createBooking({
        userId: userProfile?.id || 2,
        cinemaId: activeShowtime.cinemaId,
        showtimeId: activeShowtime.id,
        seatIds,
        fnbItems: fnbPayload.length > 0 ? fnbPayload : undefined,
        couponCode:
          discountAmount > 0 && couponInput.trim()
            ? couponInput.trim()
            : undefined,
        contactPhone: userProfile?.phone || '0912345678',
        contactEmail: userProfile?.email || 'khachhang@gmail.com',
        paymentMethod: 'ZALOPAY',
      });

      setCreatedBooking(bookingRes);

      // Gọi API Backend POST /api/v1/payments/zalopay/create/{bookingId}
      const zp = await cineBookingApi.createZaloPayOrder(bookingRes.id);
      setZaloPayOrder({
        bookingId: bookingRes.id,
        bookingCode: bookingRes.bookingCode,
        appTransId: zp.appTransId,
        orderUrl: zp.orderUrl,
        qrCode: zp.qrCode || zp.orderUrl,
        amount: Number(zp.amount || bookingRes.totalAmount),
      });
      const remSec = getRemainingHoldSeconds(bookingRes.holdExpiresAt) || 300;
      setCountdown(remSec);
      setZaloPayStatusMsg(
        'Đang chờ bạn quét mã QR hoặc hoàn tất thanh toán trên ZaloPay Sandbox...'
      );
      setShowCheckoutModal(false);
      setShowZaloPayQRModal(true);
    } catch (err: any) {
      setBookingError(
        err?.message || 'Không thể tạo mã QR ZaloPay Sandbox. Vui lòng kiểm tra lại.'
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatCurrency = (val: number) => {
    return Math.round(val).toLocaleString('vi-VN') + 'đ';
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatDateVN = (isoDate?: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatTimeShort = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  // Nhóm ghế đã chọn theo loại thực tế từ DB
  const standardSeats = selectedSeats.filter((s) => s.type === 'STANDARD');
  const vipSeats = selectedSeats.filter((s) => s.type === 'VIP');
  const coupleSeats = selectedSeats.filter((s) => s.type === 'COUPLE');

  const finalCheckoutTotal = Math.max(0, rawOrderSubtotal - discountAmount);

  const getSeatTypeLabel = (type: SeatData['type']) => {
    if (type === 'VIP') return 'Ghế VIP';
    if (type === 'COUPLE') return 'Ghế đôi';
    return 'Ghế thường';
  };

  // Danh sách ngày chiếu duy nhất từ bảng showtimes trong DB
  const availableShowDates = useMemo(() => {
    return Array.from(new Set(backendShowtimes.map((s) => s.showDate))).sort();
  }, [backendShowtimes]);

  // Danh sách định dạng phòng chiếu duy nhất từ bảng showtimes trong DB
  const availableFormats = useMemo(() => {
    return ['ALL', ...Array.from(new Set(backendShowtimes.map((s) => s.screenFormat)))];
  }, [backendShowtimes]);

  const allRows = useMemo(
    () => Array.from(new Set(seats.map((s) => s.row))),
    [seats]
  );

  return (
    <div className={`theme-shell min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors ${
      isDarkMode ? 'bg-[#030916] text-white' : 'bg-[#F4F7FB] text-slate-900'
    }`}>
      {/* ================= TOP HEADER BAR ================= */}
      <header className={`h-[60px] backdrop-blur-md border-b px-6 flex items-center justify-between sticky top-0 z-30 transition-colors ${
        isDarkMode ? 'bg-[#040B18]/95 border-[#12223D]' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C4DFF] to-[#5124D6] flex items-center justify-center shadow-[0_0_16px_rgba(105,59,255,0.6)]">
              <Ticket size={17} className="text-white -rotate-12" />
            </div>
            <span className={`font-extrabold text-[17px] tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              CineBooking
            </span>
          </Link>

          <nav className={`hidden md:flex items-center gap-6 text-[13.5px] font-medium ${
            isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'
          }`}>
            <Link href="/" className="hover:text-[#693BFF] transition-colors">
              Trang chủ
            </Link>
            <Link href="/?view=movies" className="text-[#693BFF] font-semibold">
              Phim
            </Link>
            <button
              onClick={() => setShowShowtimeModal(true)}
              className="flex items-center gap-1 hover:text-[#693BFF] transition-colors cursor-pointer"
            >
              <span>Rạp & Đổi suất chiếu</span>
              <ChevronDown size={13} />
            </button>
            <Link
              href="/?view=promos"
              className="hover:text-[#693BFF] transition-colors cursor-pointer"
            >
              Ưu đãi
            </Link>
            <button
              onClick={() => setShowAccountDrawer(true)}
              className="hover:text-[#693BFF] transition-colors cursor-pointer"
            >
              Thành viên
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-[260px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              type="text"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              placeholder="Tìm phim, rạp, suất chiếu..."
              className={`w-full h-9 pl-9 pr-7 rounded-full text-xs transition-colors focus:outline-none focus:border-[#693BFF] border ${
                isDarkMode
                  ? 'bg-[#091528] border-[#192D50] text-white placeholder-[#64748B]'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            {headerSearchQuery && (
              <button
                onClick={() => setHeaderSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            )}

            {/* Dropdown kết quả tìm kiếm nhanh trên trang /booking */}
            {headerSearchQuery.trim() !== '' && (
              <div className="absolute top-11 left-0 right-0 z-50 rounded-2xl bg-[#071327] border border-[#243E6C] shadow-2xl p-2 max-h-[320px] overflow-y-auto space-y-1">
                {backendShowtimes
                  .filter(
                    (st) =>
                      st.movieTitle
                        .toLowerCase()
                        .includes(headerSearchQuery.toLowerCase()) ||
                      st.cinemaName
                        .toLowerCase()
                        .includes(headerSearchQuery.toLowerCase()) ||
                      st.screenFormat
                        .toLowerCase()
                        .includes(headerSearchQuery.toLowerCase())
                  )
                  .slice(0, 8)
                  .map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setActiveShowtime(st);
                        setSelectedDateTab(st.showDate);
                        setHeaderSearchQuery('');
                      }}
                      className="w-full p-2 rounded-xl hover:bg-[#102344] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white truncate">
                          {st.movieTitle}
                        </div>
                        <div className="text-[10.5px] text-[#94A3B8] truncate">
                          {st.cinemaName} • {st.roomName} ({st.screenFormat})
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#693BFF]/20 border border-[#693BFF]/40 text-[10.5px] font-bold text-[#C4B5FD] flex-shrink-0">
                        {formatTimeShort(st.startTime)}
                      </span>
                    </button>
                  ))}
                {backendShowtimes.filter(
                  (st) =>
                    st.movieTitle
                      .toLowerCase()
                      .includes(headerSearchQuery.toLowerCase()) ||
                    st.cinemaName
                      .toLowerCase()
                      .includes(headerSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="py-4 text-center text-xs text-[#64748B]">
                    Không tìm thấy suất chiếu phù hợp
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={toggleThemeMode}
            title="Chuyển đổi Dark Mode / Light Mode"
            className="h-9 px-3 rounded-full bg-[#0A172C] border border-[#1E345B] flex items-center gap-1.5 text-xs font-bold text-white hover:border-[#693BFF] transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <>
                <Moon size={14} className="text-[#A875FF] fill-[#A875FF]" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-400 fill-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>

          {/* Nút Chuông Thông báo thực tế từ /api/v1/notifications */}
          <div className="relative">
            <button
              onClick={async () => {
                const nextOpen = !showNotifDropdown;
                setShowNotifDropdown(nextOpen);
                if (nextOpen) {
                  const [notifs, unreadRes] = await Promise.all([
                    cineBookingApi.getMyNotifications().catch(() => []),
                    cineBookingApi
                      .getUnreadNotificationCount()
                      .catch(() => ({ unreadCount: 0 })),
                  ]);
                  setNotifications(notifs || []);
                  setUnreadNotifCount(unreadRes?.unreadCount || 0);
                }
              }}
              title="Thông báo từ hệ thống"
              className="relative w-9 h-9 rounded-full bg-[#0A172C] border border-[#1E345B] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <Bell size={16} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9.5px] font-extrabold text-white flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-[#071327] border border-[#243E6C] shadow-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#162949] pb-2">
                  <span className="text-xs font-extrabold text-white">
                    Thông báo ({notifications.length})
                  </span>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={async () => {
                        await cineBookingApi.markAllNotificationsAsRead();
                        const fresh = await cineBookingApi.getMyNotifications();
                        setNotifications(fresh || []);
                        setUnreadNotifCount(0);
                      }}
                      className="text-[10.5px] font-semibold text-[#A875FF] hover:underline cursor-pointer"
                    >
                      Đánh dấu đã đọc hết
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-5 text-center text-xs text-[#64748B]">
                      Chưa có thông báo mới
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.isRead) {
                            await cineBookingApi.markNotificationAsRead(n.id);
                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id ? { ...item, isRead: true } : item
                              )
                            );
                            setUnreadNotifCount((c) => Math.max(0, c - 1));
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          n.isRead
                            ? 'bg-[#0A1830]/60 border-[#162949] text-[#94A3B8]'
                            : 'bg-[#102347] border-[#693BFF]/50 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{n.title}</span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#A875FF] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#CBD5E1] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar tài khoản thực từ Backend (/auth/me) / Nút Đăng nhập */}
          {!userProfile ? (
            <Link
              href="/?view=members"
              className="px-3.5 py-1.5 rounded-full border border-[#693BFF] hover:bg-[#693BFF]/20 text-[#A875FF] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn size={13} />
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowAccountDrawer(true)}
              title={`${userProfile.fullName} (${userProfile.email})`}
              className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#693BFF] to-[#EC4899] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center bg-[#0A172C] text-xs font-extrabold text-white"
            >
              {userProfile.fullName.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN WORKSPACE (12-COLUMN GRID) ================= */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-5 py-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT 9 COLUMNS: SHOWTIME BAR + 3D VIEWPORT + LEGEND & MINI-MAP */}
        <div className="lg:col-span-9 flex flex-col gap-3.5">
          {/* 1. SHOWTIME INFO HEADER BAR (100% Dữ liệu thực từ MySQL) */}
          <div className={`rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border shadow-sm transition-colors ${
            isDarkMode
              ? 'bg-[#061020]/95 border-[#162949] text-white shadow-lg'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            {/* Movie Poster + Title + Genres từ /api/v1/movies/{id} */}
            <div className="flex items-center gap-3.5">
              {activeShowtime?.moviePosterUrl && (
                <img
                  src={activeShowtime.moviePosterUrl}
                  alt={activeShowtime.movieTitle}
                  className="w-12 h-16 rounded-lg object-cover border border-slate-300 dark:border-white/15 shadow-md"
                />
              )}
              <div>
                <h1 className={`text-[18px] font-extrabold tracking-tight leading-snug ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {activeShowtime?.movieTitle || 'Đang tải suất chiếu...'}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {activeMovie?.genres?.map((g) => (
                    <span
                      key={g.id}
                      className={`px-2 py-0.5 rounded-md border text-[10.5px] font-medium ${
                        isDarkMode
                          ? 'bg-[#0E1E38] border-[#1E365F] text-[#94A3B8]'
                          : 'bg-purple-50 border-purple-200 text-purple-700'
                      }`}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
                <div className={`flex items-center gap-3 mt-1.5 text-xs ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'
                }`}>
                  {movieAvgRating > 0 ? (
                    <span className={`flex items-center gap-1 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <Star size={12} className="text-[#FFB52E] fill-[#FFB52E]" />
                      {movieAvgRating.toFixed(1)}
                    </span>
                  ) : (
                    <span className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>Chưa có đánh giá</span>
                  )}
                  <span className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600 font-medium'}>
                    {formatDuration(activeShowtime?.movieDurationMinutes)}
                  </span>
                  {activeShowtime?.movieAgeRating && (
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${
                      isDarkMode ? 'bg-[#152644] border-[#274172] text-[#E2E8F0]' : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}>
                      {activeShowtime.movieAgeRating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`hidden xl:block h-11 w-[1px] ${isDarkMode ? 'bg-[#162949]' : 'bg-slate-200'}`} />

            {/* Cinema Location từ /api/v1/cinemas/{id} */}
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`} />
              <div>
                <div className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeShowtime?.cinemaName}
                </div>
                <div className={`text-[11.5px] mt-0.5 ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-500'}`}>
                  {activeCinema
                    ? `${activeCinema.address}, ${activeCinema.district}, ${activeCinema.city}`
                    : activeShowtime?.cinemaCity}
                </div>
                <button
                  onClick={() => setShowMapModal(true)}
                  className="text-[11px] font-medium text-[#7C4DFF] hover:text-[#A875FF] mt-0.5 cursor-pointer flex items-center gap-1"
                >
                  <span>Xem bản đồ định vị rạp</span>
                </button>
              </div>
            </div>

            <div className={`hidden xl:block h-11 w-[1px] ${isDarkMode ? 'bg-[#162949]' : 'bg-slate-200'}`} />

            {/* Room & Format Badge từ Showtime DB */}
            <div>
              <div className={`text-[13px] font-semibold ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                {activeShowtime?.roomName}
              </div>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md border text-[11px] font-bold tracking-wide ${
                isDarkMode ? 'bg-[#132347] border-[#2B4C8C] text-[#93C5FD]' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {activeShowtime?.screenFormat}
              </span>
            </div>

            <div className={`hidden xl:block h-11 w-[1px] ${isDarkMode ? 'bg-[#162949]' : 'bg-slate-200'}`} />

            {/* Date & Time từ Showtime DB */}
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Calendar size={14} className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'} />
                <span>Ngày {formatDateVN(activeShowtime?.showDate)}</span>
              </div>
              <div className={`flex items-center gap-2 text-[12.5px] font-medium ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'}`}>
                <Clock size={14} className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'} />
                <span>
                  {formatTimeShort(activeShowtime?.startTime)} -{' '}
                  {formatTimeShort(activeShowtime?.estimatedEndTime)}
                </span>
              </div>
            </div>

            {/* Switch Showtime Button */}
            <button
              onClick={() => setShowShowtimeModal(true)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm ${
                isDarkMode
                  ? 'bg-[#0C1A32] hover:bg-[#13294E] border-[#243E6C] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <RotateCcw size={13} className="text-[#A875FF]" />
              <span>Đổi suất chiếu</span>
            </button>
          </div>

          {/* CẢNH BÁO XUNG ĐỘT KHI NGƯỜI KHÁC VỪA ĐẶT GHẾ CÙNG LÚC */}
          {conflictSeatAlert && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
              <span className="flex-1 leading-snug">{conflictSeatAlert}</span>
            </div>
          )}

          {/* 2. SƠ ĐỒ CHỌN GHẾ 2D TRỰC QUAN TỪ DATABASE */}
          <div className="keep-dark relative h-[485px] rounded-2xl bg-[#030813] border border-[#162949] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
            <div className="absolute top-3.5 left-3.5 z-20 bg-[#071224]/90 backdrop-blur-md border border-[#1D335B] p-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
              <button
                onClick={zoomIn}
                title="Phóng to sơ đồ ghế (+)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#10203B] hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={15} />
              </button>

              <button
                onClick={zoomOut}
                title="Thu nhỏ sơ đồ ghế (-)"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#10203B] hover:text-white transition-colors cursor-pointer"
              >
                <Minus size={15} />
              </button>
            </div>

            <button
              onClick={resetZoom}
              className="absolute top-3.5 right-3.5 z-20 bg-[#071224]/90 hover:bg-[#102344] backdrop-blur-md border border-[#1D335B] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#E2E8F0] flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Mặc định (100%)</span>
            </button>

            <SeatMap2D screenFormat={activeShowtime?.screenFormat || 'IMAX'} />
          </div>

          {/* 3. BOTTOM ROW: CHÚ THÍCH GHẾ (SEAT LEGEND) TOÀN CHIỀU NGANG */}
          <div className="w-full">
            <div className={`w-full rounded-2xl px-5 py-3.5 flex flex-col justify-between border shadow-sm transition-colors ${
              isDarkMode
                ? 'bg-[#061020]/95 border-[#162949] text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-[#E2E8F0]' : 'text-slate-900'}`}>
                    Chú thích ghế
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đồng bộ thời gian thực (Live 3s)
                  </span>
                </div>
                <span className={`text-[11px] ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-600 font-medium'}`}>
                  Tổng số ghế:{' '}
                  <b style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className={isDarkMode ? 'text-white font-black' : 'text-slate-900 font-black'}>
                    {seats.length}
                  </b>{' '}
                  ghế (Đã đặt:{' '}
                  <b className="text-rose-500 font-bold">
                    {seats.filter((s) => s.status === 'BOOKED').length}
                  </b>
                  )
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2563EB] border border-[#60A5FA]/50 shadow-[0_2px_8px_rgba(37,99,235,0.4)] flex items-center justify-center flex-shrink-0">
                    <div className="w-3.5 h-2.5 rounded-t-sm bg-[#3B82F6] border-b-2 border-[#1D4ED8]" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Ghế trống
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                      Có thể chọn
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#7C3AED] border border-[#C084FC] shadow-[0_0_12px_rgba(168,85,247,0.75)] flex items-center justify-center flex-shrink-0">
                    <div className="w-3.5 h-2.5 rounded-t-sm bg-[#A855F7] border-b-2 border-[#5B21B6]" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Ghế đang chọn
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                      Đang được chọn
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    isDarkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-200 border-slate-300'
                  }`}>
                    <div className={`w-3.5 h-2.5 rounded-t-sm ${isDarkMode ? 'bg-[#334155] border-b-2 border-[#0F172A]' : 'bg-slate-400 border-b-2 border-slate-500'}`} />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                      Ghế đã bán
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#64748B]' : 'text-slate-400 font-medium'}`}>
                      Không thể chọn
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D97706] border border-[#FBBF24]/70 shadow-[0_2px_8px_rgba(245,158,11,0.4)] flex items-center justify-center flex-shrink-0">
                    <div className="w-3.5 h-2.5 rounded-t-sm bg-[#F59E0B] border-b-2 border-[#B45309]" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Ghế VIP
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                      Hàng trung tâm
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-6 rounded-lg bg-[#4F46E5] border border-[#818CF8]/60 shadow-[0_2px_8px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-2.5 rounded-t-sm bg-[#6366F1] border-b-2 border-[#3730A3]" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Ghế đôi
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                      Dành cho 2 người
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    isDarkMode ? 'bg-[#0F1E38] border-[#1E365F] text-[#60A5FA]' : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}>
                    🪜
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold leading-tight whitespace-nowrap ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>
                      Hành lang
                    </div>
                    <div className={`text-[9.5px] whitespace-nowrap ${isDarkMode ? 'text-[#64748B]' : 'text-slate-400 font-medium'}`}>
                      Lối đi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: BOOKING SUMMARY SIDEBAR (HƯỚNG 3: TỐI GIẢN TOÀN DIỆN - KHÔNG TRÙNG LẶP) */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* 1. BOOKING SUMMARY CARD */}
          <div className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between border shadow-xl transition-colors space-y-4 ${
            isDarkMode
              ? 'bg-[#061020]/95 border-[#162949] text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="space-y-4">
              {/* Header: PHIM GÌ (Chuẩn UX Hóa Đơn) */}
              <div className={`pb-3.5 border-b flex items-start justify-between gap-3 ${isDarkMode ? 'border-[#152642]' : 'border-slate-100'}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#693BFF] shadow-[0_0_8px_#693BFF] flex-shrink-0" />
                    <h2 className={`text-base font-black truncate tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {activeShowtime?.movieTitle}
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-500'}`}>
                    {activeShowtime?.cinemaName} • {activeShowtime?.roomName}
                  </p>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg flex-shrink-0 ${
                  isDarkMode ? 'bg-[#0E1E38] text-[#93C5FD] border border-[#1E365F]' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {formatTimeShort(activeShowtime?.startTime)} • {activeShowtime?.screenFormat}
                </span>
              </div>

              {/* Selected Seats Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                    Ghế đã chọn ({selectedSeats.length})
                  </span>
                  {selectedSeats.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-[11px] font-semibold text-[#8B5CF6] hover:text-[#A78BFA] cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-0.5">
                  {selectedSeats.length === 0 ? (
                    <div className={`py-5 text-center rounded-xl border border-dashed text-xs ${
                      isDarkMode
                        ? 'bg-[#09162B] border-[#1E365F] text-[#64748B]'
                        : 'bg-slate-50 border-slate-300 text-slate-500'
                    }`}>
                      Chưa có ghế nào được chọn. Hãy nhấp chọn ghế trên sơ đồ bên trái!
                    </div>
                  ) : (
                    selectedSeats.map((s) => (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border shadow-xs ${
                          isDarkMode
                            ? 'bg-[#0A1830] border-[#1E365F] text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#693BFF] text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                            {s.id}
                          </div>
                          <div>
                            <div style={{ color: isDarkMode ? '#FFFFFF' : '#0F172A' }} className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {s.id}{' '}
                              <span style={{ color: isDarkMode ? '#94A3B8' : '#64748B' }} className={`text-[10px] font-medium ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                                (ID #{s.seatDbId})
                              </span>
                            </div>
                            <div style={{ color: isDarkMode ? '#8FA2C2' : '#334155' }} className={`text-[11px] font-semibold ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-700'}`}>
                              {getSeatTypeLabel(s.type)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <button
                            onClick={() => toggleSeat(s.id)}
                            className={`transition-colors cursor-pointer ${
                              isDarkMode ? 'text-[#64748B] hover:text-white' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <X size={12} />
                          </button>
                          <span className={`text-xs font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(s.price)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Price Breakdown + CTA */}
            <div className={`space-y-3.5 pt-3.5 border-t ${isDarkMode ? 'border-[#152642]' : 'border-slate-100'}`}>
              <div className="space-y-2 text-xs">
                <div className={`font-bold ${isDarkMode ? 'text-[#E2E8F0]' : 'text-slate-800'}`}>Chi tiết hóa đơn</div>
                {standardSeats.length > 0 && (
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    <span>Ghế thường ({standardSeats.length})</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(
                        standardSeats.reduce((sum, s) => sum + s.price, 0)
                      )}
                    </span>
                  </div>
                )}
                {vipSeats.length > 0 && (
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    <span>Ghế VIP ({vipSeats.length})</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(vipSeats.reduce((sum, s) => sum + s.price, 0))}
                    </span>
                  </div>
                )}
                {coupleSeats.length > 0 && (
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    <span>Ghế đôi ({coupleSeats.length})</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(
                        coupleSeats.reduce((sum, s) => sum + s.price, 0)
                      )}
                    </span>
                  </div>
                )}
                {fnbTotal > 0 && (
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
                    <span>Bắp nước & Combo</span>
                    <span className="font-semibold text-emerald-400">
                      +{formatCurrency(fnbTotal)}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-400 font-semibold">
                    <span>Voucher ưu đãi</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between pt-2.5 border-t ${isDarkMode ? 'border-[#152642]' : 'border-slate-100'}`}>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tổng thanh toán</span>
                <span className="text-2xl font-black tracking-tight text-[#693BFF]">
                  {formatCurrency(finalCheckoutTotal)}
                </span>
              </div>

              {/* PHƯƠNG THỨC THANH TOÁN DUY NHẤT: MÃ QR ZALOPAY SANDBOX */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${
                isDarkMode
                  ? 'bg-[#091832] border-[#0068FF]/50'
                  : 'bg-blue-50/70 border-blue-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0068FF] to-[#00A8FF] flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                    QR
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-extrabold leading-tight ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>
                      Thanh toán bằng Mã QR
                    </div>
                    <div className={`text-[10.5px] truncate ${isDarkMode ? 'text-[#93C5FD]' : 'text-blue-600 font-medium'}`}>
                      Cổng ZaloPay Sandbox OpenAPI v2
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0068FF]/15 border border-[#0068FF]/40 text-[10.5px] font-extrabold text-[#0068FF] whitespace-nowrap flex-shrink-0">
                  Mặc định
                </span>
              </div>

              {bookingError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-[11px] text-rose-300">
                  {bookingError}
                </div>
              )}

              {/* NÚT 1 & 2 */}
              <div className="space-y-2.5 pt-1">
                <button
                  disabled={selectedSeats.length === 0 || isSubmittingBooking}
                  onClick={handleExecuteBookingAndPayment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0068FF] via-[#4F46E5] to-[#693BFF] hover:from-[#0057D9] hover:to-[#7A4FFF] disabled:opacity-40 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(0,104,255,0.45)] transition-all cursor-pointer"
                >
                  <span>
                    {isSubmittingBooking
                      ? 'Đang tạo mã QR thanh toán...'
                      : 'Đặt vé & Hiện mã QR thanh toán'}
                  </span>
                  <ChevronRight size={15} />
                </button>

                <button
                  disabled={selectedSeats.length === 0}
                  onClick={() => {
                    setBookingError(null);
                    setShowFnbModal(true);
                  }}
                  className={`w-full py-2.5 rounded-xl border disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#0D1E3A] hover:bg-[#162D52] border-[#243E6C] text-[#93C5FD]'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  <Gift size={14} className="text-[#A875FF]" />
                  <span>Thêm Bắp nước / Mã giảm giá</span>
                </button>
              </div>

              <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-[11px] ${
                isDarkMode
                  ? 'bg-[#09152B] border-[#1B3158] text-[#94A3B8]'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <Info size={14} className="text-[#693BFF] flex-shrink-0" />
                <span>Bạn có thể chọn tối đa 6 ghế cho mỗi đơn hàng.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================================
          MODAL 3: CHỌN RẠP & SUẤT CHIẾU (100% từ bảng cinemas & showtimes MySQL)
         ===================================================================== */}
      {showShowtimeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowShowtimeModal(false)}
        >
          <div
            ref={showtimeModalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1440px] h-[90vh] flex flex-col bg-[#061123] border border-[#1B325B] rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-[#162949] flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0A1931] border border-[#1E365F]">
                <MapPin size={15} className="text-[#7C4DFF]" />
                <span className="text-xs font-bold text-white">
                  Lịch chiếu ({backendShowtimes.length} suất chiếu)
                </span>
              </div>
              <button
                onClick={() => setShowShowtimeModal(false)}
                className="w-8 h-8 rounded-full bg-[#0C1D38] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Date Tabs từ showDate thực tế trong DB */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableShowDates.map((dateStr, idx) => (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateTab(dateStr)}
                    className={`dtl__bar py-2 rounded-xl text-center border transition-all cursor-pointer ${
                      selectedDateTab === dateStr
                        ? 'dtl__today bg-[#693BFF] border-[#8B5CF6] text-white shadow-[0_0_15px_rgba(105,59,255,0.5)]'
                        : 'bg-[#0A1830] border-[#1A3056] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-medium">
                      Ngày chiếu #{idx + 1}
                    </div>
                    <div className="text-xs font-extrabold">
                      {formatDateVN(dateStr)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Format Pills từ screenFormat thực tế trong DB */}
              <div className="flex items-center gap-2">
                {availableFormats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormatTab(fmt)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedFormatTab === fmt
                        ? 'bg-[#1D3564] border-[#60A5FA] text-white'
                        : 'bg-[#091529] border-[#172B4D] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {fmt === 'ALL' ? 'Tất cả định dạng' : fmt}
                  </button>
                ))}
              </div>

              {/* Danh sách Cụm rạp & Suất chiếu thực tế từ MySQL */}
              <div className="space-y-3">
                {backendCinemas.map((cinema) => {
                  const cinemaShowtimes = backendShowtimes.filter(
                    (st) =>
                      st.cinemaId === cinema.id &&
                      (!selectedDateTab || st.showDate === selectedDateTab) &&
                      (selectedFormatTab === 'ALL' ||
                        st.screenFormat === selectedFormatTab)
                  );

                  return (
                    <div
                      key={cinema.id}
                      className="p-3.5 rounded-2xl bg-[#09162C] border border-[#192F56] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {cinema.name}
                          </h4>
                          <p className="text-[11px] text-[#8FA2C2]">
                            {cinema.address}, {cinema.district}, {cinema.city}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#0E203F] border border-[#213B6B] text-[11px] font-semibold text-[#93C5FD]">
                          {cinema.city}
                        </span>
                      </div>

                      {cinemaShowtimes.length === 0 ? (
                        <div className="text-xs text-[#64748B] italic">
                          Không có suất chiếu phù hợp bộ lọc tại rạp này.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cinemaShowtimes.map((st) => {
                            const isCurrent = activeShowtime?.id === st.id;
                            return (
                              <button
                                key={st.id}
                                onClick={() => {
                                  setActiveShowtime(st);
                                  setShowShowtimeModal(false);
                                }}
                                className={`dtl__bar p-2.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                                  isCurrent
                                    ? 'dtl__today bg-[#693BFF] border-[#A875FF] text-white shadow-[0_0_12px_rgba(105,59,255,0.5)]'
                                    : 'bg-[#0D1E3A] hover:bg-[#17305B] border-[#213B6B] text-[#E2E8F0]'
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="text-xs font-extrabold truncate">
                                    {st.movieTitle}
                                  </div>
                                  <div className="text-[10.5px] opacity-80">
                                    {st.roomName} • {st.screenFormat}
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-black/30 font-extrabold text-xs flex-shrink-0">
                                  {formatTimeShort(st.startTime)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4.5: QUẦY BẮP NƯỚC & MÃ GIẢM GIÁ (ĐỘC LẬP - KHÔNG BẮT BUỘC THANH TOÁN)
         ===================================================================== */}
      {showFnbModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowFnbModal(false)}
        >
          <div
            ref={fnbModalRef}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
              isDarkMode
                ? 'bg-[#061123] border-[#1D3561] text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-[#162949] bg-[#0A1830]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quầy Bắp Nước & Mã Giảm Giá
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-500'}`}>
                    Thêm bắp rang bơ giòn rụm, đồ uống mát lạnh & áp dụng voucher ưu đãi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFnbModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-[#0B1B35] text-[#94A3B8] hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Danh sách món F&B */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#8FA2C2]' : 'text-slate-500'}`}>
                    Danh sách Combo & Món lẻ ({fnbList.length} món)
                  </span>
                  <span className="text-xs text-[#693BFF] font-extrabold">
                    Đã chọn: {Object.values(selectedFnbQuantities).reduce((a, b) => a + b, 0)} món
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fnbList.map((item) => {
                    const qty = selectedFnbQuantities[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`dtl__bar p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          qty > 0
                            ? isDarkMode
                              ? 'bg-[#0D203E] border-[#693BFF] shadow-[0_0_12px_rgba(105,59,255,0.25)]'
                              : 'bg-purple-50/60 border-[#693BFF] shadow-xs'
                            : isDarkMode
                            ? 'bg-[#09162B] border-[#182C50] hover:border-[#243F6E]'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm border border-black/10"
                          />
                          <div className="min-w-0 flex-1">
                            <div className={`font-bold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {item.itemName}
                            </div>
                            <div className="text-[10px] text-amber-500 uppercase font-black mt-0.5">
                              {item.category === 'combo' ? 'Combo Ưu Đãi' : item.category === 'popcorn' ? 'Bắp Rang' : 'Nước Ngọt'}
                            </div>
                            <div className="text-xs font-black text-[#693BFF] mt-1">
                              {formatCurrency(Number(item.basePrice))}
                            </div>
                          </div>
                        </div>

                        {/* Controls +/- */}
                        <div className={`flex items-center gap-2 border rounded-xl px-2 py-1 flex-shrink-0 ${
                          isDarkMode ? 'bg-[#071326] border-[#1E365F]' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <button
                            onClick={() =>
                              setSelectedFnbQuantities((prev) => ({
                                ...prev,
                                [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                              }))
                            }
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className={`w-4 text-center font-black text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              setSelectedFnbQuantities((prev) => ({
                                ...prev,
                                [item.id]: (prev[item.id] || 0) + 1,
                              }))
                            }
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nhập mã giảm giá */}
              <div className={`dtl__today p-4 rounded-2xl border space-y-2.5 ${
                isDarkMode ? 'bg-[#09162B] border-[#182C50]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Mã giảm giá ưu đãi
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-xs font-black text-emerald-500">
                      Đã giảm: -{formatCurrency(discountAmount)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (VD: CINEMA20, WELCOME30K, VIP50K)"
                    className={`flex-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isDarkMode
                        ? 'bg-[#071326] border-[#1E365F] text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Gợi ý mã */}
                <div className="space-y-1.5 pt-1">
                  {userRedeemedCoupons.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10.5px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-[#693BFF]'}`}>
                        <Sparkles size={11} /> Mã bạn đã đổi ({userRedeemedCoupons.length}):
                      </span>
                      {userRedeemedCoupons.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setCouponInput(code)}
                          className={`btn-press px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                            couponInput === code
                              ? 'bg-[#693BFF] border-[#693BFF] text-white shadow-md'
                              : isDarkMode
                              ? 'bg-[#0B1A33] border-[#1E365F] text-[#93C5FD] hover:bg-[#12284D]'
                              : 'bg-white border-slate-200 text-[#693BFF] hover:bg-slate-100'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                      isDarkMode ? 'bg-[#0B1A33]/70 border-[#1E365F] text-[#8EA2C6]' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-400" />
                        Chưa có mã ưu đãi. Hãy đổi điểm tại Kho Ưu Đãi!
                      </span>
                      <a href="/#promos" className="text-[#A875FF] hover:underline font-bold text-[10.5px]">
                        Đổi mã ngay →
                      </a>
                    </div>
                  )}
                </div>

                {couponMessage && (
                  <div className={`text-[11px] font-semibold ${
                    couponMessage.includes('thành công') || discountAmount > 0
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {couponMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDarkMode ? 'border-[#162949] bg-[#0A1830]' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Tiền bắp nước: </span>
                  <span className="font-extrabold text-[#693BFF]">{formatCurrency(fnbTotal)}</span>
                </div>
                <div>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Tạm tính đơn: </span>
                  <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(finalCheckoutTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setShowFnbModal(false)}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'bg-[#0D1D36] hover:bg-[#162D52] border-[#1F3864] text-white'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  Xác nhận & Quay lại
                </button>
                <button
                  onClick={() => {
                    setShowFnbModal(false);
                    setShowCheckoutModal(true);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5829E8] hover:to-[#6E3FFF] text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Tiến hành Đặt vé</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: XÁC NHẬN ĐƠN HÀNG & THANH TOÁN (Kết nối trực tiếp /api/v1/bookings, /fnb-items, /coupons/apply)
         ===================================================================== */}
      {showCheckoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowCheckoutModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#061123] border border-[#1D3561] rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-[#162949] flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                Xác nhận đơn hàng & Thanh toán
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Movie & Seat Card */}
              <div className="p-3.5 rounded-xl bg-[#0A1931] border border-[#1B325B] flex items-center gap-3.5">
                {activeShowtime?.moviePosterUrl && (
                  <img
                    src={activeShowtime.moviePosterUrl}
                    alt={activeShowtime.movieTitle}
                    className="w-12 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-white">
                    {activeShowtime?.movieTitle}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {activeShowtime?.cinemaName} •{' '}
                    {formatTimeShort(activeShowtime?.startTime)} -{' '}
                    {formatDateVN(activeShowtime?.showDate)}
                  </p>
                  <p className="text-xs font-bold text-[#A875FF] mt-1">
                    Ghế: {selectedSeats.map((s) => s.id).join(', ')} (
                    {selectedSeats.length} ghế — {formatCurrency(seatTotal)})
                  </p>
                </div>
              </div>

              {/* Danh sách Bắp nước & Combo thực tế từ bảng fnb_items trong MySQL */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white">
                  Chọn Bắp nước & Combo từ Quầy F&B ({fnbList.length} món)
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {fnbList.map((item) => {
                    const qty = selectedFnbQuantities[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#09162B] border border-[#192F56] text-xs hover:border-[#693BFF] transition-all hover:bg-[#0D203E]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.itemName}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-700/60 shadow-xs"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">
                              {item.itemName}
                            </div>
                            <div className="text-[11px] text-[#8FA2C2]">
                              {formatCurrency(Number(item.basePrice))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0C1D38] border border-[#1F3864] rounded-lg px-2 py-1">
                          <button
                            onClick={() =>
                              setSelectedFnbQuantities((prev) => ({
                                ...prev,
                                [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                              }))
                            }
                            className="btn-press text-[#94A3B8] hover:text-white px-1.5 font-bold cursor-pointer hover:scale-125 transition-transform"
                          >
                            -
                          </button>
                          <span className="font-bold text-white w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              setSelectedFnbQuantities((prev) => ({
                                ...prev,
                                [item.id]: (prev[item.id] || 0) + 1,
                              }))
                            }
                            className="btn-press text-[#94A3B8] hover:text-white px-1.5 font-bold cursor-pointer hover:scale-125 transition-transform"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mã giảm giá thực tế từ bảng coupons (CINEMA20, WELCOME30K, VIP50K) */}
              <div className="space-y-2.5 text-xs border-y border-[#162949] py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã ưu đãi của bạn"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0A1830] border border-[#1E365F] text-xs font-bold text-white placeholder-slate-500"
                    />
                  </div>
                  <span className="font-bold text-emerald-400 whitespace-nowrap">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>

                {/* Danh sách mã bạn đã đổi */}
                {userRedeemedCoupons.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10.5px] text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles size={11} /> Mã bạn đã đổi:
                    </span>
                    {userRedeemedCoupons.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCouponInput(code)}
                        className={`btn-press px-2 py-0.5 rounded-md border text-[10.5px] font-mono font-bold cursor-pointer transition-colors ${
                          couponInput === code
                            ? 'bg-[#693BFF] border-[#693BFF] text-white shadow-sm'
                            : 'bg-[#0B1A33] border-[#1E365F] text-[#93C5FD] hover:bg-[#12284D]'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock size={10} className="text-amber-400" />
                      Chưa đổi mã ưu đãi nào.
                    </span>
                    <a href="/#promos" className="text-[#A875FF] hover:underline font-bold">
                      Đổi mã tại Kho Ưu Đãi →
                    </a>
                  </div>
                )}
                {couponMessage && (
                  <div className="text-[11px] text-[#93C5FD]">{couponMessage}</div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#162949]">
                  <span className="text-sm font-bold text-white">Tổng thanh toán</span>
                  <span className="text-xl font-extrabold text-white">
                    {formatCurrency(finalCheckoutTotal)}
                  </span>
                </div>
              </div>

              {/* Phương thức thanh toán cố định: Mã QR ZaloPay Sandbox */}
              <div className="p-3 rounded-xl bg-[#091832] border border-[#0068FF]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0068FF] to-[#00A8FF] flex items-center justify-center text-white font-black text-xs shadow-[0_0_12px_rgba(0,104,255,0.45)]">
                    QR
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      Thanh toán bằng Mã QR (ZaloPay Sandbox)
                    </div>
                    <div className="text-[11px] text-[#93C5FD]">
                      Tự động tạo mã QR & kích hoạt vé khi thanh toán thành công
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#0068FF]/20 border border-[#0068FF]/40 text-[10px] font-extrabold text-[#60A5FA]">
                  QR Code
                </span>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300">
                  {bookingError}
                </div>
              )}

              {/* Pay Now Button -> Tạo đơn PENDING + Gọi ZaloPay /v2/create để hiện mã QR ZaloPay Sandbox chờ quét */}
              <button
                disabled={isSubmittingBooking || !activeShowtime}
                onClick={handleExecuteBookingAndPayment}
                className="btn-press w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0068FF] via-[#4F46E5] to-[#693BFF] hover:from-[#0057D9] hover:to-[#7A4FFF] disabled:opacity-60 text-white font-extrabold text-sm shadow-[0_6px_24px_rgba(0,104,255,0.55)] cursor-pointer transition-all active:scale-[0.98]"
              >
                {isSubmittingBooking
                  ? 'Đang tạo mã QR ZaloPay Sandbox...'
                  : 'Tạo mã QR & Thanh toán ngay'}
              </button>

              <div className="text-center space-y-1">
                <div className="text-xs text-[#94A3B8]">
                  Thời gian giữ ghế (5 phút):{' '}
                  <span className="font-bold text-amber-400">
                    {formatCountdown(countdown)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Thanh toán an toàn qua cổng ZaloPay Sandbox OpenAPI v2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5.5: QUÉT MÃ QR ZALOPAY SANDBOX (CHỜ KHÁCH THANH TOÁN XONG MỚI BÁO THÀNH CÔNG)
         ===================================================================== */}
      {showZaloPayQRModal && zaloPayOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowZaloPayQRModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="keep-dark w-full max-w-md bg-[#061123] border border-[#0068FF]/60 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_40px_rgba(0,104,255,0.3)]"
          >
            <div className="flex items-center justify-between border-b border-[#162949] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0068FF] to-[#00A8FF] flex items-center justify-center text-white font-black text-xs">
                  ZP
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-white">
                    Cổng Thanh Toán QR ZaloPay Sandbox
                  </h3>
                  <p className="text-[11px] text-[#93C5FD]">
                    Mã GD: {zaloPayOrder.appTransId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowZaloPayQRModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Khung hiển thị mã QR thật từ ZaloPay Sandbox (/v2/create) */}
            <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-xl border-4 border-[#0068FF]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  zaloPayOrder.qrCode || zaloPayOrder.orderUrl
                )}`}
                alt="ZaloPay Sandbox QR Code"
                className="w-[210px] h-[210px] object-contain mx-auto"
              />
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#0068FF]">
                <span>Quét mã bằng ứng dụng ZaloPay Sandbox</span>
              </div>
            </div>

            {/* Thông tin số tiền & trạng thái polling */}
            <div className="p-3.5 rounded-2xl bg-[#0A1830] border border-[#1E365F] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Mã đặt vé (PENDING):</span>
                <span className="font-mono font-bold text-white">
                  #{zaloPayOrder.bookingCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Số tiền thanh toán:</span>
                <span className="text-base font-extrabold text-[#FFB52E]">
                  {formatCurrency(zaloPayOrder.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Thời gian giữ ghế còn lại:</span>
                <span className="font-bold text-amber-400">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>

            {/* Trạng thái tự động kiểm tra từ /api/v1/payments/zalopay/query/{appTransId} */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#0068FF]/15 border border-[#0068FF]/40 flex items-center justify-center gap-2 text-xs text-[#93C5FD]">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#00A8FF] border-t-transparent animate-spin flex-shrink-0" />
              <span className="text-left leading-snug">{zaloPayStatusMsg}</span>
            </div>

            {/* Các nút thao tác: Mở link cổng ZaloPay Sandbox & Kiểm tra trạng thái ngay */}
            <div className="space-y-2 pt-1">
              <a
                href={zaloPayOrder.orderUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#0068FF] to-[#0095FF] hover:from-[#0057D9] hover:to-[#0080E6] text-white font-extrabold text-xs shadow-lg"
              >
                Mở trang Cổng Thanh Toán ZaloPay Sandbox ↗
              </a>

              <button
                disabled={isCheckingZaloPay}
                onClick={() => checkZaloPayPaymentStatus(false)}
                style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
                className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-black border border-slate-700 text-white font-black text-xs cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} style={{ color: '#38BDF8' }} className="flex-shrink-0" />
                <span style={{ color: '#FFFFFF' }} className="text-white font-black">
                  {isCheckingZaloPay
                    ? 'Đang truy vấn máy chủ ZaloPay (/v2/query)...'
                    : 'Tôi đã thanh toán trên ZaloPay — Kiểm tra ngay'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 6: VÉ ĐIỆN TỬ QR CODE (CHỈ HIỂN THỊ SAU KHI ĐÃ THANH TOÁN THÀNH CÔNG)
         ===================================================================== */}
      {showETicketModal && createdBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowETicketModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#061123] border border-[#1D3561] rounded-3xl p-5 text-center space-y-4 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={26} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">
                Đặt vé thành công!
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Vé điện tử đã được gửi tới {createdBooking.contactEmail}
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-[#0A1830] border border-[#1E365F] rounded-2xl p-4 text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-bold text-[#A875FF]">
                <span className="flex items-center gap-1.5">
                  <Ticket size={14} />
                  <span>CineBooking E-Ticket</span>
                </span>
                <span className="text-emerald-400 uppercase text-[10px]">
                  {createdBooking.paymentStatus}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {activeShowtime?.moviePosterUrl && (
                  <img
                    src={activeShowtime.moviePosterUrl}
                    alt={createdBooking.movieTitle}
                    className="w-12 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {createdBooking.movieTitle}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    {formatTimeShort(createdBooking.startTime)} -{' '}
                    {formatDateVN(createdBooking.showDate)}
                  </p>
                  <p className="text-[11px] text-[#CBD5E1]">
                    {createdBooking.cinemaName}
                  </p>
                  <p className="text-xs font-bold text-[#FFB52E] mt-0.5">
                    {createdBooking.roomName} • Ghế:{' '}
                    {createdBooking.tickets?.map((t) => t.seatCode).join(', ')}
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-[#264373] my-2" />

              {/* QR Code thật sinh từ Backend */}
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="p-2.5 bg-white rounded-xl shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      createdBooking.tickets?.[0]?.ticketCode ||
                        createdBooking.bookingCode
                    )}`}
                    alt="Ticket QR"
                    className="w-[110px] h-[110px] object-contain"
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#CBD5E1] mt-2">
                  Mã vé QR:{' '}
                  {createdBooking.tickets?.[0]?.ticketCode ||
                    createdBooking.bookingCode}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  Mã đơn: #{createdBooking.bookingCode} • Tổng:{' '}
                  {formatCurrency(Number(createdBooking.totalAmount))}
                </span>
                {loyaltyPointsEarned > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                    +{loyaltyPointsEarned} điểm thưởng thành viên
                  </span>
                )}
              </div>
            </div>

            {copiedTicketMsg && (
              <div className="text-xs font-bold text-emerald-400">
                {copiedTicketMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.print()}
                className="py-2 rounded-xl bg-[#0D1E3A] hover:bg-[#173260] border border-[#243E6C] text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Lưu / In vé PDF</span>
              </button>
              <button
                onClick={() => {
                  const code =
                    createdBooking.tickets?.[0]?.ticketCode ||
                    createdBooking.bookingCode;
                  navigator.clipboard?.writeText(code);
                  setCopiedTicketMsg(`Đã sao chép mã vé: ${code}`);
                  setTimeout(() => setCopiedTicketMsg(''), 3000);
                }}
                className="py-2 rounded-xl bg-[#0D1E3A] hover:bg-[#173260] border border-[#243E6C] text-xs font-bold text-[#93C5FD] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 size={13} />
                <span>Sao chép mã vé</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setShowETicketModal(false);
                  setShowAccountDrawer(true);
                }}
                className="py-2.5 rounded-xl bg-[#102242] hover:bg-[#18315E] text-xs font-bold text-[#CBD5E1] cursor-pointer"
              >
                Lịch sử đặt vé
              </button>
              <Link
                href="/"
                className="py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-bold text-white flex items-center justify-center"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 6.5: BẢN ĐỒ ĐỊNH VỊ RẠP CHIẾU PHIM (TỪ TỌA ĐỘ LAT/LNG TRONG MYSQL)
         ===================================================================== */}
      {showMapModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowMapModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#061123] border border-[#243E6C] rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#162949] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#693BFF]/20 border border-[#693BFF]/50 flex items-center justify-center text-[#A875FF]">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {activeCinema?.name || activeShowtime?.cinemaName}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {activeCinema
                      ? `${activeCinema.address}, ${activeCinema.district}, ${activeCinema.city}`
                      : activeShowtime?.cinemaCity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#1E365F] h-[340px] bg-[#0A1830]">
              <iframe
                title="Cinema Google Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${
                  activeCinema?.latitude || 10.7716
                },${
                  activeCinema?.longitude || 106.7044
                }&z=16&output=embed`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#CBD5E1]">
              <div>
                <span className="text-[#94A3B8]">Hotline cụm rạp: </span>
                <b className="text-white">{activeCinema?.phone || '1900 6017'}</b>
                {activeCinema?.latitude && (
                  <span className="ml-3 text-[#64748B]">
                    (GPS: {activeCinema.latitude}, {activeCinema.longitude})
                  </span>
                )}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${
                  activeCinema?.latitude || 10.7716
                },${activeCinema?.longitude || 106.7044}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white font-bold text-xs"
              >
                Mở trên Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DRAWER 7: TÀI KHOẢN & LỊCH SỬ (100% từ /api/v1/auth/me & /api/v1/bookings)
         ===================================================================== */}
      {showAccountDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end"
          onClick={() => setShowAccountDrawer(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#050E1E] border-l border-[#192F56] h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#693BFF] to-[#EC4899] flex items-center justify-center text-base font-extrabold text-white">
                    {userProfile ? userProfile.fullName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {userProfile?.fullName || 'Khách hàng'}
                    </h3>
                    <p className="text-xs text-[#8FA2C2]">
                      {userProfile?.email} • {userProfile?.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAccountDrawer(false)}
                  className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#0F172A] border border-[#4F46E5]/50 flex items-center justify-between">
                <span className="text-xs font-bold text-[#C4B5FD] uppercase">
                  ★ Hạng {userProfile?.memberTier || 'bronze'}
                </span>
                <span className="text-xs font-extrabold text-[#FFB52E]">
                  {userProfile?.loyaltyPoints ?? 0} điểm CineClub
                </span>
              </div>

              {/* Lịch sử đơn đặt vé thực tế từ bảng bookings trong MySQL */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Lịch sử đặt vé
                </h4>

                <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                  {userBookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0D1E3A] to-[#081224] border border-[#243E6C] space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-[#A875FF]">
                          #{bk.bookingCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            bk.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {bk.status}
                        </span>
                      </div>

                      <h5 className="text-sm font-extrabold text-white">
                        {bk.movieTitle}
                      </h5>
                      <p className="text-[11px] text-[#94A3B8]">
                        {bk.cinemaName} • {bk.roomName} ({bk.screenFormat})
                      </p>
                      <p className="text-[11px] text-[#CBD5E1]">
                        Suất: {formatTimeShort(bk.startTime)} •{' '}
                        {formatDateVN(bk.showDate)}
                      </p>
                      <p className="text-xs font-bold text-[#FFB52E]">
                        Ghế: {bk.tickets?.map((t) => t.seatCode).join(', ')} —{' '}
                        {formatCurrency(Number(bk.totalAmount))}
                      </p>

                      {bk.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={async () => {
                              const remSec = getRemainingHoldSeconds(bk.holdExpiresAt);
                              if (bk.holdExpiresAt && remSec <= 0) {
                                alert(`Đơn giữ ghế #${bk.bookingCode} đã hết hạn (quá 5 phút). Ghế đã được tự động giải phóng.`);
                                if (userProfile?.id) {
                                  const fresh = await cineBookingApi.getUserBookings(userProfile.id);
                                  setUserBookings(fresh || []);
                                }
                                return;
                              }
                              try {
                                const zp =
                                  await cineBookingApi.createZaloPayOrder(bk.id);
                                setCreatedBooking(bk);
                                setZaloPayOrder({
                                  bookingId: bk.id,
                                  bookingCode: bk.bookingCode,
                                  appTransId: zp.appTransId,
                                  orderUrl: zp.orderUrl,
                                  qrCode: zp.qrCode || zp.orderUrl,
                                  amount: Number(zp.amount || bk.totalAmount),
                                });
                                setCountdown(remSec > 0 ? remSec : 300);
                                setZaloPayStatusMsg(
                                  'Đang chờ bạn quét mã QR hoặc hoàn tất thanh toán trên ZaloPay Sandbox...'
                                );
                                setShowAccountDrawer(false);
                                setShowZaloPayQRModal(true);
                              } catch (err: any) {
                                alert(err?.message || 'Lỗi tạo lại QR ZaloPay');
                                if (userProfile?.id) {
                                  const fresh = await cineBookingApi.getUserBookings(userProfile.id);
                                  setUserBookings(fresh || []);
                                }
                              }
                            }}
                            className="py-1.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Mở QR ZaloPay
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                await cineBookingApi.cancelUnpaidBooking(
                                  bk.id,
                                  'Khách hàng hủy đơn giữ ghế chưa thanh toán'
                                );
                                const freshBookings =
                                  await cineBookingApi.getUserBookings(
                                    userProfile?.id || 2
                                  );
                                setUserBookings(freshBookings);
                                if (activeShowtime) {
                                  const seatLayout =
                                    await cineBookingApi.getSeatLayoutByShowtime(
                                      activeShowtime.id
                                    );
                                  if (seatLayout?.seats) {
                                    syncFromBackend(seatLayout.seats);
                                  }
                                }
                              } catch (err) {
                                console.error('Lỗi hủy đơn giữ ghế:', err);
                              }
                            }}
                            className="py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
                          >
                            Hủy giữ ghế
                          </button>
                        </div>
                      )}

                      {bk.status === 'confirmed' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => {
                              setCreatedBooking(bk);
                              setShowAccountDrawer(false);
                              setShowETicketModal(true);
                            }}
                            className="py-1.5 rounded-xl bg-[#162B52] hover:bg-[#693BFF] text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Xem vé QR
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                await cineBookingApi.requestAndProcessRefund(
                                  bk.id,
                                  'Khách hàng yêu cầu hủy vé và hoàn tiền từ giao diện'
                                );
                                const [freshUser, freshBookings] =
                                  await Promise.all([
                                    cineBookingApi.getMe().catch(() => null),
                                    cineBookingApi
                                      .getUserBookings(userProfile?.id || 2)
                                      .catch(() => []),
                                  ]);
                                if (freshUser) setUserProfile(freshUser);
                                setUserBookings(freshBookings);
                                if (activeShowtime) {
                                  const seatLayout =
                                    await cineBookingApi.getSeatLayoutByShowtime(
                                      activeShowtime.id
                                    );
                                  if (seatLayout?.seats) {
                                    syncFromBackend(seatLayout.seats);
                                  }
                                }
                              } catch (err) {
                                console.error('Lỗi hoàn tiền:', err);
                              }
                            }}
                            className="py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
                          >
                            Hủy & Hoàn tiền
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom action: Nút Đăng xuất */}
            <div className="pt-4 mt-4 border-t border-[#192F56]">
              {userProfile ? (
                <button
                  onClick={() => {
                    clearAuthSession();
                    setUserProfile(null);
                    setUserBookings([]);
                    setShowAccountDrawer(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Đăng xuất tài khoản</span>
                </button>
              ) : (
                <Link
                  href="/?view=members"
                  onClick={() => setShowAccountDrawer(false)}
                  className="w-full py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#5729E8] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Đăng nhập tài khoản</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
