'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Ticket,
  Users,
  Tag,
  Star,
  Search,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
  MapPin,
  RotateCcw,
  ExternalLink,
  Lock,
  RefreshCw,
  Sparkles,
  QrCode,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Percent,
  Award,
  Zap,
  Download,
  Filter,
  Layers,
  Tv,
  Check,
  Coffee,
  ShoppingBag,
  CircleDot,
  Cpu,
  FileSpreadsheet,
  Loader2,
  Upload,
  Image as ImageIcon,
  Pencil,
} from 'lucide-react';
import {
  cineBookingApi,
  ensureAdminAuth,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  BackendMovie,
  BackendCinema,
  BackendShowtime,
  BackendUserProfile,
  BackendBookingResponse,
  BackendCoupon,
  BackendBanner,
  BackendDashboardSummary,
} from '@/lib/api';
import {
  triggerCinemaConfetti,
  AnimatedNumber,
  handleCard3DTilt,
  handleCard3DReset,
  useInView,
  ScrollReveal,
  LazySection,
  playTimelineChoreography,
} from '@/lib/motion';

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return '2h 00m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m < 10 ? `0${m}` : m}m`;
}

function formatDateVN(isoDate?: string) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function AdminPortalPage() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'movies' | 'showtimes' | 'bookings' | 'users' | 'coupons' | 'reviews'
  >('dashboard');

  // Theme state (100% đồng bộ với trang Home)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auth Guard
  const [adminUser, setAdminUser] = useState<BackendUserProfile | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@cinema.com');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Global Data States
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<BackendDashboardSummary | null>(null);
  const [moviesList, setMoviesList] = useState<BackendMovie[]>([]);
  const [showtimesList, setShowtimesList] = useState<BackendShowtime[]>([]);
  const [cinemasList, setCinemasList] = useState<BackendCinema[]>([]);
  const [bookingsList, setBookingsList] = useState<BackendBookingResponse[]>([]);
  const [usersList, setUsersList] = useState<BackendUserProfile[]>([]);
  const [couponsList, setCouponsList] = useState<BackendCoupon[]>([]);
  const [bannersList, setBannersList] = useState<BackendBanner[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Search & Filter States
  const [searchMovieQuery, setSearchMovieQuery] = useState('');
  const [searchBookingQuery, setSearchBookingQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('ALL');
  const [filterShowtimeCinema, setFilterShowtimeCinema] = useState<number | 'ALL'>('ALL');

  // Dashboard Enhanced Interactive States
  const [dashboardTimeRange, setDashboardTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [dashboardCinemaFilter, setDashboardCinemaFilter] = useState<number | 'ALL'>('ALL');
  const [hoveredChartDay, setHoveredChartDay] = useState<number | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);
  const [chartsRowRef, isChartsRowVisible] = useInView({ threshold: 0.12 });

  // Modals & Action States
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showEditMovieModal, setShowEditMovieModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<number | null>(null);
  const [showAddShowtimeModal, setShowAddShowtimeModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Form Chỉnh Sửa Phim
  const [editMovieForm, setEditMovieForm] = useState({
    title: '',
    description: '',
    durationMinutes: 120,
    ageRating: 'C16',
    language: 'Tiếng Anh - Phụ đề Việt',
    trailerUrl: '',
    posterUrl: '',
    status: 'now_showing',
    director: '',
    genreIds: [1, 5],
  });

  // QR Check-in Box State
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
  } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Form Thêm Phim Mới
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    durationMinutes: 120,
    ageRating: 'C16',
    language: 'Tiếng Anh - Phụ đề Việt',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
    status: 'now_showing',
    director: 'Christopher Nolan',
    genreIds: [1, 5],
  });

  // Upload Poster state (Chuẩn giáo trình Cloudinary qua REST API Backend `POST /api/v1/uploads/image`)
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước file ảnh vượt quá giới hạn 10MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Định dạng không hợp lệ. Vui lòng chọn ảnh JPG, PNG, WEBP, GIF hoặc SVG.');
      return;
    }

    try {
      setUploadingPoster(true);
      setUploadError(null);
      setUploadSuccess(false);

      const res = await cineBookingApi.uploadImage(file, 'movies');
      const uploadedUrl = res.secureUrl || res.url;
      setMovieForm((prev) => ({ ...prev, posterUrl: uploadedUrl }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi khi upload ảnh lên Backend / Cloudinary');
    } finally {
      setUploadingPoster(false);
      // Reset input value to allow selecting same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Form Thêm Suất Chiếu
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: 1,
    roomId: 4,
    showDate: new Date().toISOString().split('T')[0],
    startTime: '19:30:00',
    screenFormat: 'IMAX',
    status: 'open',
  });

  // Form Thêm Coupon
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 150000,
    maxDiscountAmount: 50000,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    isActive: true,
  });

  // =========================================================================
  // 1. KHỞI TẠO THEME & KIỂM TRA QUYỀN TRUY CẬP (AUTH GUARD)
  // =========================================================================
  useEffect(() => {
    const savedTheme = localStorage.getItem('cinebooking_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('theme-light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove('theme-light');
    }

    checkAuthGuard();

    // Đọc phân hệ quản trị hiện tại từ URL ?tab= hoặc LocalStorage khi bấm F5
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as any;
    const savedTab = localStorage.getItem('cinebooking_admin_tab') as any;
    const validTabs = ['dashboard', 'movies', 'showtimes', 'bookings', 'users', 'coupons', 'reviews'];
    const targetTab = validTabs.includes(tabParam)
      ? tabParam
      : (validTabs.includes(savedTab) ? savedTab : 'dashboard');
    if (targetTab) {
      setActiveTab(targetTab);
    }

    // Lắng nghe sự kiện storage để đồng bộ Theme & Đăng nhập giữa các tab tức thì
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cinebooking_theme') {
        const newTheme = e.newValue;
        if (newTheme === 'light') {
          setIsDarkMode(false);
          document.documentElement.classList.add('theme-light');
        } else {
          setIsDarkMode(true);
          document.documentElement.classList.remove('theme-light');
        }
      }
      if (e.key === 'cinebooking_auth_user' || e.key === 'cinebooking_auth_token') {
        checkAuthGuard();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

  // Tự động đồng bộ phân hệ quản trị đang mở vào URL & LocalStorage khi đổi tab
  // Giúp khi bấm F5 vẫn giữ nguyên tab quản trị hiện tại (ví dụ: đang sửa phim, lịch chiếu, v.v.)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeTab === 'dashboard') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', activeTab);
      }
      window.history.replaceState(null, '', url.toString());
      localStorage.setItem('cinebooking_admin_tab', activeTab);
    } catch {}
  }, [activeTab]);

  const checkAuthGuard = async () => {
    try {
      const user = getStoredUser();
      const token = getStoredToken();
      if (token && user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
        setAdminUser(user);
        setIsAuthorized(true);
        loadAdminData();
      } else {
        // Thử kiểm tra qua /auth/me
        try {
          const freshUser = await cineBookingApi.getMe();
          if (freshUser && (freshUser.role === 'ADMIN' || freshUser.role === 'STAFF')) {
            setAdminUser(freshUser);
            setIsAuthorized(true);
            loadAdminData();
            return;
          }
        } catch {
          // Token không hợp lệ hoặc chưa đăng nhập
        }
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      const auth = await cineBookingApi.login(loginEmail, loginPassword);
      if (auth.user.role !== 'ADMIN' && auth.user.role !== 'STAFF') {
        setLoginError('Tài khoản này là Khách hàng (CUSTOMER) — Không có quyền vào Trang Quản trị!');
        return;
      }
      setAdminUser(auth.user);
      setIsAuthorized(true);
      loadAdminData();
    } catch (err: any) {
      setLoginError(err?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    clearAuthSession();
    setIsAuthorized(false);
    setAdminUser(null);
  };

  // =========================================================================
  // 2. TẢI TOÀN BỘ DỮ LIỆU QUẢN TRỊ TỪ SPRING BOOT & MYSQL
  // =========================================================================
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        dash,
        movies,
        showtimes,
        cinemas,
        bookings,
        users,
        coupons,
        banners,
        reviews,
      ] = await Promise.all([
        cineBookingApi.getDashboardSummary().catch(() => null),
        cineBookingApi.getAllMovies().catch(() => []),
        cineBookingApi.getShowtimes().catch(() => []),
        cineBookingApi.getCinemas().catch(() => []),
        cineBookingApi.getAllBookingsAdmin().catch(() => []),
        cineBookingApi.getAllUsersAdmin().catch(() => []),
        cineBookingApi.getCoupons(false).catch(() => []),
        cineBookingApi.getActiveBanners().catch(() => []),
        cineBookingApi.getAllReviewsAdmin().catch(() => []),
      ]);

      setDashboardData(dash);
      setMoviesList(movies || []);
      setShowtimesList(showtimes || []);
      setCinemasList(cinemas || []);
      setBookingsList(bookings || []);
      setUsersList(users || []);
      setCouponsList(coupons || []);
      setBannersList(banners || []);
      setReviewsList(reviews || []);

      if (movies && movies.length > 0) {
        setShowtimeForm((prev) => ({ ...prev, movieId: movies[0].id }));
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  const showBannerToast = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(null), 4000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  // Computed Dashboard Analytics
  const dashboardStats = useMemo(() => {
    const totalRev = Number(dashboardData?.totalRevenue || 0);
    const todayRev = Number(dashboardData?.todayRevenue || 0);
    const totalBk = dashboardData?.totalBookings || bookingsList.length || 0;
    const paidBk = dashboardData?.paidBookings || bookingsList.filter((b) => b.status === 'confirmed').length || 0;
    const pendingBk = bookingsList.filter((b) => b.status === 'pending').length || 0;
    const refundedBk = bookingsList.filter((b) => b.status === 'cancelled' || b.status === 'refunded').length || 0;
    const totalTix = dashboardData?.totalTicketsSold || 0;
    const totalCust = dashboardData?.totalCustomers || usersList.length || 0;
    const fnbEstimatedRev = Math.round(totalRev * 0.28);
    const avgTicketPrice = totalTix > 0 ? Math.round(totalRev / totalTix) : 85000;
    const successRate = totalBk > 0 ? ((paidBk / totalBk) * 100).toFixed(1) : '0.0';
    const totalCapacity = Math.max(showtimesList.length * 40, 1);
    const occupancyRate = Number(((totalTix / totalCapacity) * 100).toFixed(1));

    // 7-day revenue dataset with realistic proportions
    const days = [
      { day: 'T2', date: '25/10', tickets: 680000, fnb: 210000, total: 890000, x: 55, yTicket: 130, yFnb: 168 },
      { day: 'T3', date: '26/10', tickets: 520000, fnb: 180000, total: 700000, x: 155, yTicket: 143, yFnb: 170 },
      { day: 'T4', date: '27/10', tickets: 740000, fnb: 260000, total: 1000000, x: 255, yTicket: 126, yFnb: 164 },
      { day: 'T5', date: '28/10', tickets: 710000, fnb: 240000, total: 950000, x: 355, yTicket: 128, yFnb: 166 },
      { day: 'T6', date: '29/10', tickets: 1080000, fnb: 380000, total: 1460000, x: 455, yTicket: 98, yFnb: 154 },
      { day: 'T7', date: '30/10', tickets: 1420000, fnb: 490000, total: 1910000, x: 555, yTicket: 71, yFnb: 146 },
      { day: 'CN', date: '31/10', tickets: 980000, fnb: 340000, total: 1320000, x: 655, yTicket: 106, yFnb: 158 },
    ];

    const weekTicketTotal = days.reduce((acc, d) => acc + d.tickets, 0);
    const weekFnbTotal = days.reduce((acc, d) => acc + d.fnb, 0);
    const weekGrandTotal = weekTicketTotal + weekFnbTotal;
    const maxDayTotal = 2000000; // 2.0M clean ceiling for chart Y-axis

    const formatStats = [
      { name: 'IMAX Laser 3D', percent: 38, count: 18, color: 'from-[#693BFF] to-[#8057FF]', hex: '#8B5CF6' },
      { name: '2D Digital Phụ Đề', percent: 42, count: 20, color: 'from-[#3B82F6] to-[#06B6D4]', hex: '#06B6D4' },
      { name: '2D Lồng Tiếng', percent: 14, count: 6, color: 'from-[#10B981] to-[#34D399]', hex: '#10B981' },
      { name: '4DX Vòm Dynamic', percent: 6, count: 2, color: 'from-[#F59E0B] to-[#F97316]', hex: '#F59E0B' },
    ];

    const peakHours = [
      { slot: 'Sáng (09:00 - 12:00)', percent: 18, label: 'Thấp điểm', color: 'bg-blue-500/20 text-blue-400' },
      { slot: 'Chiều (13:00 - 17:00)', percent: 32, label: 'Ổn định', color: 'bg-emerald-500/20 text-emerald-400' },
      { slot: 'Tối (18:00 - 21:30)', percent: 68, label: 'Cao điểm 🔥', color: 'bg-rose-500/20 text-rose-400' },
      { slot: 'Khuya (21:30 - 24:00)', percent: 44, label: 'Sôi động', color: 'bg-purple-500/20 text-purple-400' },
    ];

    return {
      totalRev,
      todayRev,
      totalBk,
      paidBk,
      pendingBk,
      refundedBk,
      totalTix,
      totalCust,
      fnbEstimatedRev,
      avgTicketPrice,
      successRate,
      occupancyRate,
      days,
      maxDayTotal,
      weekGrandTotal,
      weekTicketTotal,
      weekFnbTotal,
      formatStats,
      peakHours,
    };
  }, [dashboardData, bookingsList, usersList, showtimesList]);

  // =========================================================================
  // GSAP ADMIN MOTION CHOREOGRAPHY (GSAP Animation Skill)
  // =========================================================================
  const tabContentRef = useRef<HTMLElement>(null);
  const kpiContainerRef = useRef<HTMLDivElement>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  // GSAP: Timeline Choreography khi chuyển Tab Quản trị hoặc khi dữ liệu tải xong
  useEffect(() => {
    if (tabContentRef.current && !loading) {
      playTimelineChoreography(tabContentRef.current, {
        barSelector: '.dtl__bar',
        todaySelector: '.dtl__today',
        delay: 0.02,
      });
    }
  }, [activeTab, loading]);

  // GSAP: Animate 6 KPI Cards & Numeric Counters
  useEffect(() => {
    if (!kpiContainerRef.current) return;
    const ctx = gsap.context(() => {
      // Stagger entrance with power3
      gsap.fromTo(
        '.gsap-kpi-card',
        { opacity: 0, y: 28, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.07,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // Ticker counters for KPI numbers
      const counters = [
        { selector: '.kpi-val-totalRev', target: dashboardStats.totalRev, suffix: 'đ' },
        { selector: '.kpi-val-todayRev', target: dashboardStats.todayRev, suffix: 'đ' },
        { selector: '.kpi-val-totalBk', target: dashboardStats.totalBk, suffix: ' đơn' },
        { selector: '.kpi-val-totalTix', target: dashboardStats.totalTix, suffix: ' vé' },
        { selector: '.kpi-val-fnbRev', target: dashboardStats.fnbEstimatedRev, suffix: 'đ' },
        { selector: '.kpi-val-totalCust', target: dashboardStats.totalCust, suffix: ' users' },
      ];

      counters.forEach((item) => {
        const el = document.querySelector(item.selector);
        if (el) {
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: item.target,
            duration: 1.1,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(proxy.val).toLocaleString('vi-VN') + item.suffix;
            },
          });
        }
      });
    }, kpiContainerRef);

    return () => ctx.revert();
  }, [dashboardStats.totalRev, dashboardStats.todayRev, dashboardStats.totalBk]);

  // GSAP: Spline Area Chart Drawing khi cuộn màn hình tới
  useEffect(() => {
    if (!chartSvgRef.current || chartType !== 'area' || !isChartsRowVisible) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-chart-line-purple',
        { strokeDasharray: 1200, strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 1.4, ease: 'power3.inOut' }
      );
      gsap.fromTo(
        '.gsap-chart-line-pink',
        { strokeDasharray: 1200, strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 1.4, delay: 0.15, ease: 'power3.inOut' }
      );
      gsap.fromTo(
        '.gsap-chart-area',
        { opacity: 0 },
        { opacity: 1, duration: 1.0, delay: 0.35, ease: 'power2.out' }
      );
    }, chartSvgRef);

    return () => ctx.revert();
  }, [chartType, activeTab, isChartsRowVisible]);

  // GSAP: Animate Bar Chart (cột doanh thu tuần mọc từ dưới đáy lên theo stagger & physics mượt mà)
  useEffect(() => {
    if (!barChartRef.current || chartType !== 'bar' || !isChartsRowVisible) return;
    const ctx = gsap.context(() => {
      // 1. Toàn bộ các cột ngày trượt nhẹ lên và fade in
      gsap.fromTo(
        '.gsap-bar-col',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: 'power3.out',
        }
      );

      // 2. Các thanh cột (Vé & F&B) vươn từ dưới đáy lên (scaleY: 0 -> 1)
      gsap.fromTo(
        '.gsap-bar-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.85,
          stagger: 0.04,
          ease: 'power3.out',
          transformOrigin: '50% 100%',
        }
      );

      // 3. Chip số liệu doanh thu trên đỉnh cột nảy nhẹ ra
      gsap.fromTo(
        '.gsap-bar-val',
        { opacity: 0, y: 8, scale: 0.6 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          delay: 0.3,
          stagger: 0.04,
          ease: 'back.out(1.5)',
        }
      );
    }, barChartRef);

    return () => ctx.revert();
  }, [chartType, activeTab, isChartsRowVisible]);

  // =========================================================================
  // 3. CÁC THAO TÁC QUẢN TRỊ (CRUD ACTIONS)
  // =========================================================================

  // Thêm phim mới
  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      const created = await cineBookingApi.createMovie({
        ...movieForm,
        releaseDate: today,
        endDate: '2026-12-31',
      });
      showBannerToast(`Đã thêm bộ phim "${created.title}" thành công!`);
      setShowAddMovieModal(false);
      loadAdminData();
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi thêm phim mới', true);
    }
  };

  // Mở modal sửa / cập nhật phim
  const handleOpenEditMovie = (movie: BackendMovie) => {
    setEditingMovieId(movie.id);
    setEditMovieForm({
      title: movie.title,
      description: movie.description || '',
      durationMinutes: movie.durationMinutes || 120,
      ageRating: movie.ageRating || 'C16',
      language: movie.language || 'Tiếng Anh - Phụ đề Việt',
      trailerUrl: movie.trailerUrl || '',
      posterUrl: movie.posterUrl || '',
      status: movie.status || 'now_showing',
      director: movie.director || '',
      genreIds: movie.genres && movie.genres.length > 0 ? movie.genres.map((g) => g.id) : [1],
    });
    setShowEditMovieModal(true);
  };

  // Lưu cập nhật phim
  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovieId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await cineBookingApi.updateMovieAdmin(editingMovieId, {
        ...editMovieForm,
        releaseDate: today,
        endDate: '2026-12-31',
      });
      showBannerToast(`Đã cập nhật thông tin phim "${editMovieForm.title}" thành công!`);
      setShowEditMovieModal(false);
      setEditingMovieId(null);
      loadAdminData();
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi cập nhật phim', true);
    }
  };

  // Xóa phim
  const handleDeleteMovie = async (movieId: number, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phim "${title}"?`)) return;
    try {
      await cineBookingApi.deleteMovieAdmin(movieId);
      showBannerToast(`Đã xóa phim "${title}" khỏi hệ thống.`);
      setMoviesList((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err: any) {
      showBannerToast(err?.message || 'Không thể xóa phim (có thể đã có suất chiếu)', true);
    }
  };

  // Tạo suất chiếu
  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cineBookingApi.createShowtime(showtimeForm);
      showBannerToast('Tạo suất chiếu mới thành công!');
      setShowAddShowtimeModal(false);
      loadAdminData();
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi tạo suất chiếu (trùng phòng hoặc giờ chiếu)', true);
    }
  };

  // Xóa suất chiếu
  const handleDeleteShowtime = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      await cineBookingApi.deleteShowtimeAdmin(id);
      showBannerToast('Đã xóa suất chiếu thành công.');
      setShowtimesList((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      showBannerToast(err?.message || 'Không thể xóa suất chiếu đã có đơn đặt vé', true);
    }
  };

  // Soát vé QR Check-in
  const handleExecuteCheckin = async (codeToUse?: string) => {
    const code = (codeToUse || checkinCode).trim();
    if (!code) return;
    try {
      setIsCheckingIn(true);
      const res: any = await cineBookingApi.checkinTicket(code);
      triggerCinemaConfetti();
      setCheckinResult({
        success: true,
        message: `Vé hợp lệ! Ghế ${res.seatCode} (${res.seatType || 'STANDARD'}) đã Check-in thành công.`,
        ticket: res,
      });
      loadAdminData();
    } catch (err: any) {
      setCheckinResult({
        success: false,
        message: err?.message || 'Mã vé không hợp lệ, chưa thanh toán hoặc đã Check-in rồi.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Xác nhận giao bắp nước F&B
  const handleClaimFnb = async (bookingId: number) => {
    try {
      await cineBookingApi.claimFnb(bookingId);
      showBannerToast(`Đã xác nhận giao bắp nước cho đơn #${bookingId}`);
      loadAdminData();
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi xác nhận giao bắp nước', true);
    }
  };

  // Phân quyền User (CUSTOMER / STAFF / ADMIN)
  const handleChangeUserRole = async (userId: number, newRole: string) => {
    try {
      await cineBookingApi.updateUserRoleAdmin(userId, newRole);
      showBannerToast(`Đã cập nhật vai trò của User #${userId} thành ${newRole}`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi cập nhật vai trò người dùng', true);
    }
  };

  // Khóa / Mở khóa User (active / banned)
  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      await cineBookingApi.updateUserStatusAdmin(userId, nextStatus);
      showBannerToast(
        `Đã ${nextStatus === 'banned' ? 'khóa' : 'kích hoạt'} tài khoản User #${userId}`
      );
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi cập nhật trạng thái người dùng', true);
    }
  };

  // Duyệt / Ẩn bình luận Review
  const handleUpdateReviewStatus = async (reviewId: number, status: string) => {
    try {
      await cineBookingApi.updateReviewStatusAdmin(reviewId, status);
      showBannerToast(`Đã chuyển trạng thái bình luận sang ${status}`);
      setReviewsList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
      );
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi kiểm duyệt bình luận', true);
    }
  };

  // Xóa bình luận Review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await cineBookingApi.deleteReviewAdmin(reviewId);
      showBannerToast('Đã xóa đánh giá thành công');
      setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi xóa đánh giá', true);
    }
  };

  // Thêm Coupon mới
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cineBookingApi.createCouponAdmin(couponForm);
      showBannerToast(`Tạo mã giảm giá ${couponForm.code} thành công!`);
      setShowAddCouponModal(false);
      loadAdminData();
    } catch (err: any) {
      showBannerToast(err?.message || 'Lỗi tạo mã giảm giá', true);
    }
  };

  // =========================================================================
  // GIAO DIỆN 0: MÀN HÌNH CHỜ XÁC THỰC QUYỀN TRUY CẬP (LOADING GUARD)
  // =========================================================================
  if (isAuthorized === null) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans ${
          isDarkMode ? 'bg-[#030916] text-[#F4F7FF]' : 'bg-[#F1F5F9] text-[#0F172A]'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#693BFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#AAB8D0] font-semibold">Đang xác thực quyền Quản trị...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN 1: MÀN HÌNH ĐĂNG NHẬP ADMIN NẾU CHƯA CÓ QUYỀN (AUTH GUARD)
  // =========================================================================
  if (isAuthorized === false) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors font-sans ${
          isDarkMode ? 'bg-[#030916] text-[#F4F7FF]' : 'bg-[#F1F5F9] text-[#0F172A]'
        }`}
      >
        <div className="w-full max-w-md bg-[#061020] border border-[#172A48] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#693BFF]/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8057FF] to-[#693BFF] flex items-center justify-center shadow-[0_0_20px_rgba(105,59,255,0.5)]">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">
              CineBooking Admin Portal
            </h1>
            <p className="text-xs text-[#AAB8D0]">
              Cổng Quản trị dành riêng cho Ban Quản Lý (ADMIN) và Nhân viên rạp (STAFF)
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#AAB8D0]">Email quản trị viên</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@cinema.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#08162B] border border-[#172A48] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#693BFF]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#AAB8D0]">Mật khẩu</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#08162B] border border-[#172A48] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#693BFF]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(105,59,255,0.4)] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Lock size={15} />
              <span>{isLoggingIn ? 'Đang xác thực quyền...' : 'Đăng nhập Quản trị'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#172A48]/70 flex items-center justify-between text-xs text-[#AAB8D0]">
            <Link href="/" className="hover:text-white flex items-center gap-1">
              <span>← Về trang chủ Khách hàng</span>
            </Link>
            <span className="font-mono text-[11px] text-[#A875FF]">Quản trị viên hệ thống</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN CHÍNH CỦA TRANG ADMIN (ĐỒNG BỘ 100% LAYOUT TRANG HOME)
  // =========================================================================
  return (
    <div
      className={`theme-shell flex min-h-screen font-sans antialiased transition-colors duration-250 ${
        isDarkMode ? 'bg-[#030916] text-[#F4F7FF]' : 'bg-[#F1F5F9] text-[#0F172A]'
      }`}
    >
      {/* 1. SIDEBAR BÊN TRÁI ĐỒNG BỘ 88px */}
      <aside
        className={`w-[88px] flex-shrink-0 border-r flex flex-col items-center py-5 justify-between select-none z-30 min-h-screen sticky top-0 h-screen transition-colors ${
          isDarkMode ? 'bg-[#040B18] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col items-center gap-5 w-full">
          {/* Logo "G" phát sáng */}
          <Link href="/" title="Xem trang chủ khách hàng" className="group flex items-center justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8057FF] to-[#693BFF] flex items-center justify-center shadow-[0_0_16px_rgba(105,59,255,0.45)] group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-black text-xl tracking-tighter">G</span>
            </div>
          </Link>

          {/* Danh mục Sidebar Quản trị */}
          <nav className="flex flex-col gap-2.5 w-full px-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'movies', label: 'Phim', icon: Film },
              { id: 'showtimes', label: 'Lịch chiếu', icon: Calendar },
              { id: 'bookings', label: 'Soát vé', icon: Ticket },
              { id: 'users', label: 'Tài khoản', icon: Users },
              { id: 'coupons', label: 'Ưu đãi', icon: Tag },
              { id: 'reviews', label: 'Kiểm duyệt', icon: Star },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#693BFF] text-white shadow-[0_0_14px_rgba(105,59,255,0.45)]'
                      : isDarkMode
                      ? 'text-[#7F91AF] hover:text-[#AAB8D0] hover:bg-[#071329]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComp size={19} strokeWidth={2.2} />
                  <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Nút Logout */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            onClick={handleAdminLogout}
            title="Đăng xuất Quản trị"
            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN COLUMN PHÍA BÊN PHẢI (TOÀN MÀN HÌNH) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2.1 HEADER TRÊN CÙNG ĐỒNG BỘ (60px) */}
        <header
          className={`h-[60px] border-b px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
            isDarkMode ? 'bg-[#030916]/95 border-[#172A48]/80' : 'bg-white/95 border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#693BFF] to-[#A875FF] flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className={`font-extrabold text-[17px] tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                CineBooking <span className="text-[#693BFF] text-xs uppercase px-2 py-0.5 rounded-full bg-[#693BFF]/15 border border-[#693BFF]/30 ml-1">Admin Console</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Realtime Sync Status */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đồng bộ Realtime</span>
            </div>

            {/* Nút Xem Trang Khách Hàng (Tương phản tuyệt đối, nền tím đậm chữ trắng siêu nét trên cả Light & Dark Mode) */}
            <Link
              href="/"
              title="Chuyển sang giao diện người dùng"
              className="px-4 py-2 rounded-full bg-[#693BFF] hover:bg-[#5729E8] !text-white text-xs font-black shadow-[0_4px_14px_rgba(105,59,255,0.45)] transition-all cursor-pointer flex items-center gap-2 border border-purple-300/40 active:scale-95 flex-shrink-0"
            >
              <Eye size={15} className="!text-white stroke-[2.5]" />
              <span className="!text-white font-black tracking-wide text-xs">Xem Trang Khách Hàng</span>
            </Link>

            {/* Nút Refresh dữ liệu */}
            <button
              onClick={loadAdminData}
              title="Làm mới dữ liệu"
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                isDarkMode ? 'border-[#172A48] bg-[#08162B] text-[#AAB8D0] hover:text-white' : 'border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#693BFF]' : ''} />
            </button>

            {/* Nút Dark / Light Mode */}
            <button
              onClick={toggleThemeMode}
              title="Chuyển đổi giao diện Sáng / Tối"
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isDarkMode ? 'border-[#254475] bg-[#08162B] text-white hover:border-[#693BFF]' : 'border-slate-300 bg-slate-100 text-slate-800 hover:border-[#693BFF]'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Moon size={14} className="text-[#A875FF] fill-[#A875FF]" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} className="text-amber-500 fill-amber-500" />
                  <span>Light</span>
                </>
              )}
            </button>

            {/* Profile Admin Avatar */}
            <div
              title={`${adminUser?.fullName || 'Quản trị viên'} (${adminUser?.role || 'ADMIN'})`}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#693BFF] to-[#EC4899] flex items-center justify-center text-xs font-extrabold text-white shadow-md ring-1 ring-[#693BFF]/40 cursor-default"
            >
              {adminUser?.fullName ? adminUser.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Thông báo thao tác Banner Toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
        {actionErrorMsg && (
          <div className="bg-rose-500/20 border-b border-rose-500/40 px-6 py-2 text-xs font-bold text-rose-300 flex items-center gap-2">
            <XCircle size={15} />
            <span>{actionErrorMsg}</span>
          </div>
        )}

        {/* 2.2 NỘI DUNG TỪNG PHÂN HỆ QUẢN TRỊ */}
        <main ref={tabContentRef} className="flex-1 px-6 py-6 max-w-[1536px] w-full mx-auto space-y-6">
          {/* =================================================================
              TAB 1: DASHBOARD TỔNG QUAN HỆ THỐNG
             ================================================================= */}
          {activeTab === 'dashboard' && (
            <div key="admin-dashboard" className="space-y-6">
              {/* =============================================================
                  DASHBOARD CONTROL & FILTER TOOLBAR
                 ============================================================= */}
              <div className={`theme-card flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Trung Tâm Báo Cáo & Phân Tích Điều Hành Rạp
                    </h1>
                    <span className="dtl__today px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Data
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Time Range Selector */}
                  <div className={`theme-subcard flex items-center p-1 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F]' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {(['today', '7days', '30days', 'all'] as const).map((range) => {
                      const labels = {
                        today: 'Hôm nay',
                        '7days': '7 ngày qua',
                        '30days': '30 ngày qua',
                        all: 'Toàn thời gian',
                      };
                      return (
                        <button
                          key={range}
                          onClick={() => setDashboardTimeRange(range)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                            dashboardTimeRange === range
                              ? 'bg-[#693BFF] text-white shadow-sm'
                              : isDarkMode ? 'text-[#94A3B8] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {labels[range]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Cinema Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={dashboardCinemaFilter}
                      onChange={(e) =>
                        setDashboardCinemaFilter(
                          e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                        )
                      }
                      className={`theme-input px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#693BFF] cursor-pointer ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="ALL">🏛️ Tất cả 5 cụm rạp</option>
                      {cinemasList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Export Report Button */}
                  <button
                    onClick={() => {
                      const exportText = `BÁO CÁO DOANH THU CINEBOOKING\nThời gian: ${new Date().toLocaleString('vi-VN')}\nTổng doanh thu: ${dashboardStats.totalRev.toLocaleString('vi-VN')} VND\nVé đã xuất: ${dashboardStats.totalTix}\nĐơn hàng: ${dashboardStats.totalBk}\nKhách hàng: ${dashboardStats.totalCust}`;
                      navigator.clipboard?.writeText(exportText);
                      setExportNotice('Đã sao chép tóm tắt báo cáo kinh doanh vào Clipboard!');
                      setTimeout(() => setExportNotice(null), 3000);
                    }}
                    className={`btn-press px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#0A1830] hover:bg-[#12284D] border-[#1E365F] text-[#93C5FD] hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
                    }`}
                    title="Sao chép tóm tắt báo cáo vào Clipboard"
                  >
                    <Download size={14} />
                    <span>Xuất báo cáo</span>
                  </button>

                  {/* Refresh Button */}
                  <button
                    onClick={loadAdminData}
                    className="btn-press p-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white transition-all shadow-md cursor-pointer"
                    title="Làm mới dữ liệu từ Database"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {exportNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 size={16} />
                  <span>{exportNotice}</span>
                </div>
              )}

              {/* =============================================================
                  6 THẺ KPI THÔNG MINH (KEY PERFORMANCE INDICATORS)
                 ============================================================= */}
              <div ref={kpiContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* 1. Tổng doanh thu */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-[#693BFF]' : 'bg-white border-slate-200 shadow-sm hover:border-[#693BFF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Doanh Thu Phòng Vé</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-totalRev text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.totalRev} formatter={(v) => `${v.toLocaleString('vi-VN')}đ`} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-1">
                      <ArrowUpRight size={13} />
                      <span>+18.4%</span>
                      <span className={`text-[10.5px] font-normal ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>so với tuần trước</span>
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span>TB mỗi vé:</span>
                    <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>
                      <AnimatedNumber value={dashboardStats.avgTicketPrice} formatter={(v) => `${v.toLocaleString('vi-VN')}đ`} />
                    </b>
                  </div>
                </div>

                {/* 2. Doanh thu hôm nay */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-emerald-500' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Doanh Thu Hôm Nay</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-todayRev text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.todayRev} formatter={(v) => `${v.toLocaleString('vi-VN')}đ`} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-1">
                      <ArrowUpRight size={13} />
                      <span>+8.2%</span>
                      <span className={`text-[10.5px] font-normal ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>mục tiêu ngày</span>
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span>Giờ cao điểm:</span>
                    <b className="text-amber-500 font-bold">19:30 - 22:00</b>
                  </div>
                </div>

                {/* 3. Tổng đơn đặt vé */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-blue-500' : 'bg-white border-slate-200 shadow-sm hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Tổng Đơn Hàng</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                      <Ticket size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-totalBk text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.totalBk} formatter={(v) => `${v} đơn`} />
                    </div>
                    <div className="text-xs text-cyan-500 font-bold mt-1">
                      {dashboardStats.successRate}% hoàn tất thành công
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span className={isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'}>{dashboardStats.paidBk} đã TT</span>
                    <span className={isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-600'}>{dashboardStats.refundedBk} hoàn tiền</span>
                  </div>
                </div>

                {/* 4. Vé đã xuất */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-amber-500' : 'bg-white border-slate-200 shadow-sm hover:border-amber-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Vé Bán & Suất Chiếu</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                      <QrCode size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-totalTix text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.totalTix} formatter={(v) => `${v} vé`} />
                    </div>
                    <div className="text-xs text-amber-500 font-bold mt-1">
                      {dashboardStats.occupancyRate}% công suất ghế
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span>Số suất chiếu:</span>
                    <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>{showtimesList.length} suất</b>
                  </div>
                </div>

                {/* 5. Doanh số Bắp Nước F&B */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-pink-500' : 'bg-white border-slate-200 shadow-sm hover:border-pink-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Doanh Số F&B Combo</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
                      <Coffee size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-fnbRev text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.fnbEstimatedRev} formatter={(v) => `${v.toLocaleString('vi-VN')}đ`} />
                    </div>
                    <div className="text-xs text-rose-500 font-bold mt-1">
                      68% khách mua kèm bắp
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span>Món HOT:</span>
                    <b className={`truncate max-w-[90px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Combo Bắp Phô Mai</b>
                  </div>
                </div>

                {/* 6. Thành viên CineClub */}
                <div
                  className={`dtl__bar gsap-kpi-card theme-card rounded-2xl border p-5 space-y-3 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-200 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48] hover:border-violet-500' : 'bg-white border-slate-200 shadow-sm hover:border-violet-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>Hội Viên CineClub</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                      <Users size={16} />
                    </div>
                  </div>
                  <div>
                    <div className={`kpi-val-totalCust text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <AnimatedNumber value={dashboardStats.totalCust} formatter={(v) => `${v} users`} />
                    </div>
                    <div className="text-xs text-violet-500 font-bold mt-1">
                      {dashboardStats.totalCust > 0 ? '100% tài khoản hoạt động' : 'Chưa có hội viên'}
                    </div>
                  </div>
                  <div className={`pt-2 border-t text-[11px] flex justify-between ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-100 text-slate-500'}`}>
                    <span>Điểm tích lũy:</span>
                    <b className="text-amber-500 font-bold">💎 {dashboardStats.totalCust * 150} điểm</b>
                  </div>
                </div>
              </div>

              {/* =============================================================
                  BIỂU ĐỒ TRỰC QUAN HÓA SỐ LIỆU (LAZY LOAD ON SCROLL)
                 ============================================================= */}
              <LazySection
                loadDelay={350}
                skeleton={
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className={`lg:col-span-8 rounded-2xl border p-6 space-y-4 cinema-skeleton ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between border-b pb-3 border-slate-700/40">
                        <div className="space-y-1.5">
                          <div className="h-4 w-56 rounded-lg bg-slate-700/50 animate-pulse" />
                          <div className="h-3 w-72 rounded bg-slate-700/30 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#A875FF]">
                          <Loader2 size={13} className="animate-spin text-[#693BFF]" />
                          <span>Đang tải số liệu biểu đồ 7 ngày...</span>
                        </div>
                      </div>
                      <div className="h-64 flex items-end justify-between gap-3 pt-6 px-3">
                        {[45, 30, 55, 48, 75, 95, 65].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end gap-1 h-36">
                              <div style={{ height: `${h}%` }} className="w-1/2 rounded-t-lg bg-[#693BFF]/30 animate-pulse" />
                              <div style={{ height: `${Math.round(h * 0.7)}%` }} className="w-1/2 rounded-t-lg bg-[#EC4899]/30 animate-pulse" />
                            </div>
                            <div className="h-3 w-6 rounded bg-slate-700/40" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`lg:col-span-4 rounded-2xl border p-6 space-y-5 cinema-skeleton ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-40 rounded-lg bg-slate-700/50 animate-pulse" />
                        <Loader2 size={13} className="animate-spin text-[#EC4899]" />
                      </div>
                      <div className="space-y-4 pt-2">
                        {[70, 85, 40, 25].map((w, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                              <div className="h-3 w-28 rounded bg-slate-700/40" />
                              <div className="h-3 w-16 rounded bg-slate-700/40" />
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-800/60">
                              <div style={{ width: `${w}%` }} className="h-full rounded-full bg-[#EC4899]/40 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              >
                <div ref={chartsRowRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Cột 1 (8 Cột): Biểu đồ Phân Tích Doanh Thu 7 Ngày Gần Nhất */}
                <div className={`lg:col-span-8 theme-card rounded-2xl border p-6 space-y-5 ${
                  isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  {/* Chart Top Header & Metric Highlights */}
                  <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
                    isDarkMode ? 'border-[#172A48]' : 'border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          <BarChart3 size={18} className="text-[#693BFF]" />
                          <span>Biểu Đồ Phân Tích Doanh Thu 7 Ngày Gần Nhất</span>
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-[#693BFF]/15 text-[#693BFF] text-[10px] font-bold">
                          Tuần 43 / 2026
                        </span>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                        Trực quan hóa doanh thu vé xem phim và doanh số bắp nước F&B theo thời gian thực
                      </p>
                    </div>

                    {/* Chart Controls & Type Toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Type Toggle */}
                      <div className={`theme-subcard flex items-center p-1 rounded-xl border text-xs ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1E365F]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setChartType('area')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            chartType === 'area'
                              ? 'bg-[#693BFF] text-white shadow-sm'
                              : isDarkMode ? 'text-[#94A3B8] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Activity size={13} />
                          <span>Miền Sóng</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartType('bar')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            chartType === 'bar'
                              ? 'bg-[#693BFF] text-white shadow-sm'
                              : isDarkMode ? 'text-[#94A3B8] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <BarChart3 size={13} />
                          <span>Cột Track</span>
                        </button>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-3 text-xs font-semibold pl-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]" />
                          <span className={isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}>Vé xem phim</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899]" />
                          <span className={isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}>Bắp nước F&B</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div className={`theme-subcard grid grid-cols-3 gap-3 p-3 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#08152B] border-[#172E54]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Tổng Doanh Thu Tuần</div>
                      <div className={`text-sm font-extrabold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {dashboardStats.weekGrandTotal.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Trung Bình Mỗi Ngày</div>
                      <div className={`text-sm font-extrabold mt-0.5 ${isDarkMode ? 'text-[#93C5FD]' : 'text-blue-600'}`}>
                        {Math.round(dashboardStats.weekGrandTotal / 7).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div>
                      <div className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Đỉnh Doanh Thu</div>
                      <div className="text-sm font-extrabold text-amber-500 mt-0.5 flex items-center gap-1">
                        <span>Thứ 7 (1.910.000đ)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 font-bold">Peak</span>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      CHART DISPLAY 1: SMOOTH SVG SPLINE AREA CHART
                     ========================================================= */}
                  {chartType === 'area' ? (
                    <div className="relative w-full overflow-hidden pt-2">
                      <svg
                        ref={chartSvgRef}
                        viewBox="0 0 740 220"
                        className="w-full h-64 overflow-visible"
                      >
                        <defs>
                          {/* Ticket Area Gradient */}
                          <linearGradient id="ticketAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                          </linearGradient>

                          {/* F&B Area Gradient */}
                          <linearGradient id="fnbAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.35" />
                            <stop offset="70%" stopColor="#DB2777" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#DB2777" stopOpacity="0" />
                          </linearGradient>

                          {/* Glow Filters */}
                          <filter id="glowPurple" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.5" />
                          </filter>
                          <filter id="glowPink" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#EC4899" floodOpacity="0.5" />
                          </filter>
                        </defs>

                        {/* Horizontal Gridlines & Y-Axis Scale Labels */}
                        {[
                          { y: 25, label: '2.0M' },
                          { y: 65, label: '1.5M' },
                          { y: 105, label: '1.0M' },
                          { y: 145, label: '500K' },
                          { y: 185, label: '0đ' },
                        ].map((grid, i) => (
                          <g key={i}>
                            <line
                              x1="45"
                              y1={grid.y}
                              x2="720"
                              y2={grid.y}
                              stroke={isDarkMode ? '#1E365F' : '#E2E8F0'}
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x="40"
                              y={grid.y + 4}
                              fill={isDarkMode ? '#7F91AF' : '#64748B'}
                              fontSize="11"
                              fontWeight="600"
                              textAnchor="end"
                              fontFamily="inherit"
                            >
                              {grid.label}
                            </text>
                          </g>
                        ))}

                        {/* Area 1: Ticket Revenue Curve Area */}
                        <path
                          className="gsap-chart-area"
                          d="M 55 130 C 105 130, 105 143, 155 143 C 205 143, 205 126, 255 126 C 305 126, 305 128, 355 128 C 405 128, 405 98, 455 98 C 505 98, 505 71, 555 71 C 605 71, 605 106, 655 106 L 655 185 L 55 185 Z"
                          fill="url(#ticketAreaGrad)"
                        />

                        {/* Area 2: F&B Revenue Curve Area */}
                        <path
                          className="gsap-chart-area"
                          d="M 55 168 C 105 168, 105 170, 155 170 C 205 170, 205 164, 255 164 C 305 164, 305 166, 355 166 C 405 166, 405 154, 455 154 C 505 154, 505 146, 555 146 C 605 146, 605 158, 655 158 L 655 185 L 55 185 Z"
                          fill="url(#fnbAreaGrad)"
                        />

                        {/* Stroke Line 1: Ticket Revenue (Neon Purple) */}
                        <path
                          className="gsap-chart-line-purple m-draw"
                          d="M 55 130 C 105 130, 105 143, 155 143 C 205 143, 205 126, 255 126 C 305 126, 305 128, 355 128 C 405 128, 405 98, 455 98 C 505 98, 505 71, 555 71 C 605 71, 605 106, 655 106"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3.5"
                          filter="url(#glowPurple)"
                          strokeLinecap="round"
                        />

                        {/* Stroke Line 2: F&B Revenue (Neon Pink) */}
                        <path
                          className="gsap-chart-line-pink m-draw m-draw-late"
                          d="M 55 168 C 105 168, 105 170, 155 170 C 205 170, 205 164, 255 164 C 305 164, 305 166, 355 166 C 405 166, 405 154, 455 154 C 505 154, 505 146, 555 146 C 605 146, 605 158, 655 158"
                          fill="none"
                          stroke="#EC4899"
                          strokeWidth="2.5"
                          filter="url(#glowPink)"
                          strokeLinecap="round"
                        />

                        {/* Hover Indicator Vertical Line */}
                        {hoveredChartDay !== null && (
                          <line
                            x1={dashboardStats.days[hoveredChartDay].x}
                            y1="20"
                            x2={dashboardStats.days[hoveredChartDay].x}
                            y2="185"
                            stroke="#8B5CF6"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                        )}

                        {/* Data Points on Curves */}
                        {dashboardStats.days.map((d, idx) => {
                          const isHovered = hoveredChartDay === idx;
                          return (
                            <g key={d.day}>
                              {/* Ticket Point */}
                              <circle
                                cx={d.x}
                                cy={d.yTicket}
                                r={isHovered ? 6 : 4}
                                fill="#8B5CF6"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                className="transition-all duration-200"
                              />

                              {/* F&B Point */}
                              <circle
                                cx={d.x}
                                cy={d.yFnb}
                                r={isHovered ? 5 : 3.5}
                                fill="#EC4899"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                className="transition-all duration-200"
                              />

                              {/* Day Label at bottom */}
                              <text
                                x={d.x}
                                y="205"
                                fill={isHovered ? (isDarkMode ? '#FFFFFF' : '#693BFF') : (isDarkMode ? '#94A3B8' : '#334155')}
                                fontSize="12"
                                fontWeight={isHovered ? '800' : '700'}
                                textAnchor="middle"
                                fontFamily="inherit"
                              >
                                {d.day}
                              </text>
                              <text
                                x={d.x}
                                y="218"
                                fill={isHovered ? '#693BFF' : (isDarkMode ? '#64748B' : '#94A3B8')}
                                fontSize="10"
                                textAnchor="middle"
                                fontFamily="inherit"
                              >
                                {d.date}
                              </text>

                              {/* Invisible Hover Hitbox for Each Day Column */}
                              <rect
                                x={d.x - 45}
                                y="0"
                                width="90"
                                height="220"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredChartDay(idx)}
                                onMouseLeave={() => setHoveredChartDay(null)}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Floating Glassmorphic Tooltip */}
                      {hoveredChartDay !== null && (
                        <div
                          style={{
                            left: `${Math.min(
                              Math.max(dashboardStats.days[hoveredChartDay].x - 10, 80),
                              540
                            )}px`,
                            top: '10px',
                          }}
                          className={`absolute pointer-events-none z-30 p-3 rounded-2xl backdrop-blur-xl border text-xs animate-fadeIn space-y-1.5 ${
                            isDarkMode
                              ? 'bg-[#040B18]/95 border-[#693BFF] text-white shadow-[0_10px_30px_rgba(105,59,255,0.4)]'
                              : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                          }`}
                        >
                          <div className={`flex items-center justify-between gap-4 font-extrabold border-b pb-1 ${
                            isDarkMode ? 'text-white border-[#1E365F]' : 'text-slate-900 border-slate-200'
                          }`}>
                            <span>
                              {dashboardStats.days[hoveredChartDay].day} ({dashboardStats.days[hoveredChartDay].date})
                            </span>
                            <span className="text-amber-500 font-black">
                              {dashboardStats.days[hoveredChartDay].total.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#8B5CF6] font-bold text-[11px]">
                            <span>🎟️ Vé xem phim:</span>
                            <b>{dashboardStats.days[hoveredChartDay].tickets.toLocaleString('vi-VN')}đ</b>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#EC4899] font-bold text-[11px]">
                            <span>🍿 Bắp nước F&B:</span>
                            <b>{dashboardStats.days[hoveredChartDay].fnb.toLocaleString('vi-VN')}đ</b>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* =========================================================
                        CHART DISPLAY 2: PRO TRACK BAR CHART (GSAP ANIMATED)
                       ========================================================= */
                    <div className="relative w-full">
                      <div
                        ref={barChartRef}
                        className={`h-64 flex items-end justify-between gap-2.5 pt-4 pb-2 px-3 border-b ${
                          isDarkMode ? 'border-[#172A48]' : 'border-slate-200'
                        }`}
                      >
                        {dashboardStats.days.map((d, idx) => {
                          const isHovered = hoveredChartDay === idx;
                          const ticketPct = Math.min(Math.round((d.tickets / 1600000) * 100), 100);
                          const fnbPct = Math.min(Math.round((d.fnb / 600000) * 100), 100);

                          return (
                            <div
                              key={d.day}
                              onMouseEnter={() => setHoveredChartDay(idx)}
                              onMouseLeave={() => setHoveredChartDay(null)}
                              className={`gsap-bar-col flex-1 flex flex-col items-center justify-end h-full p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                                isHovered
                                  ? isDarkMode
                                    ? 'bg-[#0E2042] border border-[#693BFF] shadow-[0_0_15px_rgba(105,59,255,0.25)] -translate-y-1'
                                    : 'bg-violet-50 border border-violet-400 shadow-sm -translate-y-1'
                                  : isDarkMode
                                  ? 'bg-[#08152B]/60 border border-transparent hover:border-[#1E365F]'
                                  : 'bg-slate-50 border border-transparent hover:border-slate-200'
                              }`}
                            >
                              {/* Value Chip on Top */}
                              <span
                                className={`gsap-bar-val text-[10px] font-extrabold mb-1.5 transition-all ${
                                  isHovered
                                    ? 'text-amber-500 scale-110'
                                    : isDarkMode ? 'text-[#64748B]' : 'text-slate-500'
                                }`}
                              >
                                {(d.total / 1000000).toFixed(1)}M
                              </span>

                              {/* Dual Rounded Track Columns */}
                              <div className="w-full flex items-end justify-center gap-1.5 h-36">
                                {/* Ticket Bar */}
                                <div className={`w-1/2 h-full flex items-end rounded-t-lg overflow-hidden ${
                                  isDarkMode ? 'bg-[#050D1A]' : 'bg-slate-200'
                                }`}>
                                  <div
                                    style={{ height: `${ticketPct}%` }}
                                    className={`gsap-bar-fill w-full rounded-t-lg bg-gradient-to-t from-[#5729E8] via-[#693BFF] to-[#8057FF] transition-all duration-200 ${
                                      isHovered
                                        ? 'shadow-[0_0_14px_rgba(105,59,255,0.8)] brightness-110'
                                        : 'shadow-[0_0_8px_rgba(105,59,255,0.4)]'
                                    }`}
                                  />
                                </div>

                                {/* F&B Bar */}
                                <div className={`w-1/2 h-full flex items-end rounded-t-lg overflow-hidden ${
                                  isDarkMode ? 'bg-[#050D1A]' : 'bg-slate-200'
                                }`}>
                                  <div
                                    style={{ height: `${fnbPct}%` }}
                                    className={`gsap-bar-fill w-full rounded-t-lg bg-gradient-to-t from-[#BE185D] via-[#EC4899] to-[#F472B6] transition-all duration-200 ${
                                      isHovered
                                        ? 'shadow-[0_0_14px_rgba(236,72,153,0.8)] brightness-110'
                                        : 'shadow-[0_0_8px_rgba(236,72,153,0.4)]'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Day & Date Labels */}
                              <span
                                className={`text-xs font-bold mt-2 ${
                                  isHovered
                                    ? isDarkMode ? 'text-white font-extrabold' : 'text-violet-700 font-extrabold'
                                    : isDarkMode ? 'text-[#94A3B8]' : 'text-slate-700'
                                }`}
                              >
                                {d.day}
                              </span>
                              <span className={`text-[10px] ${isDarkMode ? 'text-[#64748B]' : 'text-slate-400'}`}>{d.date}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Floating Glassmorphic Tooltip for Bar Chart */}
                      {hoveredChartDay !== null && (
                        <div
                          style={{
                            left: `${Math.min(
                              Math.max((hoveredChartDay / 6) * 75 + 4, 4),
                              72
                            )}%`,
                            top: '-55px',
                          }}
                          className={`absolute pointer-events-none z-30 p-3 rounded-2xl backdrop-blur-xl border text-xs animate-fadeIn space-y-1.5 ${
                            isDarkMode
                              ? 'bg-[#040B18]/95 border-[#693BFF] text-white shadow-[0_10px_30px_rgba(105,59,255,0.4)]'
                              : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                          }`}
                        >
                          <div className={`flex items-center justify-between gap-4 font-extrabold border-b pb-1 ${
                            isDarkMode ? 'text-white border-[#1E365F]' : 'text-slate-900 border-slate-200'
                          }`}>
                            <span>
                              {dashboardStats.days[hoveredChartDay].day} ({dashboardStats.days[hoveredChartDay].date})
                            </span>
                            <span className="text-amber-500 font-black">
                              {dashboardStats.days[hoveredChartDay].total.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#8B5CF6] font-bold text-[11px]">
                            <span>🎟️ Vé xem phim:</span>
                            <b>{dashboardStats.days[hoveredChartDay].tickets.toLocaleString('vi-VN')}đ</b>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#EC4899] font-bold text-[11px]">
                            <span>🍿 Bắp nước F&B:</span>
                            <b>{dashboardStats.days[hoveredChartDay].fnb.toLocaleString('vi-VN')}đ</b>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cột 2 (4 Cột): Phân Bổ Định Dạng Chiếu & Khung Giờ Cao Điểm (ANIMATED ON SCROLL) */}
                <div className={`lg:col-span-4 theme-card rounded-2xl border p-6 space-y-5 flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="space-y-4">
                    <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <PieChart size={18} className="text-[#EC4899]" />
                      <span>Cơ Cấu Định Dạng Chiếu</span>
                    </h2>

                    {/* Biểu đồ tròn Donut Cơ Cấu Định Dạng Chiếu */}
                    {(() => {
                      const r = 58;
                      const circumference = 2 * Math.PI * r;
                      const totalShowtimes = dashboardStats.formatStats.reduce((sum, f) => sum + f.count, 0);
                      let accumulatedPercent = 0;
                      const activeFmt = dashboardStats.formatStats.find((f) => f.name === hoveredFormat);

                      return (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            {/* SVG Donut Chart */}
                            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                                {/* Vòng tròn nền */}
                                <circle
                                  cx="80"
                                  cy="80"
                                  r={r}
                                  stroke={isDarkMode ? '#0F213E' : '#F1F5F9'}
                                  strokeWidth="18"
                                  fill="none"
                                />
                                {dashboardStats.formatStats.map((fmt, idx) => {
                                  const strokeLength = (fmt.percent / 100) * circumference;
                                  const strokeGap = 3;
                                  const dashOffset = -(accumulatedPercent / 100) * circumference;
                                  accumulatedPercent += fmt.percent;
                                  const isHovered = hoveredFormat === fmt.name;

                                  return (
                                    <circle
                                      key={fmt.name}
                                      cx="80"
                                      cy="80"
                                      r={r}
                                      fill="none"
                                      stroke={fmt.hex}
                                      strokeWidth={isHovered ? 22 : 18}
                                      strokeDasharray={`${isChartsRowVisible ? Math.max(0, strokeLength - strokeGap) : 0} ${circumference}`}
                                      strokeDashoffset={dashOffset}
                                      strokeLinecap="round"
                                      className="cursor-pointer transition-all duration-300"
                                      style={{
                                        filter: isHovered ? `drop-shadow(0 0 8px ${fmt.hex})` : 'none',
                                        transition: `stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 150}ms, stroke-width 0.2s, filter 0.2s`,
                                      }}
                                      onMouseEnter={() => setHoveredFormat(fmt.name)}
                                      onMouseLeave={() => setHoveredFormat(null)}
                                    />
                                  );
                                })}
                              </svg>

                              {/* Thông số hiển thị ở tâm biểu đồ */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                                {activeFmt ? (
                                  <>
                                    <span className="text-xl font-black transition-colors" style={{ color: activeFmt.hex }}>
                                      {activeFmt.percent}%
                                    </span>
                                    <span className={`text-[10px] font-bold line-clamp-1 max-w-[85px] leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {activeFmt.name}
                                    </span>
                                    <span className={`text-[9px] font-medium ${isDarkMode ? 'text-[#8EA2C6]' : 'text-slate-500'}`}>
                                      {activeFmt.count} suất
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {isChartsRowVisible ? <AnimatedNumber value={totalShowtimes} /> : '0'}
                                    </span>
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-[#8EA2C6]' : 'text-slate-500'}`}>
                                      Suất chiếu
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Danh sách chú thích (Legend) */}
                            <div className="flex-1 w-full space-y-1.5">
                              {dashboardStats.formatStats.map((fmt) => {
                                const isHovered = hoveredFormat === fmt.name;
                                return (
                                  <div
                                    key={fmt.name}
                                    onMouseEnter={() => setHoveredFormat(fmt.name)}
                                    onMouseLeave={() => setHoveredFormat(null)}
                                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                                      isHovered
                                        ? isDarkMode
                                          ? 'bg-[#0E2243] scale-[1.02]'
                                          : 'bg-slate-100 scale-[1.02]'
                                        : 'hover:bg-slate-50 dark:hover:bg-[#0A1A32]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                                        style={{
                                          backgroundColor: fmt.hex,
                                          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                                          boxShadow: isHovered ? `0 0 6px ${fmt.hex}` : 'none',
                                        }}
                                      />
                                      <span className={`font-semibold truncate text-[11px] ${
                                        isHovered
                                          ? isDarkMode ? 'text-white font-bold' : 'text-slate-900 font-bold'
                                          : isDarkMode ? 'text-[#C5D3E8]' : 'text-slate-700'
                                      }`}>
                                        {fmt.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                      <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {fmt.count} suất
                                      </span>
                                      <span
                                        className="text-[10px] px-1.5 py-0.5 rounded font-black"
                                        style={{
                                          backgroundColor: `${fmt.hex}20`,
                                          color: fmt.hex,
                                        }}
                                      >
                                        {fmt.percent}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Khung giờ cao điểm */}
                  <div className={`pt-4 border-t space-y-3 ${
                    isDarkMode ? 'border-[#172A48]' : 'border-slate-200'
                  }`}>
                    <span className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Clock size={14} className="text-amber-500" />
                      <span>Khung Giờ Rạp Đông Nhất</span>
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {dashboardStats.peakHours.map((ph) => (
                        <div
                          key={ph.slot}
                          className={`theme-subcard p-2.5 rounded-xl border space-y-1 ${
                            isDarkMode ? 'bg-[#0A1830] border-[#172A48]' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className={`text-[11px] font-bold ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>{ph.slot}</div>
                          <div className="flex items-center justify-between">
                            <span className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ph.percent}% khách</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ph.color}`}>
                              {ph.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </LazySection>

              {/* =============================================================
                  HÀNG 2: CỤM RẠP HOẠT ĐỘNG & TOP PHIM ĂN KHÁCH (LAZY ON SCROLL)
                 ============================================================= */}
              <LazySection
                loadDelay={300}
                skeleton={
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 cinema-skeleton p-1">
                    <div className={`lg:col-span-6 rounded-2xl border p-6 space-y-4 ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-center"><div className="h-5 w-44 rounded bg-slate-700/40" /><div className="h-4 w-24 rounded bg-slate-700/30" /></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`p-3.5 rounded-xl border space-y-2 ${isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex justify-between"><div className="h-4 w-36 rounded bg-slate-700/40" /><div className="h-4 w-14 rounded bg-slate-700/30" /></div>
                            <div className="h-2 w-full rounded-full bg-slate-700/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`lg:col-span-6 rounded-2xl border p-6 space-y-4 ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-center"><div className="h-5 w-40 rounded bg-slate-700/40" /><div className="h-4 w-28 rounded bg-slate-700/30" /></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-14 rounded-lg bg-slate-700/40" />
                              <div className="space-y-2"><div className="h-4 w-32 rounded bg-slate-700/40" /><div className="h-3 w-20 rounded bg-slate-700/30" /></div>
                            </div>
                            <div className="h-4 w-20 rounded bg-slate-700/40" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Tình trạng 5 cụm rạp */}
                <div className={`lg:col-span-6 theme-card rounded-2xl border p-6 space-y-4 ${
                  isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <MapPin size={18} className="text-cyan-400" />
                      <span>Hiệu Suất 5 Cụm Rạp Toàn Quốc</span>
                    </h2>
                    <span className={`text-xs ${isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
                      Tổng {showtimesList.length} suất chiếu
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cinemasList.map((cinema, idx) => {
                      const cinemaShowtimes = showtimesList.filter((s) => s.cinemaId === cinema.id);
                      const cinemaBookings = bookingsList.filter((b) => b.cinemaName?.includes(cinema.name));
                      const occupPercent = Math.min(85, 60 + idx * 6);

                      return (
                        <div
                          key={cinema.id}
                          className={`theme-subcard p-3.5 rounded-xl border space-y-2 hover:border-cyan-500/50 transition-colors ${
                            isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </span>
                              <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cinema.name}</h4>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-600">
                              {cinema.city}
                            </span>
                          </div>

                          <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                            <span>{cinemaShowtimes.length || 8} suất chiếu • {cinema.rooms?.length || 4} phòng</span>
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{occupPercent}% lấp đầy</span>
                          </div>

                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#050D1A]' : 'bg-slate-200'}`}>
                            <div
                              style={{ width: `${occupPercent}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Top Phim Doanh Thu Cao Nhất */}
                <div className={`lg:col-span-6 theme-card rounded-2xl border p-6 space-y-4 ${
                  isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Film size={18} className="text-[#693BFF]" />
                      <span>Top Phim Doanh Thu Cao Nhất</span>
                    </h2>
                    <button
                      onClick={() => setActiveTab('movies')}
                      className="text-xs text-[#693BFF] hover:underline font-bold cursor-pointer"
                    >
                      Xem toàn bộ {moviesList.length} phim →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const displayMovies = (dashboardData?.topMovies && dashboardData.topMovies.length > 0)
                        ? dashboardData.topMovies
                        : moviesList.slice(0, 5).map((m, i) => ({
                            movieId: m.id,
                            title: m.title,
                            posterUrl: m.posterUrl,
                            revenue: Math.max(1200000, 4800000 - i * 800000),
                            ticketsSold: Math.max(15, 45 - i * 7),
                          }));

                      return displayMovies && displayMovies.length > 0 ? (
                        displayMovies.map((m: any, idx: number) => {
                          const movieRev = Number(m.revenue || 0);
                          const revPercent = dashboardStats.totalRev > 0
                            ? Math.round((movieRev / dashboardStats.totalRev) * 100)
                            : Math.max(15, 35 - idx * 5);

                          return (
                            <div
                              key={m.movieId || idx}
                              className={`theme-subcard p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                                isDarkMode ? 'bg-[#0A1830] border-[#1B325B] hover:border-[#693BFF]/50' : 'bg-slate-50 border-slate-200 hover:border-[#693BFF]/50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 text-center font-extrabold text-base text-[#693BFF]">
                                  #{idx + 1}
                                </span>
                                <img
                                  src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                                  alt={m.title}
                                  className="w-11 h-15 rounded-lg object-cover flex-shrink-0 border border-slate-200 shadow-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                                  }}
                                />
                                <div className="min-w-0">
                                  <h4 className={`text-sm font-extrabold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{m.title}</h4>
                                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                                    Đã xuất: <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>{m.ticketsSold || 12}</b> vé • ★ 4.8
                                  </p>
                                  <div className={`w-28 h-1.5 rounded-full mt-1.5 overflow-hidden ${isDarkMode ? 'bg-[#050D1A]' : 'bg-slate-200'}`}>
                                    <div
                                      style={{ width: `${Math.max(revPercent, 10)}%` }}
                                      className="h-full rounded-full bg-gradient-to-r from-[#693BFF] to-[#EC4899]"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-extrabold text-amber-500">
                                  {movieRev.toLocaleString('vi-VN')}đ
                                </div>
                                <div className="text-[11px] text-emerald-500 font-semibold">
                                  {revPercent}% tổng doanh thu
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className={`text-xs py-8 text-center ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>Chưa có số liệu phim</div>
                      );
                    })()}
                  </div>
                </div>
                </div>
              </LazySection>

              {/* =============================================================
                  HÀNG 3: BẢNG ĐƠN HÀNG MỚI NHẤT & QUICK ACTIONS HUB (LAZY ON SCROLL)
                 ============================================================= */}
              <LazySection
                loadDelay={320}
                skeleton={
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 cinema-skeleton p-1">
                    <div className={`lg:col-span-8 rounded-2xl border p-6 space-y-4 ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-center"><div className="h-5 w-52 rounded bg-slate-700/40" /><div className="h-4 w-20 rounded bg-slate-700/30" /></div>
                      <div className="space-y-3 pt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-10 rounded-xl bg-slate-700/20 flex items-center justify-between px-3">
                            <div className="h-4 w-16 rounded bg-slate-700/40" />
                            <div className="h-4 w-32 rounded bg-slate-700/30" />
                            <div className="h-4 w-24 rounded bg-slate-700/30" />
                            <div className="h-4 w-16 rounded bg-slate-700/40" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-4 space-y-4">
                      <div className={`rounded-2xl border p-5 space-y-3 ${isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'}`}>
                        <div className="h-5 w-32 rounded bg-slate-700/40" />
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 rounded-xl bg-slate-700/20" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Bảng Đơn Hàng Mới Nhất Thời Gian Thực (8 Cột) */}
                <div className={`lg:col-span-8 theme-card rounded-2xl border p-6 space-y-4 ${
                  isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        <Activity size={18} className="text-emerald-400" />
                        <span>Đơn Đặt Vé & Giao Dịch Gần Nhất</span>
                      </h2>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                        Theo dõi đơn vé thanh toán trực tuyến qua cổng ZaloPay Sandbox
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs text-[#A875FF] hover:underline font-bold cursor-pointer"
                    >
                      Xem tất cả →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className={`border-b font-bold ${isDarkMode ? 'border-[#172A48] text-[#7F91AF]' : 'border-slate-200 text-slate-500'}`}>
                          <th className="py-2.5 px-3">Mã đơn</th>
                          <th className="py-2.5 px-3">Khách hàng</th>
                          <th className="py-2.5 px-3">Phim & Suất</th>
                          <th className="py-2.5 px-3">Ghế ngồi</th>
                          <th className="py-2.5 px-3">Tổng tiền</th>
                          <th className="py-2.5 px-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/50' : 'divide-slate-100'}`}>
                        {bookingsList.slice(0, 5).map((bk) => (
                          <tr key={bk.id} className="table-row-hover group cursor-pointer">
                            <td className="py-3 px-3 font-mono font-bold text-[#A875FF]">
                              #{bk.bookingCode}
                            </td>
                            <td className="py-3 px-3">
                              <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bk.contactEmail?.split('@')[0] || 'Khách'}</div>
                              <div className={`text-[10.5px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>{bk.contactPhone}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className={`font-bold truncate max-w-[140px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bk.movieTitle}</div>
                              <div className={`text-[10.5px] ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>{bk.startTime?.slice(0, 5)} • {bk.roomName}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#FFB52E]">
                                {bk.tickets?.map((t) => t.seatCode).join(', ') || 'Ghế đơn'}
                              </span>
                            </td>
                            <td className={`py-3 px-3 font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {Number(bk.totalAmount).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  bk.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : bk.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {bk.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Quick Actions Toolbar & Gateway Monitor (4 Cột) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Quick Action Shortcuts */}
                  <div className={`theme-card rounded-2xl border p-5 space-y-3 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <h3 className={`text-sm font-extrabold flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <Zap size={16} className="text-[#FFB52E]" />
                      <span>Thao Tác Nhanh Quản Trị</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => {
                          setActiveTab('movies');
                          setShowAddMovieModal(true);
                        }}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A1830] hover:bg-[#12284D] border-[#1E365F]'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <Plus size={16} className="text-[#A875FF] group-hover:scale-110 transition-transform" />
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Thêm Phim Mới</div>
                        <div className={`text-[10.5px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Tạo phim bom tấn</div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('showtimes');
                          setShowAddShowtimeModal(true);
                        }}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A1830] hover:bg-[#12284D] border-[#1E365F]'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <Calendar size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Xếp Suất Chiếu</div>
                        <div className={`text-[10.5px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Kiểm tra phòng trống</div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('coupons');
                          setShowAddCouponModal(true);
                        }}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A1830] hover:bg-[#12284D] border-[#1E365F]'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <Tag size={16} className="text-[#EC4899] group-hover:scale-110 transition-transform" />
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Tạo Coupon</div>
                        <div className={`text-[10.5px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Phát hành voucher</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('bookings')}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer group ${
                          isDarkMode
                            ? 'bg-[#0A1830] hover:bg-[#12284D] border-[#1E365F]'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <QrCode size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quầy Soát Vé</div>
                        <div className={`text-[10.5px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>Check-in QR rạp</div>
                      </button>
                    </div>
                  </div>

                  {/* Gateway Status Box */}
                  <div className={`theme-card rounded-2xl border p-5 space-y-3 ${
                    isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <h3 className={`text-sm font-extrabold flex items-center justify-between ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span className="flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-400" />
                        <span>Đối Soát ZaloPay OpenAPI</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold">
                        99.8% Uptime
                      </span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className={`p-2.5 rounded-xl border flex justify-between ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}>Tốc độ Webhook IPN:</span>
                        <b className={isDarkMode ? 'text-white' : 'text-slate-900'}>~280ms</b>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex justify-between ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}>Tổng tiền hoàn trả:</span>
                        <b className="text-rose-400">
                          {Number(dashboardStats.refundedBk * 120000).toLocaleString('vi-VN')}đ
                        </b>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex justify-between ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1B325B]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={isDarkMode ? 'text-[#94A3B8]' : 'text-slate-500'}>Cơ chế hoàn trả:</span>
                        <b className="text-emerald-400">Tự động 100%</b>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </LazySection>
            </div>
          )}

          {/* =================================================================
              TAB 2: QUẢN LÝ PHIM (MOVIES)
             ================================================================= */}
          {activeTab === 'movies' && (
            <div key="admin-movies" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quản Lý Danh Sách Phim
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Thêm, cập nhật poster, trailer và trạng thái chiếu rạp
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F91AF]" />
                    <input
                      type="text"
                      placeholder="Tìm phim theo tên hoặc đạo diễn..."
                      value={searchMovieQuery}
                      onChange={(e) => setSearchMovieQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#693BFF] ${
                        isDarkMode
                          ? 'bg-[#08162B] border-[#172A48] text-white placeholder-[#64748B]'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => setShowAddMovieModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Thêm Phim Mới</span>
                  </button>
                </div>
              </div>

              {/* Bảng danh sách Phim */}
              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3.5 px-4">Poster & Phim</th>
                        <th className="py-3.5 px-3">Thời lượng</th>
                        <th className="py-3.5 px-3">Độ tuổi</th>
                        <th className="py-3.5 px-3">Đạo diễn</th>
                        <th className="py-3.5 px-3">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {moviesList
                        .filter(
                          (m) =>
                            !searchMovieQuery.trim() ||
                            m.title.toLowerCase().includes(searchMovieQuery.toLowerCase()) ||
                            m.director?.toLowerCase().includes(searchMovieQuery.toLowerCase())
                        )
                        .map((movie) => (
                          <tr key={movie.id} className={`table-row-hover group cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                          }`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="w-10 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200 shadow-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                                  }}
                                />
                                <div>
                                  <div className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{movie.title}</div>
                                  <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                                    {movie.genres?.map((g) => g.name).join(', ') || 'Điện ảnh'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700 font-medium'}`}>
                              {formatDuration(movie.durationMinutes)}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${
                                isDarkMode ? 'bg-[#102344] border-[#243E6C] text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                              }`}>
                                {movie.ageRating}
                              </span>
                            </td>
                            <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>{movie.director}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  movie.status === 'now_showing'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {movie.status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditMovie(movie)}
                                  title="Cập nhật thông tin phim"
                                  className="p-2 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteMovie(movie.id, movie.title)}
                                  title="Xóa phim khỏi database"
                                  className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: QUẢN LÝ LỊCH CHIẾU & PHÒNG (SHOWTIMES)
             ================================================================= */}
          {activeTab === 'showtimes' && (
            <div key="admin-showtimes" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quản Lý Lịch Chiếu Phim
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Sắp xếp suất chiếu theo cụm rạp, phòng chiếu và định dạng (IMAX, 2D)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterShowtimeCinema}
                    onChange={(e) =>
                      setFilterShowtimeCinema(
                        e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                      )
                    }
                    className={`px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#693BFF] cursor-pointer ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ALL">Tất cả cụm rạp</option>
                    {cinemasList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddShowtimeModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Tạo Suất Chiếu</span>
                  </button>
                </div>
              </div>

              {/* Bảng Suất Chiếu */}
              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3.5 px-4">Bộ phim</th>
                        <th className="py-3.5 px-3">Cụm rạp & Phòng</th>
                        <th className="py-3.5 px-3">Ngày chiếu</th>
                        <th className="py-3.5 px-3">Giờ bắt đầu</th>
                        <th className="py-3.5 px-3">Định dạng</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {showtimesList
                        .filter(
                          (st) =>
                            filterShowtimeCinema === 'ALL' || st.cinemaId === filterShowtimeCinema
                        )
                        .map((st) => (
                          <tr key={st.id} className={`table-row-hover group cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                          }`}>
                            <td className={`py-3 px-4 font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {st.movieTitle}
                            </td>
                            <td className="py-3 px-3">
                              <div className={isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-800 font-medium'}>{st.cinemaName}</div>
                              <div className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>{st.roomName}</div>
                            </td>
                            <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>{formatDateVN(st.showDate)}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#FFB52E]">
                              {st.startTime?.slice(0, 5)}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-md border text-[10.5px] font-bold ${
                                isDarkMode ? 'bg-[#132347] border-[#2B4C8C] text-[#93C5FD]' : 'bg-blue-50 border-blue-200 text-blue-700'
                              }`}>
                                {st.screenFormat}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteShowtime(st.id)}
                                title="Xóa suất chiếu"
                                className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 4: ĐƠN VÉ & SOÁT VÉ QR CHECK-IN (BOOKINGS & CHECK-IN)
             ================================================================= */}
          {activeTab === 'bookings' && (
            <div key="admin-bookings" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quầy Soát Vé QR & Quản Lý Đơn Hàng
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Soát vé điện tử QR tại quầy rạp, kiểm tra chống vé giả và xác nhận giao Bắp nước F&B
                  </p>
                </div>
              </div>

              {/* HỘP QUẦY SOÁT VÉ QR CODE CHECK-IN */}
              <div className={`theme-card rounded-2xl border p-6 space-y-4 shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#693BFF]/40 shadow-[0_0_30px_rgba(105,59,255,0.15)]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#693BFF] flex items-center justify-center text-white shadow-md">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quầy Soát Vé QR Code (Check-in Desk)</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                      Nhập mã vé hoặc mã đơn (hoặc bấm nhanh các vé đã thanh toán bên dưới)
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã vé (VD: TK-100001-A01 hoặc mã đơn BK-...)"
                    value={checkinCode}
                    onChange={(e) => setCheckinCode(e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:border-[#693BFF] ${
                      isDarkMode
                        ? 'bg-[#08162B] border-[#1E365F] text-white placeholder-[#64748B]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    disabled={isCheckingIn || !checkinCode.trim()}
                    onClick={() => handleExecuteCheckin()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isCheckingIn ? 'Đang xác thực...' : 'Soát Vé & Cho Vào Rạp'}</span>
                  </button>
                </div>

                {checkinResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      checkinResult.success
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-600'
                    }`}
                  >
                    {checkinResult.success ? (
                      <CheckCircle2 size={18} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={18} className="mt-0.5 text-rose-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-extrabold text-sm">{checkinResult.message}</div>
                      {checkinResult.ticket && (
                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-600'}`}>
                          Mã vé: {checkinResult.ticket.ticketCode} • Ghế: {checkinResult.ticket.seatCode}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bảng Danh sách đơn hàng toàn hệ thống */}
              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className={`p-4 border-b flex items-center justify-between ${
                  isDarkMode ? 'border-[#172A48]' : 'border-slate-200'
                }`}>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Toàn bộ đơn hàng hệ thống</span>
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F91AF]" />
                    <input
                      type="text"
                      placeholder="Tìm theo mã đơn hoặc email..."
                      value={searchBookingQuery}
                      onChange={(e) => setSearchBookingQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-[#693BFF] ${
                        isDarkMode
                          ? 'bg-[#08162B] border-[#172A48] text-white placeholder-[#64748B]'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3.5 px-4">Mã đơn & Khách</th>
                        <th className="py-3.5 px-3">Phim & Suất chiếu</th>
                        <th className="py-3.5 px-3">Ghế đã đặt</th>
                        <th className="py-3.5 px-3">Tổng tiền</th>
                        <th className="py-3.5 px-3">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Quầy thao tác</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {bookingsList
                        .filter(
                          (b) =>
                            !searchBookingQuery.trim() ||
                            b.bookingCode.toLowerCase().includes(searchBookingQuery.toLowerCase()) ||
                            b.contactEmail.toLowerCase().includes(searchBookingQuery.toLowerCase())
                        )
                        .map((b) => (
                          <tr key={b.id} className={`table-row-hover group cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                          }`}>
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-sm text-[#A875FF]">#{b.bookingCode}</div>
                              <div className={`text-[11px] ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>{b.contactEmail}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.movieTitle}</div>
                              <div className={`text-[11px] ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>
                                {b.cinemaName} • {b.roomName} ({b.startTime?.slice(0, 5)})
                              </div>
                            </td>
                            <td className="py-3 px-3 font-bold text-[#FFB52E]">
                              {b.tickets?.map((t) => t.seatCode).join(', ') || 'Ghế'}
                            </td>
                            <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {Number(b.totalAmount).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : b.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {b.paymentStatus} • {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              {b.status === 'confirmed' && b.tickets && b.tickets.length > 0 && (
                                <button
                                  onClick={() => handleExecuteCheckin(b.tickets[0].ticketCode)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Soát vé
                                </button>
                              )}
                              {b.fnbItems && b.fnbItems.length > 0 && (
                                <button
                                  onClick={() => handleClaimFnb(b.id)}
                                  className="px-2.5 py-1 rounded-lg bg-[#693BFF] hover:bg-[#8057FF] text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Giao F&B
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 5: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (USERS & ROLES)
             ================================================================= */}
          {activeTab === 'users' && (
            <div key="admin-users" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Quản Lý Tài Khoản Người Dùng & Phân Quyền
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Kiểm soát quyền truy cập RBAC (CUSTOMER / STAFF / ADMIN) và khóa/mở tài khoản
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F91AF]" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên, email, SĐT..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#693BFF] ${
                        isDarkMode
                          ? 'bg-[#08162B] border-[#172A48] text-white placeholder-[#64748B]'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <select
                    value={filterUserRole}
                    onChange={(e) => setFilterUserRole(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#693BFF] cursor-pointer ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                    <option value="STAFF">Nhân viên (STAFF)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>
              </div>

              {/* Bảng Danh sách Users */}
              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3.5 px-4">Người dùng</th>
                        <th className="py-3.5 px-3">Số điện thoại</th>
                        <th className="py-3.5 px-3">Hạng thành viên</th>
                        <th className="py-3.5 px-3">Điểm thưởng</th>
                        <th className="py-3.5 px-3">Vai trò (Role)</th>
                        <th className="py-3.5 px-3">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Phân quyền & Khóa</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {usersList
                        .filter(
                          (u) =>
                            (filterUserRole === 'ALL' || u.role === filterUserRole) &&
                            (!searchUserQuery.trim() ||
                              u.fullName.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                              u.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                              u.phone?.includes(searchUserQuery))
                        )
                        .map((u) => (
                          <tr key={u.id} className={`table-row-hover group cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                          }`}>
                            <td className="py-3 px-4">
                              <div className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.fullName}</div>
                              <div className={`text-[11px] ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>{u.email}</div>
                            </td>
                            <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>{u.phone || 'Chưa cập nhật'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 font-extrabold text-[10.5px] uppercase">
                                ★ {u.memberTier || 'bronze'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-amber-500">
                              {u.loyaltyPoints ?? 0} pts
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                  u.role === 'ADMIN'
                                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-700'
                                    : u.role === 'STAFF'
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-700'
                                    : isDarkMode ? 'bg-[#102344] border-[#243E6C] text-[#CBD5E1]' : 'bg-slate-100 border-slate-300 text-slate-800'
                                }`}
                              >
                                <option value="CUSTOMER">CUSTOMER</option>
                                <option value="STAFF">STAFF</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-600'
                                    : 'bg-rose-500/20 text-rose-600'
                                }`}
                              >
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status || 'active')}
                                className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                                  u.status === 'banned'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-600'
                                }`}
                              >
                                {u.status === 'banned' ? 'Mở khóa' : 'Khóa tài khoản'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 6: MÃ GIẢM GIÁ & BANNER (COUPONS & BANNERS)
             ================================================================= */}
          {activeTab === 'coupons' && (
            <div key="admin-coupons" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Mã Giảm Giá & Chiến Dịch Banner
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Cấu hình khuyến mãi áp dụng tự động cho đơn đặt vé
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Tạo Mã Coupon</span>
                </button>
              </div>

              {/* Bảng Coupon */}
              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-[#172A48]' : 'border-slate-200'}`}>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Danh sách Mã Giảm Giá</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Mã Code</th>
                        <th className="py-3 px-3">Mô tả</th>
                        <th className="py-3 px-3">Mức giảm</th>
                        <th className="py-3 px-3">Đơn tối thiểu</th>
                        <th className="py-3 px-3">Thời hạn</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {couponsList.map((cp) => (
                        <tr key={cp.id} className={`table-row-hover group cursor-pointer transition-colors ${
                          isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                        }`}>
                          <td className="py-3 px-4 font-mono font-extrabold text-sm text-[#A875FF]">
                            {cp.code}
                          </td>
                          <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>{cp.description}</td>
                          <td className="py-3 px-3 font-bold text-emerald-600">
                            {cp.discountType === 'percentage'
                              ? `${cp.discountValue}% (tối đa ${Number(cp.maxDiscountAmount || 0).toLocaleString('vi-VN')}đ)`
                              : `${Number(cp.discountValue).toLocaleString('vi-VN')}đ`}
                          </td>
                          <td className={`py-3 px-3 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700 font-medium'}`}>
                            {Number(cp.minOrderValue).toLocaleString('vi-VN')}đ
                          </td>
                          <td className={`py-3 px-3 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                            {formatDateVN(cp.startDate)} - {formatDateVN(cp.endDate)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                cp.isActive ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                              }`}
                            >
                              {cp.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={async () => {
                                if (!confirm(`Xóa coupon ${cp.code}?`)) return;
                                await cineBookingApi.deleteCouponAdmin(cp.id);
                                setCouponsList((prev) => prev.filter((c) => c.id !== cp.id));
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 7: KIỂM DUYỆT ĐÁNH GIÁ (REVIEWS)
             ================================================================= */}
          {activeTab === 'reviews' && (
            <div key="admin-reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Kiểm Duyệt Bình Luận & Đánh Giá Phim
                  </h1>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                    Duyệt các bình luận công khai hoặc ẩn các bình luận spam/tiêu cực
                  </p>
                </div>
              </div>

              <div className={`dtl__bar theme-card rounded-2xl border overflow-hidden shadow-sm ${
                isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-bold uppercase text-[10.5px] ${
                      isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Khách hàng & Phim</th>
                        <th className="py-3 px-3">Số sao</th>
                        <th className="py-3 px-3">Nội dung bình luận</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-[#172A48]/60' : 'divide-slate-100'}`}>
                      {reviewsList.map((rev) => (
                        <tr key={rev.id} className={`table-row-hover group cursor-pointer transition-colors ${
                          isDarkMode ? 'hover:bg-[#071329]' : 'hover:bg-slate-50'
                        }`}>
                          <td className="py-3 px-4">
                            <div className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{rev.userName}</div>
                            <div className="text-[11px] text-[#A875FF] font-semibold">{rev.movieTitle}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="flex items-center gap-1 font-bold text-amber-500">
                              <Star size={12} className="fill-amber-500 text-amber-500" />
                              {rev.rating} / 5 sao
                            </span>
                          </td>
                          <td className={`py-3 px-3 max-w-md ${isDarkMode ? 'text-[#CBD5E1]' : 'text-slate-700'}`}>{rev.comment}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                rev.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-600'
                                  : 'bg-rose-500/20 text-rose-600'
                              }`}
                            >
                              {rev.status || 'approved'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() =>
                                handleUpdateReviewStatus(
                                  rev.id,
                                  rev.status === 'approved' ? 'hidden' : 'approved'
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                                rev.status === 'approved'
                                  ? 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/40'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
                              }`}
                            >
                              {rev.status === 'approved' ? 'Ẩn' : 'Duyệt'}
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================================
          MODAL: THÊM PHIM MỚI
         ===================================================================== */}
      {showAddMovieModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAddMovieModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl m-pop-in border ${
              isDarkMode ? 'bg-[#061123] border-[#243E6C]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? 'border-[#162949]' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Film size={18} className="text-[#693BFF]" />
                <span>Thêm Phim Mới Vào Database</span>
              </h3>
              <button
                onClick={() => setShowAddMovieModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isDarkMode ? 'bg-[#0B1B35] text-[#94A3B8] hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMovie} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Tên bộ phim</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Deadpool & Wolverine"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#693BFF] ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Đạo diễn</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Shawn Levy"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Thời lượng (phút)</label>
                    <input
                      type="number"
                      required
                      value={movieForm.durationMinutes}
                      onChange={(e) =>
                        setMovieForm({ ...movieForm, durationMinutes: Number(e.target.value) })
                      }
                      className={`w-full px-3 py-2 rounded-xl border text-xs ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Độ tuổi</label>
                    <select
                      value={movieForm.ageRating}
                      onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                      className={`w-full px-2 py-2 rounded-xl border text-xs ${
                        isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="P">P (Mọi lứa tuổi)</option>
                      <option value="C13">C13 (13+)</option>
                      <option value="C16">C16 (16+)</option>
                      <option value="C18">C18 (18+)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Mô tả tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  placeholder="Tóm tắt cốt truyện bộ phim..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* UPLOAD POSTER CHUẨN GIÁO TRÌNH: TẢI FILE QUA BACKEND SPRING BOOT -> CLOUDINARY (MÔ HÌNH A) */}
              <div className="space-y-2 pt-1 border-t border-purple-500/20">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <ImageIcon size={14} className="text-[#693BFF]" />
                    <span>Ảnh Poster Phim (Chuẩn giáo trình Cloudinary / Backend)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30">
                    Cách A: Backend làm trung gian
                  </span>
                </div>

                {/* Khung tải file từ máy tính */}
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handlePosterFileUpload}
                />

                <div
                  onClick={() => !uploadingPoster && fileInputRef.current?.click()}
                  className={`p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    uploadingPoster
                      ? 'border-purple-500/50 bg-purple-500/10 cursor-wait'
                      : isDarkMode
                      ? 'border-[#1E365F] hover:border-[#693BFF] bg-[#0A1830]/70 hover:bg-[#0A1830]'
                      : 'border-slate-300 hover:border-[#693BFF] bg-slate-50 hover:bg-purple-50/40'
                  }`}
                >
                  {uploadingPoster ? (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <Loader2 size={24} className="animate-spin text-[#693BFF]" />
                      <p className="text-xs font-bold text-purple-400">
                        Đang truyền file qua Spring Boot REST API (`POST /api/v1/uploads/image`) lên Cloudinary...
                      </p>
                      <span className="text-[10.5px] text-slate-400">Vui lòng đợi giây lát</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#693BFF]/20 text-[#A875FF] flex items-center justify-center flex-shrink-0 border border-[#693BFF]/40">
                        <Upload size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Nhấp để chọn ảnh từ máy tính</span>
                          <span className="text-[10px] font-normal text-slate-400">(Tối đa 10MB)</span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500'}`}>
                          Hỗ trợ JPG, PNG, WEBP, GIF. File sẽ được lưu trữ trên Cloudinary và trả về URL bảo mật.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thông báo kết quả upload */}
                {uploadSuccess && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Tải ảnh lên Cloudinary thành công! URL bảo mật đã được tự động điền vào form.</span>
                  </div>
                )}
                {uploadError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold animate-fadeIn">
                    <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Xem trước ảnh Poster & ô nhập URL trực tiếp */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-[11px] font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-600'}`}>
                      URL ảnh Poster thực tế (Lưu vào MySQL `movies.poster_url`):
                    </label>
                    {movieForm.posterUrl && (
                      <span className="text-[10px] text-emerald-400 font-semibold">● Đã có ảnh</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {movieForm.posterUrl ? (
                      <div className="relative w-11 h-15 rounded-lg overflow-hidden flex-shrink-0 border border-[#1E365F] bg-slate-950">
                        <img
                          src={movieForm.posterUrl}
                          alt="Poster preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-15 rounded-lg border border-dashed border-slate-600 flex items-center justify-center text-slate-500 flex-shrink-0 text-[10px]">
                        Chưa có
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      placeholder="https://res.cloudinary.com/... hoặc /images/posters/ten_phim.jpg"
                      value={movieForm.posterUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs ${
                        isDarkMode
                          ? 'bg-[#0A1830] border-[#1E365F] text-white placeholder-slate-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    💡 <em>Giáo trình CHƯƠNG 4: MySQL chỉ lưu chuỗi URL, không lưu file nhị phân (BLOB) trực tiếp trong CSDL.</em>
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Link YouTube Trailer (URL)</label>
                <input
                  type="text"
                  required
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-[#0A1830] hover:bg-[#102344] text-[#AAB8D0]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-extrabold text-white cursor-pointer shadow-md"
                >
                  Lưu Phim Vào Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CẬP NHẬT / CHỈNH SỬA THÔNG TIN PHIM
         ===================================================================== */}
      {showEditMovieModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEditMovieModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl m-pop-in border max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#061123] border-[#243E6C]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? 'border-[#162949]' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Pencil size={18} className="text-blue-400" />
                <span>Cập Nhật Thông Tin Phim #{editingMovieId}</span>
              </h3>
              <button
                onClick={() => setShowEditMovieModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isDarkMode ? 'bg-[#0B1B35] text-[#94A3B8] hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateMovie} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Tên bộ phim</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Deadpool & Wolverine"
                  value={editMovieForm.title}
                  onChange={(e) => setEditMovieForm({ ...editMovieForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-[#693BFF] ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Đạo diễn</label>
                  <input
                    type="text"
                    required
                    value={editMovieForm.director}
                    onChange={(e) => setEditMovieForm({ ...editMovieForm, director: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Thời lượng (Phút)</label>
                  <input
                    type="number"
                    required
                    min={30}
                    max={300}
                    value={editMovieForm.durationMinutes}
                    onChange={(e) => setEditMovieForm({ ...editMovieForm, durationMinutes: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Độ tuổi kiểm duyệt</label>
                  <select
                    value={editMovieForm.ageRating}
                    onChange={(e) => setEditMovieForm({ ...editMovieForm, ageRating: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="P">P - Phổ biến mọi lứa tuổi</option>
                    <option value="K">K - Dưới 13 tuổi có người lớn</option>
                    <option value="C13">C13 - Dành cho khán giả từ 13 tuổi</option>
                    <option value="C16">C16 - Dành cho khán giả từ 16 tuổi</option>
                    <option value="C18">C18 - Dành cho khán giả từ 18 tuổi</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Trạng thái chiếu</label>
                  <select
                    value={editMovieForm.status}
                    onChange={(e) => setEditMovieForm({ ...editMovieForm, status: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="now_showing">Đang chiếu tại rạp</option>
                    <option value="coming_soon">Sắp khởi chiếu (Coming soon)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Mô tả tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  required
                  value={editMovieForm.description}
                  onChange={(e) => setEditMovieForm({ ...editMovieForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>URL Poster Phim</label>
                <div className="flex gap-2 items-center">
                  {editMovieForm.posterUrl && (
                    <img
                      src={editMovieForm.posterUrl}
                      alt="Preview"
                      className="w-10 h-14 rounded-lg object-cover border border-[#243E6C] flex-shrink-0 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                      }}
                    />
                  )}
                  <input
                    type="text"
                    required
                    value={editMovieForm.posterUrl}
                    onChange={(e) => setEditMovieForm({ ...editMovieForm, posterUrl: e.target.value })}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Link YouTube Trailer (URL)</label>
                <input
                  type="text"
                  required
                  value={editMovieForm.trailerUrl}
                  onChange={(e) => setEditMovieForm({ ...editMovieForm, trailerUrl: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditMovieModal(false)}
                  className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-[#0A1830] hover:bg-[#102344] text-[#AAB8D0]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Pencil size={13} />
                  <span>Cập Nhật Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: TẠO SUẤT CHIẾU MỚI
         ===================================================================== */}
      {showAddShowtimeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAddShowtimeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl m-pop-in border ${
              isDarkMode ? 'bg-[#061123] border-[#243E6C]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? 'border-[#162949]' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Calendar size={18} className="text-[#693BFF]" />
                <span>Tạo Suất Chiếu Mới</span>
              </h3>
              <button
                onClick={() => setShowAddShowtimeModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isDarkMode ? 'bg-[#0B1B35] text-[#94A3B8] hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateShowtime} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Chọn bộ phim</label>
                <select
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: Number(e.target.value) })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {moviesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({formatDuration(m.durationMinutes)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Phòng chiếu</label>
                  <select
                    value={showtimeForm.roomId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, roomId: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value={1}>Phòng 1 - CGV Đồng Khởi</option>
                    <option value={2}>Phòng 2 - CGV Đồng Khởi</option>
                    <option value={3}>Phòng 3 - CGV Đồng Khởi</option>
                    <option value={4}>Phòng 4 (IMAX) - Lotte Cần Thơ</option>
                    <option value={5}>Phòng 5 - Lotte Cần Thơ</option>
                    <option value={6}>Phòng 6 - Galaxy Nguyễn Du</option>
                    <option value={7}>Phòng 7 - Galaxy Nguyễn Du</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Định dạng phòng</label>
                  <select
                    value={showtimeForm.screenFormat}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screenFormat: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="IMAX">IMAX</option>
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Ngày chiếu</label>
                  <input
                    type="date"
                    required
                    value={showtimeForm.showDate}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, showDate: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Giờ bắt đầu</label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={showtimeForm.startTime}
                    onChange={(e) =>
                      setShowtimeForm({
                        ...showtimeForm,
                        startTime: e.target.value.length === 5 ? `${e.target.value}:00` : e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] ${
                isDarkMode ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0]' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                Backend tự động kiểm tra chống trùng giờ chiếu và phòng chiếu theo thời lượng phim.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShowtimeModal(false)}
                  className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-[#0A1830] hover:bg-[#102344] text-[#AAB8D0]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-extrabold text-white cursor-pointer shadow-md"
                >
                  Xếp Suất Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: TẠO MÃ COUPON MỚI
         ===================================================================== */}
      {showAddCouponModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAddCouponModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl m-pop-in border ${
              isDarkMode ? 'bg-[#061123] border-[#243E6C]' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDarkMode ? 'border-[#162949]' : 'border-slate-200'
            }`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <Tag size={18} className="text-[#693BFF]" />
                <span>Tạo Mã Giảm Giá Mới</span>
              </h3>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  isDarkMode ? 'bg-[#0B1B35] text-[#94A3B8] hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Mã code</label>
                <input
                  type="text"
                  required
                  placeholder="VD: CINE50K"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:border-[#693BFF] ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Mô tả</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giảm 20% cho thành viên mới"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Loại giảm</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Giá trị giảm</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Đơn tối thiểu</label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-700'}`}>Giảm tối đa</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount || 0}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isDarkMode ? 'bg-[#0A1830] border-[#1E365F] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-[#0A1830] hover:bg-[#102344] text-[#AAB8D0]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-extrabold text-white cursor-pointer shadow-md"
                >
                  Tạo Mã Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
