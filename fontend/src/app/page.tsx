'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import LuckyWheel from '@/components/LuckyWheel';
import {
  Home,
  Film,
  MapPin,
  Tag,
  Crown,
  ShieldCheck,
  Search,
  Bot,
  Sun,
  Moon,
  Bell,
  Star,
  Clock,
  Play,
  Volume2,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Headphones,
  Ticket,
  Heart,
  CheckCircle2,
  Loader2,
  Send,
  Calendar,
  Phone,
  Mail,
  Sparkles,
  Copy,
  Check,
  QrCode,
  X,
  LogOut,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CreditCard,
  Award,
  ArrowUp,
  AlertCircle,
  Gift,
} from 'lucide-react';
import {
  cineBookingApi,
  ensureBackendAuth,
  clearAuthSession,
  getStoredUser,
  BackendMovie,
  BackendBanner,
  BackendCinema,
  BackendShowtime,
  BackendUserProfile,
  BackendBookingResponse,
  BackendMovieReviewsSummary,
  BackendFavoriteItem,
  BackendCoupon,
  BackendNotification,
  BackendLoyaltySummary,
  BackendDashboardSummary,
} from '@/lib/api';
import {
  triggerCinemaConfetti,
  handleCard3DTilt,
  handleCard3DReset,
  AnimatedNumber,
  LazySection,
  ScrollReveal,
} from '@/lib/motion';

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return '2h\u00A000m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h\u00A0${m < 10 ? `0${m}` : m}m`;
}

function formatDateVN(isoDate?: string) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatShortDate(isoDate?: string) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|^)([A-Za-z0-9_-]{11})(?:[?&]|$)/);
  if (match) return match[1];
  const simpleMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return simpleMatch ? simpleMatch[1] : (url.length === 11 ? url : null);
}

function getMovieVisuals(movie: BackendMovie) {
  // Lấy 100% YouTube ID từ trailer_url trong CSDL (tự động phân tích link YouTube hoặc fallback trailer chuẩn)
  const ytId = extractYoutubeId(movie.trailerUrl) || 'Way9Dexny3w';

  // Lấy 100% Poster từ poster_url trong CSDL
  const rawPoster =
    movie.posterUrl ||
    'https://images.unsplash.com/photo-1534447677768-be436bb09401';
  const isLocal = rawPoster.startsWith('/');
  const basePoster = rawPoster.split('?')[0];

  // Lấy Backdrop tương ứng từ CSDL / local ảnh
  const rawBackdrop = (movie as any).backdropUrl || (movie as any).backdrop_url;
  let backdrop = '';
  if (rawBackdrop) {
    backdrop = rawBackdrop;
  } else if (isLocal) {
    backdrop = rawPoster.includes('/posters/')
      ? rawPoster.replace('/posters/', '/backdrops/').replace('.jpg', '_hero.jpg')
      : rawPoster;
  } else {
    backdrop = `${basePoster}?auto=format&fit=crop&w=1600&q=85`;
  }

  const poster = isLocal ? rawPoster : `${basePoster}?auto=format&fit=crop&w=600&q=85`;

  return {
    poster,
    backdrop,
    trailerThumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    youtubeId: ytId,
  };
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'now' | 'upcoming' | 'favorite'>('now');
  const [activeNav, setActiveNav] = useState<
    'home' | 'movies' | 'movie-detail' | 'cinemas' | 'promos' | 'members'
  >('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [isRedeemingId, setIsRedeemingId] = useState<number | null>(null);

  const handleRedeemCoupon = async (cp: BackendCoupon) => {
    if (!userProfile) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    const currentPoints = userProfile.loyaltyPoints ?? 0;
    if (currentPoints < cp.pointsCost) {
      setRedeemError(
        `Bạn cần ${cp.pointsCost} điểm để đổi mã này (hiện có ${currentPoints} điểm). Hãy đặt vé xem phim hoặc quay Vòng quay may mắn để tích thêm điểm nhé!`
      );
      setTimeout(() => setRedeemError(null), 4500);
      return;
    }

    try {
      setIsRedeemingId(cp.id);
      const res = await cineBookingApi.redeemCoupon(cp.id);
      setUserProfile((prev) =>
        prev ? { ...prev, loyaltyPoints: res.newBalance } : null
      );
      navigator.clipboard?.writeText(cp.code);
      setCopiedCode(cp.code);
      triggerCinemaConfetti();
      setRedeemSuccess({
        code: cp.code,
        message: `🎉 Đổi thành công mã ${cp.code}! Đã trừ ${res.pointsSpent} điểm (Số dư mới: ${res.newBalance} pts). Mã đã được sao chép vào bộ nhớ tạm!`,
      });
      setTimeout(() => {
        setRedeemSuccess(null);
        setCopiedCode(null);
      }, 5000);
    } catch (err: any) {
      setRedeemError(err?.message || 'Có lỗi xảy ra khi đổi điểm nhận mã.');
      setTimeout(() => setRedeemError(null), 4500);
    } finally {
      setIsRedeemingId(null);
    }
  };

  // Trailer Modal
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [modalVideoId, setModalVideoId] = useState('Way9Dexny3w');
  const [modalVideoTitle, setModalVideoTitle] = useState('');

  // Hero Banner Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [inlineVideoPlaying, setInlineVideoPlaying] = useState(false);

  // Bộ lọc trên trang Rạp toàn màn hình
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');

  // ============================================================================
  // STATE DỮ LIỆU THỰC TẾ 100% TỪ SPRING BOOT BACKEND & MYSQL DATABASE
  // ============================================================================
  const [loading, setLoading] = useState(true);
  const [allMovies, setAllMovies] = useState<BackendMovie[]>([]);
  const [nowShowingMovies, setNowShowingMovies] = useState<BackendMovie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<BackendMovie[]>([]);
  const [favorites, setFavorites] = useState<BackendFavoriteItem[]>([]);
  const [banners, setBanners] = useState<BackendBanner[]>([]);
  const [cinemas, setCinemas] = useState<BackendCinema[]>([]);
  const [showtimes, setShowtimes] = useState<BackendShowtime[]>([]);
  const [movieRatings, setMovieRatings] = useState<Record<number, number>>({});

  // Phim đang chọn trong trang Toàn màn hình "Phim & Chi tiết"
  const [selectedMovieId, setSelectedMovieId] = useState<number>(2);
  const [selectedMovieDetail, setSelectedMovieDetail] =
    useState<BackendMovie | null>(null);
  const [selectedMovieReviews, setSelectedMovieReviews] =
    useState<BackendMovieReviewsSummary | null>(null);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Tài khoản & Lịch sử đặt vé & Mã giảm giá & Thông báo & Điểm thưởng & Dashboard
  const [userProfile, setUserProfile] = useState<BackendUserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<BackendBookingResponse[]>([]);
  const [coupons, setCoupons] = useState<BackendCoupon[]>([]);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loyaltySummary, setLoyaltySummary] =
    useState<BackendLoyaltySummary | null>(null);
  const [dashboardSummary, setDashboardSummary] =
    useState<BackendDashboardSummary | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [switchingAccount, setSwitchingAccount] = useState(false);

  // State cho Chuông Thông báo, Xem Vé Điện Tử QR, Mở QR ZaloPay, Soát vé Check-in, Thêm Phim Mới, Đổi mật khẩu & Đăng ký
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [viewingTicketBooking, setViewingTicketBooking] =
    useState<BackendBookingResponse | null>(null);
  const [viewingBookingHistory, setViewingBookingHistory] = useState<
    {
      id: number;
      oldStatus: string | null;
      newStatus: string;
      note: string;
      changedAt: string;
    }[]
  >([]);
  const [homeZaloPayModal, setHomeZaloPayModal] = useState<{
    bookingId: number;
    bookingCode: string;
    appTransId: string;
    orderUrl: string;
    qrCode: string;
    amount: number;
  } | null>(null);
  const [homeZaloPayMsg, setHomeZaloPayMsg] = useState('');
  const [homeZaloPayCountdown, setHomeZaloPayCountdown] = useState<number>(0);

  // Đếm ngược thời gian giữ ghế thực tế khi mở Modal ZaloPay trên trang cá nhân
  useEffect(() => {
    if (!homeZaloPayModal) return;
    const timer = setInterval(() => {
      setHomeZaloPayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHomeZaloPayModal(null);
          alert('Đơn giữ ghế đã hết hạn (quá 5 phút). Ghế đã được tự động giải phóng.');
          if (userProfile?.id) {
            cineBookingApi.getUserBookings(userProfile.id).then(setUserBookings).catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [homeZaloPayModal, userProfile?.id]);

  // State Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // State Modal Đăng nhập / Đăng ký & Menu Người dùng
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // State Công cụ Quản trị: Thêm Phim Mới & Xếp Suất Chiếu + Quầy Soát Vé QR Check-in
  const [newMovieTitle, setNewMovieTitle] = useState('');
  const [newMovieDirector, setNewMovieDirector] = useState('');
  const [newMovieDuration, setNewMovieDuration] = useState(125);
  const [newMovieAgeRating, setNewMovieAgeRating] = useState('C16');
  const [newMoviePosterUrl, setNewMoviePosterUrl] = useState(
    'https://images.unsplash.com/photo-1534447677768-be436bb09401'
  );
  const [newMovieTrailerUrl, setNewMovieTrailerUrl] = useState(
    'https://www.youtube.com/watch?v=73_1biulkYk'
  );
  const [newMovieDesc, setNewMovieDesc] = useState(
    'Bộ phim bom tấn điện ảnh mới nhất với kỹ xảo IMAX đỉnh cao và âm thanh vòm Dolby Atmos.'
  );
  const [creatingMovie, setCreatingMovie] = useState(false);
  const [createMovieMsg, setCreateMovieMsg] = useState<string | null>(null);

  const [checkinCodeInput, setCheckinCodeInput] = useState('');
  const [checkinResultMsg, setCheckinResultMsg] = useState<string | null>(null);

  // Khởi tạo & đồng bộ chế độ Sáng / Tối (Dark Mode / Light Mode) + đọc ?view= từ URL
  useEffect(() => {
    const savedTheme = localStorage.getItem('cinebooking_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('theme-light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.remove('theme-light');
    }

    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as any;
    const savedNav = localStorage.getItem('cinebooking_active_nav') as any;
    const validNavs = ['home', 'movies', 'movie-detail', 'cinemas', 'promos', 'members'];
    const targetNav = validNavs.includes(viewParam)
      ? viewParam
      : (validNavs.includes(savedNav) ? savedNav : 'home');

    if (targetNav) {
      setActiveNav(targetNav);
    }

    const movieParam = params.get('movieId') || localStorage.getItem('cinebooking_selected_movie_id');
    if (movieParam && !isNaN(Number(movieParam))) {
      setSelectedMovieId(Number(movieParam));
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
        const u = getStoredUser();
        setUserProfile(u);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Luôn reset cuộn lên đầu trang ngay lập tức mỗi khi chuyển phân hệ / tab điều hướng
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeNav]);

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

  // Tự động đồng bộ trang đang sử dụng vào URL & LocalStorage
  // Giúp khi bấm F5 (refresh) trình duyệt giữ nguyên trang hiện tại, không bị nhảy về Home
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (activeNav === 'home') {
        url.searchParams.delete('view');
        url.searchParams.delete('movieId');
      } else {
        url.searchParams.set('view', activeNav);
        if ((activeNav === 'movie-detail' || activeNav === 'movies') && selectedMovieId) {
          url.searchParams.set('movieId', String(selectedMovieId));
        } else {
          url.searchParams.delete('movieId');
        }
      }
      window.history.replaceState(null, '', url.toString());
      localStorage.setItem('cinebooking_active_nav', activeNav);
      if (selectedMovieId) {
        localStorage.setItem('cinebooking_selected_movie_id', String(selectedMovieId));
      }
    } catch {}
  }, [activeNav, selectedMovieId]);

  // 1. Tải toàn bộ dữ liệu từ MySQL thông qua Spring Boot API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [
          authRes,
          moviesAll,
          moviesNow,
          moviesSoon,
          activeBanners,
          cinemaList,
          showtimeList,
          couponList,
        ] = await Promise.all([
          ensureBackendAuth().catch(() => null),
          cineBookingApi.getAllMovies().catch(() => []),
          cineBookingApi.getNowShowingMovies().catch(() => []),
          cineBookingApi.getComingSoonMovies().catch(() => []),
          cineBookingApi.getActiveBanners().catch(() => []),
          cineBookingApi.getCinemas().catch(() => []),
          cineBookingApi.getShowtimes().catch(() => []),
          cineBookingApi.getCoupons(true).catch(() => []),
        ]);

        if (!active) return;

        setAllMovies(moviesAll || []);
        setNowShowingMovies(moviesNow || []);
        setComingSoonMovies(moviesSoon || []);
        setBanners(activeBanners || []);
        setCinemas(cinemaList || []);
        setShowtimes(showtimeList || []);
        setCoupons(couponList || []);

        const defaultMovie =
          moviesNow?.[0] ||
          moviesAll?.[0];
        if (defaultMovie) {
          setSelectedMovieId(defaultMovie.id);
        }

        if (showtimeList && showtimeList.length > 0) {
          const uniqueDates = Array.from(
            new Set(showtimeList.map((s) => s.showDate))
          ).sort();
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          }
        }

        const ratingMap: Record<number, number> = {};
        await Promise.all(
          (moviesAll || []).map(async (m) => {
            try {
              const rev = await cineBookingApi.getMovieReviews(m.id);
              if (rev && rev.totalReviews > 0) {
                ratingMap[m.id] = rev.averageRating;
              }
            } catch {
              // Phim chưa có đánh giá
            }
          })
        );
        if (active) setMovieRatings(ratingMap);

        if (authRes?.user) {
          setUserProfile(authRes.user);
          setEditFullName(authRes.user.fullName || '');
          setEditPhone(authRes.user.phone || '');
          const [favs, bookings, notifs, loyalty, dash] = await Promise.all([
            cineBookingApi.getMyFavorites().catch(() => []),
            cineBookingApi.getUserBookings(authRes.user.id).catch(() => []),
            cineBookingApi.getMyNotifications().catch(() => []),
            cineBookingApi.getMyLoyaltySummary().catch(() => null),
            cineBookingApi.getDashboardSummary().catch(() => null),
          ]);
          if (active) {
            setFavorites(favs || []);
            setUserBookings(bookings || []);
            setNotifications(notifs || []);
            setLoyaltySummary(loyalty);
            setDashboardSummary(dash);
          }
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu từ Backend:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // 2. Khi đổi selectedMovieId -> Tải chi tiết phim (`movie_casts`) & đánh giá (`reviews`) từ MySQL
  useEffect(() => {
    if (!selectedMovieId) return;
    let active = true;
    (async () => {
      try {
        const [detail, reviews] = await Promise.all([
          cineBookingApi.getMovieDetail(selectedMovieId).catch(() => null),
          cineBookingApi.getMovieReviews(selectedMovieId).catch(() => null),
        ]);
        if (!active) return;
        setSelectedMovieDetail(detail);
        setSelectedMovieReviews(reviews);
      } catch (err) {
        console.error('Lỗi lấy chi tiết phim:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedMovieId]);

  const heroMovies = useMemo(() => {
    return allMovies.length > 0 ? allMovies : nowShowingMovies;
  }, [allMovies, nowShowingMovies]);

  useEffect(() => {
    if (
      activeNav !== 'home' ||
      isBannerHovered ||
      inlineVideoPlaying ||
      heroMovies.length <= 1
    )
      return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeNav, isBannerHovered, inlineVideoPlaying, heroMovies.length]);

  const currentHeroMovie = heroMovies[currentSlide] || heroMovies[0] || null;
  const currentHeroVisuals = currentHeroMovie
    ? getMovieVisuals(currentHeroMovie)
    : null;

  const handlePrevSlide = () => {
    if (heroMovies.length === 0) return;
    setInlineVideoPlaying(false);
    setCurrentSlide((prev) => (prev === 0 ? heroMovies.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (heroMovies.length === 0) return;
    setInlineVideoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const openTrailer = (youtubeId: string, title: string) => {
    setModalVideoId(youtubeId);
    setModalVideoTitle(title);
    setShowTrailerModal(true);
  };

  const isMovieFavorite = (movieId: number) =>
    favorites.some((f) => f.movieId === movieId);

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    movieId: number
  ) => {
    e.stopPropagation();
    try {
      if (isMovieFavorite(movieId)) {
        await cineBookingApi.removeFavorite(movieId);
      } else {
        await cineBookingApi.addFavorite(movieId);
      }
      const updated = await cineBookingApi.getMyFavorites();
      setFavorites(updated || []);
    } catch (err) {
      console.error('Lỗi cập nhật yêu thích:', err);
    }
  };

  const displayedMovies = useMemo(() => {
    let source: BackendMovie[] = [];
    if (activeTab === 'now') {
      source = nowShowingMovies;
    } else if (activeTab === 'upcoming') {
      source = comingSoonMovies;
    } else {
      const favIds = new Set(favorites.map((f) => f.movieId));
      source = allMovies.filter((m) => favIds.has(m.id));
    }

    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase().trim();
    return allMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.genres?.some((g) => g.name.toLowerCase().includes(q))
    );
  }, [
    activeTab,
    nowShowingMovies,
    comingSoonMovies,
    favorites,
    allMovies,
    searchQuery,
  ]);

  // ============================================================================
  // GSAP CINEMATIC MOTION CHOREOGRAPHY (GSAP Animation Skill)
  // ============================================================================
  const heroBannerRef = useRef<HTMLElement>(null);
  const movieGridRef = useRef<HTMLDivElement>(null);

  // GSAP: Cinema Hero Transition Animation (Crystal-clear & sharp, no scale blur)
  useEffect(() => {
    if (!heroBannerRef.current || !currentHeroMovie) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // 1. Ken Burns Slow-Zoom & Cinema Fade on backdrop
      tl.fromTo(
        '.hero-bg-image',
        { opacity: 0.2, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }
      );
      // 2. High-impact Masked Title Rise
      tl.fromTo(
        '.hero-anim-title',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, ease: 'expo.out' },
        '-=0.9'
      );
      // 3. Stagger details, badges & CTA buttons
      tl.fromTo(
        '.hero-anim-fade',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
        '-=0.45'
      );
      // 4. Trailer Preview Box Pop-In
      tl.fromTo(
        '.hero-anim-preview',
        { opacity: 0, x: 16, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'power2.out' },
        '-=0.35'
      );
    }, heroBannerRef);

    return () => ctx.revert();
  }, [currentSlide, currentHeroMovie?.id]);

  // GSAP: Movie Cards Crisp Stagger Entrance (Razor-sharp, no scale blur)
  useEffect(() => {
    if (!movieGridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-movie-card',
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }, movieGridRef);

    return () => ctx.revert();
  }, [activeTab, displayedMovies]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId || !newReviewComment.trim()) return;
    try {
      setSubmittingReview(true);
      await cineBookingApi.submitMovieReview(
        selectedMovieId,
        newReviewRating,
        newReviewComment.trim()
      );
      setNewReviewComment('');
      triggerCinemaConfetti();
      const updatedReviews = await cineBookingApi.getMovieReviews(
        selectedMovieId
      );
      setSelectedMovieReviews(updatedReviews);
      if (updatedReviews && updatedReviews.totalReviews > 0) {
        setMovieRatings((prev) => ({
          ...prev,
          [selectedMovieId]: updatedReviews.averageRating,
        }));
      }
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserProfile(null);
    setUserBookings([]);
    setNotifications([]);
    setLoyaltySummary(null);
    setDashboardSummary(null);
    setShowUserDropdown(false);
  };

  const fillLoginTestAccount = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setLoginEmail('khachhang@gmail.com');
      setLoginPassword('Customer@123');
    } else {
      setLoginEmail('admin@cinema.com');
      setLoginPassword('Admin@123');
    }
    setLoginError(null);
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    try {
      setLoginLoading(true);
      setLoginError(null);
      const auth = await cineBookingApi.login(loginEmail.trim(), loginPassword);
      if (auth?.user) {
        triggerCinemaConfetti();
        setUserProfile(auth.user);
        setEditFullName(auth.user.fullName || '');
        setEditPhone(auth.user.phone || '');
        const [favs, bookings, notifs, loyalty] = await Promise.all([
          cineBookingApi.getMyFavorites().catch(() => []),
          cineBookingApi.getUserBookings(auth.user.id).catch(() => []),
          cineBookingApi.getMyNotifications().catch(() => []),
          cineBookingApi.getMyLoyaltySummary().catch(() => null),
        ]);
        setFavorites(favs || []);
        setUserBookings(bookings || []);
        setNotifications(notifs || []);
        setLoyaltySummary(loyalty);
        setShowAuthModal(false);
        setLoginPassword('');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setRegError('Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    try {
      setRegLoading(true);
      setRegError(null);
      const auth = await cineBookingApi.register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });
      if (auth?.user) {
        triggerCinemaConfetti();
        setUserProfile(auth.user);
        setEditFullName(auth.user.fullName || '');
        setEditPhone(auth.user.phone || '');
        setShowAuthModal(false);
        setRegFullName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setRegLoading(false);
    }
  };

  const availableDates = useMemo(() => {
    return Array.from(new Set(showtimes.map((s) => s.showDate))).sort();
  }, [showtimes]);

  const availableFormats = useMemo(() => {
    const set = new Set(showtimes.map((s) => s.screenFormat));
    return ['ALL', ...Array.from(set)];
  }, [showtimes]);

  const availableCities = useMemo(() => {
    const set = new Set(cinemas.map((c) => c.city));
    return ['ALL', ...Array.from(set)];
  }, [cinemas]);

  const getFirstShowtimeIdForMovie = (movieId: number) => {
    const st = showtimes.find((s) => s.movieId === movieId);
    return st ? st.id : showtimes[0]?.id || 1;
  };

  const openFullMoviePage = (movieId: number) => {
    setSelectedMovieId(movieId);
    setActiveNav('movie-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`theme-shell flex min-h-screen font-sans antialiased transition-colors duration-250 ${
        isDarkMode
          ? 'bg-[#030916] text-[#F4F7FF]'
          : 'bg-[#F1F5F9] text-[#0F172A]'
      }`}
    >
      {/* 1. SIDEBAR BÊN TRÁI (88px) */}
      <aside
        className={`w-[88px] flex-shrink-0 border-r flex flex-col items-center py-5 justify-between select-none z-30 min-h-screen sticky top-0 h-screen transition-colors ${
          isDarkMode
            ? 'bg-[#040B18] border-[#172A48]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col items-center gap-6 w-full">
          <button
            onClick={() => setActiveNav('home')}
            className="group flex items-center justify-center cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8057FF] to-[#693BFF] flex items-center justify-center shadow-[0_0_16px_rgba(105,59,255,0.45)] group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-black text-xl tracking-tighter">
                G
              </span>
            </div>
          </button>

          <nav className="flex flex-col gap-3 w-full px-2.5">
            {[
              { id: 'home', label: 'Trang chủ', icon: Home },
              { id: 'movies', label: 'Phim', icon: Film },
              { id: 'cinemas', label: 'Rạp', icon: MapPin },
              { id: 'promos', label: 'Ưu đãi', icon: Tag },
              { id: 'members', label: 'Thành viên', icon: Crown },
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeNav === item.id || (item.id === 'movies' && activeNav === 'movie-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#693BFF] text-white shadow-[0_0_14px_rgba(105,59,255,0.45)]'
                      : isDarkMode
                      ? 'text-[#7F91AF] hover:text-[#AAB8D0] hover:bg-[#071329]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComp size={20} strokeWidth={2.2} />
                  <span className="text-[11px] font-semibold leading-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="flex flex-col items-center gap-4 w-full px-2">
          <button
            onClick={() => {
              if (userProfile) {
                setActiveNav('members');
              } else {
                setAuthModalTab('login');
                setShowAuthModal(true);
              }
            }}
            title={
              userProfile
                ? `${userProfile.fullName} (${userProfile.email})`
                : 'Đăng nhập / Đăng ký tài khoản'
            }
            className="relative cursor-pointer group"
          >
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-all group-hover:scale-105 ${
                userProfile
                  ? 'border-[#693BFF] bg-[#102347] text-white shadow-[0_0_12px_rgba(105,59,255,0.4)]'
                  : 'border-dashed border-[#475569] bg-[#0B1A34] text-[#94A3B8] hover:border-[#693BFF] hover:text-white'
              }`}
            >
              {userProfile?.fullName ? (
                userProfile.fullName
                  .split(' ')
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
              ) : (
                <User size={18} />
              )}
            </div>
            {userProfile && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#040B18]"></span>
            )}
          </button>

          <button
            onClick={() => setActiveNav('cinemas')}
            className={`flex flex-col items-center gap-0.5 transition-colors py-1 cursor-pointer ${
              isDarkMode
                ? 'text-[#7F91AF] hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Headphones size={17} />
            <span className="text-[10px] leading-tight font-medium text-center">
              Lịch chiếu
              <br />
              {showtimes.length} suất
            </span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN COLUMN PHÍA BÊN PHẢI (TOÀN MÀN HÌNH) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2.0 THANH ĐIỀU HÀNH QUẢN TRỊ ĐỒNG BỘ (Chỉ hiển thị khi đăng nhập quyền ADMIN/STAFF) */}
        {userProfile && (userProfile.role === 'ADMIN' || userProfile.role === 'STAFF') && (
          <div className="bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#BE185D] text-white px-6 py-2 flex items-center justify-between text-xs font-semibold shadow-md z-30 border-b border-purple-400/30">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-300">
                <Crown size={12} />
              </span>
              <span>
                Chế độ Quản Trị Viên: <strong>{userProfile.fullName}</strong> ({userProfile.role})
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-purple-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đồng bộ hai chiều với Trang Quản trị
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                style={{ backgroundColor: '#FFFFFF', color: '#2E1065' }}
                className="admin-banner-btn px-4 py-1.5 rounded-full bg-white hover:bg-amber-300 text-[#2E1065] hover:text-black text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                <ShieldCheck size={14} style={{ color: '#2E1065' }} className="text-[#2E1065] flex-shrink-0" />
                <span style={{ color: '#2E1065' }} className="text-[#2E1065] font-black whitespace-nowrap">
                  Vào trang admin
                </span>
                <ChevronRight size={14} style={{ color: '#2E1065' }} className="text-[#2E1065] flex-shrink-0" />
              </Link>
            </div>
          </div>
        )}

        {/* 2.1 HEADER TRÊN CÙNG (60px) */}
        <header
          className={`h-[60px] border-b px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors ${
            isDarkMode
              ? 'bg-[#030916]/95 border-[#172A48]/80'
              : 'bg-white/95 border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-7">
            <button
              onClick={() => setActiveNav('home')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#693BFF] to-[#A875FF] flex items-center justify-center shadow-sm">
                <Film size={15} className="text-white" />
              </div>
              <span
                className={`font-extrabold text-[17px] tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                CineBooking
              </span>
            </button>

            {/* Thanh điều hướng chuyển trực tiếp giữa 5 trang Toàn Màn Hình */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold">
              {[
                { id: 'home', label: 'Trang chủ' },
                { id: 'movies', label: 'Phim' },
                { id: 'cinemas', label: 'Rạp & Lịch chiếu' },
                { id: 'promos', label: 'Ưu đãi' },
                { id: 'members', label: 'Thành viên & Vé đã đặt' },
              ].map((tab) => {
                const isActive = activeNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveNav(tab.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      color: isActive
                        ? isDarkMode
                          ? '#FFFFFF'
                          : '#693BFF'
                        : isDarkMode
                        ? '#AAB8D0'
                        : '#475569',
                    }}
                    className={`nav-tab relative py-4 flex items-center transition-colors cursor-pointer ${
                      isActive
                        ? `nav-tab-active ${
                            isDarkMode
                              ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#693BFF]'
                              : '!text-[#693BFF] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#693BFF]'
                          }`
                        : isDarkMode
                        ? 'text-[#AAB8D0] hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Phải: Search, Dark/Light Switcher & User */}
          <div className="flex items-center gap-3">
            {/* Ô tìm kiếm thực tế + Dropdown kết quả trực tiếp */}
            <div className="relative w-[260px] hidden lg:block">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7F91AF]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder="Tìm phim, đạo diễn, thể loại..."
                className={`theme-input w-full border focus:border-[#693BFF] focus:outline-none text-[13px] pl-9 pr-7 py-1.5 rounded-full transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-[#08162B] border-[#172A48] text-[#F4F7FF] placeholder-[#7F91AF]'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7F91AF] hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}

              {searchQuery.trim() !== '' && (
                <div className="absolute top-11 left-0 right-0 z-50 rounded-2xl bg-[#071327] border border-[#243E6C] shadow-2xl p-2 max-h-[340px] overflow-y-auto space-y-1">
                  {allMovies
                    .filter(
                      (m) =>
                        m.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        m.director
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        m.genres?.some((g) =>
                          g.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                    )
                    .map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMovieId(m.id);
                          setActiveNav('movies');
                          setSearchQuery('');
                        }}
                        className="w-full p-2 rounded-xl hover:bg-[#102344] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <img
                          src={getMovieVisuals(m).poster}
                          alt={m.title}
                          className="w-8 h-11 rounded object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-white truncate">
                            {m.title}
                          </div>
                          <div className="text-[10.5px] text-[#94A3B8] truncate">
                            Đạo diễn: {m.director} • {m.ageRating}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* NÚT CHUYỂN ĐỔI CHẾ ĐỘ DARK MODE / LIGHT MODE CHUẨN MẪU */}
            
            <button
              onClick={toggleThemeMode}
              title={
                isDarkMode
                  ? 'Chuyển sang Giao diện Sáng (Light Mode)'
                  : 'Chuyển sang Giao diện Tối (Dark Mode)'
              }
              className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-[#08162B] border-[#254475] text-[#F4F7FF] hover:border-[#693BFF]'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
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

            {/* Nút Chuông Thông báo có Dropdown trực tiếp */}
            <div className="relative">
              <button
                onClick={async () => {
                  const next = !showNotifDropdown;
                  setShowNotifDropdown(next);
                  if (next) {
                    const fresh = await cineBookingApi
                      .getMyNotifications()
                      .catch(() => []);
                    setNotifications(fresh || []);
                  }
                }}
                title="Thông báo hệ thống"
                className={`btn-press w-8 h-8 rounded-full border flex items-center justify-center transition-colors relative cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#08162B] border-[#172A48] text-[#AAB8D0] hover:text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Bell size={15} />
                {notifications.some((n) => !n.isRead) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-1 m-live-indicator" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-[#071327] border border-[#243E6C] shadow-2xl p-3.5 space-y-2.5 m-pop-in">
                  <div className="flex items-center justify-between border-b border-[#172A48] pb-2">
                    <span className="text-xs font-extrabold text-white">
                      Thông báo của bạn
                    </span>
                    {notifications.some((n) => !n.isRead) && (
                      <button
                        onClick={async () => {
                          await cineBookingApi.markAllNotificationsAsRead();
                          const fresh =
                            await cineBookingApi.getMyNotifications();
                          setNotifications(fresh || []);
                        }}
                        className="text-[11px] font-bold text-[#A875FF] hover:underline cursor-pointer"
                      >
                        Đánh dấu đã đọc hết
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-5 text-center text-xs text-[#64748B]">
                        Chưa có thông báo nào
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
                                  item.id === n.id
                                    ? { ...item, isRead: true }
                                    : item
                                )
                              );
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                            n.isRead
                              ? 'bg-[#0A1830]/60 border-[#172A48] text-[#94A3B8]'
                              : 'bg-[#102347] border-[#693BFF] text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">{n.title}</div>
                          <div className="text-[11px] text-[#CBD5E1] mt-0.5 leading-snug">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Actions */}
            {!userProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-[#693BFF] hover:bg-[#693BFF]/20 text-[#A875FF] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white text-xs font-bold shadow-[0_0_12px_rgba(105,59,255,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Đăng ký</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  title={`${userProfile.fullName || 'Tài khoản'} (${userProfile.memberTier || 'SILVER'})`}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#693BFF] to-[#A875FF] hover:ring-2 hover:ring-[#A875FF] flex items-center justify-center text-xs font-extrabold text-white shadow-md transition-all cursor-pointer"
                >
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#061020]/95 backdrop-blur-xl border border-[#1E3A66] p-3 shadow-2xl z-50 m-pop-in space-y-2 text-left"
                    onMouseLeave={() => setShowUserDropdown(false)}
                  >
                    <div className="p-2.5 rounded-xl bg-[#0B1A34] border border-[#172A48]">
                      <div className="text-xs font-bold text-white truncate">
                        {userProfile.fullName}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        {userProfile.email}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#172A48] text-[11px]">
                        <span className="text-[#FFB52E] font-bold">
                          💎 {userProfile.loyaltyPoints ?? 0} điểm
                        </span>
                        <span className="text-[#A875FF] font-bold uppercase text-[10px]">
                          Hạng {userProfile.memberTier || 'SILVER'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveNav('members');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#102347] text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User size={14} className="text-[#A875FF]" />
                      <span>Trang cá nhân & Lịch sử vé</span>
                    </button>

                    {(userProfile.role === 'ADMIN' || userProfile.role === 'STAFF') && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#102347] text-xs font-semibold text-[#FFB52E] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Crown size={14} />
                        <span>Trang Quản trị Admin ↗</span>
                      </Link>
                    )}

                    <div className="border-t border-[#172A48] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-xs font-bold text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* =====================================================================
            2.2 NỘI DUNG TOÀN MÀN HÌNH THEO TỪNG PHÂN HỆ (HOME / MOVIES / CINEMAS / PROMOS / MEMBERS)
           ===================================================================== */}
        <main className="flex-1 px-6 py-4 max-w-[1536px] w-full mx-auto">
          {/* =================================================================
              VIEW 1: TRANG CHỦ (HOME)
             ================================================================= */}
          {activeNav === 'home' && (
            <div key="view-home" className="page-transition space-y-5">
              {/* HERO BANNER SECTION */}
              {currentHeroMovie && currentHeroVisuals && (
                <section
                  ref={heroBannerRef}
                  onMouseEnter={() => setIsBannerHovered(true)}
                  onMouseLeave={() => setIsBannerHovered(false)}
                  className="hero-stage-dark relative rounded-2xl overflow-hidden border border-[#172A48] bg-[#071329] h-[304px] shadow-2xl flex items-center transition-all duration-500"
                >
                  <div
                    key={currentHeroMovie.id}
                    className="hero-bg-image absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-100 will-change-transform"
                    style={{
                      backgroundImage: `url('${currentHeroVisuals.backdrop}')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030916]/95 via-[#030916]/75 via-55% to-transparent pointer-events-none" />
                  </div>

                  {/* Slider navigation controls */}
                  <div className="absolute top-3.5 right-5 flex items-center gap-2.5 z-20">
                    <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {heroMovies.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setInlineVideoPlaying(false);
                            setCurrentSlide(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden relative ${
                            currentSlide === idx
                              ? 'w-7 bg-white/20'
                              : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                          title={m.title}
                        >
                          {currentSlide === idx && (
                            <span
                              key={`progress-${currentSlide}-${isBannerHovered}`}
                              className="absolute inset-0 bg-gradient-to-r from-[#693BFF] to-[#A875FF] rounded-full hero-progress-fill"
                              style={{
                                animationPlayState: isBannerHovered || inlineVideoPlaying ? 'paused' : 'running',
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-xs text-slate-300">
                      <button
                        onClick={handlePrevSlide}
                        className="hover:text-white transition-colors cursor-pointer p-0.5"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <span className="font-semibold text-white tracking-wider text-[11px]">
                        {currentSlide + 1}/{heroMovies.length}
                      </span>
                      <button
                        onClick={handleNextSlide}
                        className="hover:text-white transition-colors cursor-pointer p-0.5"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Nội dung bên trong Hero Banner */}
                  <div className="relative z-10 w-full px-8 py-5 flex items-center justify-between gap-8">
                    <div
                      key={`hero-copy-${currentHeroMovie.id}`}
                      className="max-w-[560px] space-y-2.5"
                    >
                      <div className="hero-anim-fade inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#17143B]/90 border border-[#6438F5] text-white text-[11px] font-medium tracking-wide">
                        <span>
                          {currentHeroMovie.status === 'now_showing'
                            ? 'Đang chiếu tại rạp'
                            : 'Sắp khởi chiếu'}
                        </span>
                        <span className="text-[#C4B5FD]">
                          • Đạo diễn: {currentHeroMovie.director}
                        </span>
                      </div>

                      <h1 className="text-3xl md:text-[40px] font-extrabold text-white tracking-tight leading-tight drop-shadow-lg overflow-hidden py-0.5">
                        <span className="hero-anim-title inline-block will-change-transform text-white">{currentHeroMovie.title}</span>
                      </h1>

                      <p className="hero-anim-fade text-slate-200 text-sm md:text-[14px] font-normal leading-snug line-clamp-2">
                        {currentHeroMovie.description}
                      </p>

                      <div className="hero-anim-fade flex items-center flex-wrap gap-2.5 pt-0.5 text-xs">
                        {movieRatings[currentHeroMovie.id] ? (
                          <div className="flex items-center gap-1.5 font-bold text-white text-[13px]">
                            <Star
                              size={14}
                              className="text-[#FFB52E] fill-[#FFB52E]"
                            />
                            <span>
                              {movieRatings[currentHeroMovie.id].toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">Chưa có đánh giá</span>
                        )}

                        <span className="bg-black/60 text-white font-extrabold px-2.5 py-0.5 rounded-md text-[11px] border border-white/25 backdrop-blur-sm shadow-sm">
                          {currentHeroMovie.ageRating}
                        </span>

                        <span className="bg-black/60 text-white/95 font-medium px-3 py-0.5 rounded-full border border-white/25 text-[12px] backdrop-blur-sm shadow-sm">
                          {currentHeroMovie.genres
                            ?.map((g) => g.name)
                            .join(', ') || 'Điện ảnh'}
                        </span>

                        <div className="flex items-center gap-1 text-slate-300 text-[12px]">
                          <Clock size={13} />
                          <span>
                            {formatDuration(currentHeroMovie.durationMinutes)}
                          </span>
                        </div>
                      </div>

                      <div className="hero-anim-fade flex items-center gap-3 pt-1.5">
                        <Link
                          href={`/booking?showtimeId=${getFirstShowtimeIdForMovie(
                            currentHeroMovie.id
                          )}`}
                          className="btn-press inline-flex items-center gap-2 bg-[#693BFF] hover:bg-[#8057FF] text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(105,59,255,0.45)] transition-all duration-200 hover:scale-[1.02]"
                        >
                          <Ticket size={15} />
                          <span>Đặt vé ngay</span>
                        </Link>

                        <button
                          onClick={() => openFullMoviePage(currentHeroMovie.id)}
                          className="btn-press inline-flex items-center gap-2 bg-black/60 hover:bg-black/80 border border-white/30 text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md"
                        >
                          <span>Chi tiết toàn màn hình</span>
                        </button>

                        <button
                          onClick={() =>
                            openTrailer(
                              currentHeroVisuals.youtubeId,
                              currentHeroMovie.title
                            )
                          }
                          className="btn-press inline-flex items-center gap-2 bg-black/60 hover:bg-purple-950/70 border border-purple-400/60 text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Xem trailer</span>
                        </button>
                      </div>
                    </div>

                    {/* Phải: Box Trailer Preview Thumbnail */}
                    <div className="hero-anim-preview hidden lg:block w-[348px] flex-shrink-0 mt-3">
                      <div className="rounded-xl overflow-hidden border border-white/20 bg-slate-950/95 shadow-2xl relative group">
                        <div className="relative h-[162px] w-full overflow-hidden bg-black">
                          {inlineVideoPlaying ? (
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube-nocookie.com/embed/${currentHeroVisuals.youtubeId}?autoplay=1&mute=0&rel=0`}
                              title={`${currentHeroMovie.title} Trailer`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <>
                              <img
                                src={currentHeroVisuals.trailerThumb}
                                alt={`${currentHeroMovie.title} Trailer Preview`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />

                              <button
                                onClick={() => setInlineVideoPlaying(true)}
                                className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:bg-[#693BFF] group-hover:border-white transition-all cursor-pointer"
                              >
                                <Play size={18} className="fill-white ml-0.5" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="px-3.5 py-2 bg-slate-950/95 flex flex-col gap-1.5 border-t border-white/10">
                          <div className="w-full h-1 bg-[#172A48] rounded-full overflow-hidden">
                            <div className="w-[42%] h-full bg-gradient-to-r from-[#693BFF] to-[#A875FF] rounded-full" />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-300">
                            <div className="flex items-center gap-2">
                              <Volume2 size={13} className="text-white" />
                              <span className="text-white/90 font-medium truncate max-w-[190px]">
                                {currentHeroMovie.language}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                openTrailer(
                                  currentHeroVisuals.youtubeId,
                                  currentHeroMovie.title
                                )
                              }
                              className="text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Settings size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thanh tiến trình Countdown Auto-Slide thanh lịch ở đáy Hero */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10 z-20 overflow-hidden">
                    <div
                      key={`hero-bottom-prog-${currentSlide}-${isBannerHovered}`}
                      className="h-full bg-gradient-to-r from-[#693BFF] via-[#A875FF] to-[#FFB52E] hero-progress-fill"
                      style={{
                        animationPlayState: isBannerHovered || inlineVideoPlaying ? 'paused' : 'running',
                      }}
                    />
                  </div>
                </section>
              )}

              {/* SECTION 2: DANH MỤC PHIM TỪ DATABASE (LAZY ON SCROLL) */}
              <LazySection
                loadDelay={0}
                minHeight="420px"
                skeleton={
                  <div className="space-y-4 cinema-skeleton p-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-6 w-36 rounded-lg bg-slate-700/40" />
                        <div className="h-8 w-64 rounded-xl bg-slate-800/60" />
                      </div>
                      <div className="h-4 w-40 rounded bg-slate-700/30" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`rounded-2xl border overflow-hidden ${
                            isDarkMode ? 'bg-[#061020] border-[#172A48]' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="w-full aspect-[3/4] bg-slate-800/60 relative">
                            <div className="absolute top-2.5 left-2.5 h-4 w-14 rounded bg-slate-700/50" />
                          </div>
                          <div className="p-4 space-y-2.5">
                            <div className="h-4 w-3/4 rounded bg-slate-700/40" />
                            <div className="h-3 w-1/2 rounded bg-slate-700/30" />
                            <div className="pt-2 border-t border-slate-700/20 flex justify-between items-center">
                              <div className="h-3 w-14 rounded bg-slate-700/30" />
                              <div className="h-7 w-20 rounded-xl bg-[#693BFF]/30" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <h2 className="theme-text-main text-[19px] font-extrabold tracking-tight">
                      Danh mục phim
                    </h2>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10 text-xs font-semibold backdrop-blur-sm">
                      {[
                        {
                          id: 'now',
                          label: 'Đang chiếu',
                        },
                        {
                          id: 'upcoming',
                          label: 'Sắp chiếu',
                        },
                        {
                          id: 'favorite',
                          label: 'Phim yêu thích',
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id as any)}
                          className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                            activeTab === t.id
                              ? 'text-white shadow-md'
                              : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {activeTab === t.id && (
                            <span className="absolute inset-0 bg-[#693BFF] rounded-lg -z-0 shadow-[0_0_14px_rgba(105,59,255,0.45)]" />
                          )}
                          <span className="relative z-10">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveNav('movies')}
                    className="text-xs font-bold text-[#693BFF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mở trang Phim toàn màn hình</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {loading ? (
                  <div className="theme-card h-[220px] rounded-xl border border-[#15365C]/60 flex items-center justify-center gap-2 text-sm">
                    <Loader2
                      size={18}
                      className="animate-spin text-[#693BFF]"
                    />
                    <span>Đang tải danh sách phim...</span>
                  </div>
                ) : (
                  <div ref={movieGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
                    {displayedMovies.slice(0, 4).map((movie, idx) => {
                      const visuals = getMovieVisuals(movie);
                      const rating = movieRatings[movie.id];
                      const fav = isMovieFavorite(movie.id);
                      const movieShowtimeCount = showtimes.filter(
                        (s) => s.movieId === movie.id
                      ).length;

                      return (
                        <div
                          key={movie.id}
                          onClick={() => openFullMoviePage(movie.id)}
                          onMouseMove={handleCard3DTilt}
                          onMouseLeave={handleCard3DReset}
                          className={`gsap-movie-card cinema-card group relative flex flex-col rounded-2xl border overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer ${
                            isDarkMode
                              ? 'bg-[#061020] border-[#172A48] hover:border-[#693BFF]'
                              : 'bg-white border-slate-200 hover:border-[#693BFF] shadow-sm'
                          }`}
                        >
                          {/* Vệt phản chiếu ánh sáng Specular Glare khi nghiêng 3D */}
                          <div className="cinema-glare" />

                          {/* 1. Phần ảnh Poster hình chữ nhật đứng - trọn vẹn, không bị chữ đè lên */}
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-950">
                            <img
                              src={visuals.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                            />

                            {/* Lớp phủ điện ảnh mịn khi rê chuột */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Nút Play trung tâm xuất hiện thanh lịch */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                              <div className="w-11 h-11 rounded-full bg-[#693BFF]/90 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_20px_rgba(105,59,255,0.7)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <Play size={18} className="fill-white ml-0.5" />
                              </div>
                            </div>

                            {/* Badge độ tuổi & suất chiếu ở góc trên bên trái */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-extrabold text-white">
                                {movie.ageRating}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#693BFF]/90 text-[10px] font-bold text-white shadow-sm">
                                {movieShowtimeCount} suất chiếu
                              </span>
                            </div>

                            {/* Nút Yêu thích ở góc trên bên phải */}
                            <div className="absolute top-2.5 right-2.5 z-10">
                              <button
                                onClick={(e) => handleToggleFavorite(e, movie.id)}
                                title={fav ? 'Bỏ thích' : 'Yêu thích'}
                                className={`heart-pop btn-press w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                  fav
                                    ? 'bg-rose-500 border-rose-400 text-white'
                                    : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:bg-black/80'
                                }`}
                              >
                                <Heart
                                  size={13}
                                  className={fav ? 'fill-white' : ''}
                                />
                              </button>
                            </div>
                          </div>

                          {/* 2. Phần thông tin chữ nằm RIÊNG BIỆT BÊN DƯỚI - hoàn toàn KHÔNG che ảnh poster */}
                          <div className={`p-4 flex-1 flex flex-col justify-between space-y-2.5 ${isDarkMode ? 'bg-[#061020]' : 'bg-white'}`}>
                            <div>
                              <div className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-[#A875FF]' : 'text-[#693BFF]'}`}>
                                {movie.genres?.map((g) => g.name).join(' • ') || movie.director}
                              </div>
                              <h3 className={`text-base font-extrabold truncate group-hover:text-[#693BFF] transition-colors mt-0.5 ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {movie.title}
                              </h3>
                              <div className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                                ĐD: {movie.director || 'Đang cập nhật'}
                              </div>
                            </div>

                            <div className={`flex items-center justify-between pt-2.5 border-t gap-2 ${
                              isDarkMode ? 'border-[#172A48]/70' : 'border-slate-100'
                            }`}>
                              <div className="flex items-center gap-2.5 text-xs min-w-0">
                                <div className={`flex items-center gap-1 font-bold text-xs whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {rating ? (
                                    <>
                                      <Star
                                        size={12}
                                        className="text-[#FFB52E] fill-[#FFB52E] flex-shrink-0"
                                      />
                                      <span>{rating.toFixed(1)}</span>
                                    </>
                                  ) : (
                                    <span className={`text-[10.5px] font-medium whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>
                                      Chưa có đánh giá
                                    </span>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                                  <Clock size={11} className="flex-shrink-0" />
                                  <span>{formatDuration(movie.durationMinutes)}</span>
                                </div>
                              </div>

                              <Link
                                href={`/booking?showtimeId=${getFirstShowtimeIdForMovie(movie.id)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="btn-press px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                              >
                                Đặt vé
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              </LazySection>

              {/* SECTION 3: CINECLUB BANNER (LAZY ON SCROLL) */}
              <LazySection
                loadDelay={0}
                minHeight="72px"
                skeleton={
                  <div className="cinema-skeleton rounded-2xl px-6 py-4 bg-gradient-to-r from-[#241258] via-[#160B3A] to-[#0D152F] border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/10" />
                      <div className="space-y-2">
                        <div className="h-4 w-64 rounded bg-white/20" />
                        <div className="h-3 w-48 rounded bg-white/15" />
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="h-8 w-32 rounded-full bg-white/15" />
                      <div className="h-8 w-36 rounded-full bg-purple-500/40" />
                    </div>
                  </div>
                }
              >
                <section className="rounded-2xl px-6 py-4 bg-gradient-to-r from-[#5E2BFF] via-[#3F1EB5] to-[#190F4C] border border-[#7C4DFF]/45 shadow-[0_6px_24px_rgba(84,41,232,0.28)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-[#FFB52E]">
                      <Crown size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-[15px]">
                        {banners[1]?.title ||
                          'Thành viên CineClub — Tích điểm • Đổi quà • Nhận ưu đãi đặc biệt'}
                      </h3>
                      <p className="text-xs text-[#E0E7FF]/90">
                        {userProfile
                          ? `Xin chào ${userProfile.fullName} • Hạng ${userProfile.memberTier.toUpperCase()} • Bạn đang có ${userProfile.loyaltyPoints} điểm thưởng trong CSDL`
                          : 'Mã giảm giá đang hoạt động: CINEMA20 (20%) • WELCOME30K • VIP50K'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveNav('promos')}
                      className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer"
                    >
                      Xem kho mã giảm giá
                    </button>
                    <button
                      onClick={() => setActiveNav('members')}
                      className="bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <span>Tài khoản & Vé đã đặt</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </section>
              </LazySection>

              {/* SECTION 4: DÀNH CHO BẠN & CHỌN RẠP NHANH (LAZY ON SCROLL) */}
              <LazySection
                loadDelay={0}
                minHeight="170px"
                skeleton={
                  <div className="space-y-3 pb-4 cinema-skeleton p-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-5 w-52 rounded bg-slate-700/40" />
                        <div className="h-3 w-40 rounded bg-slate-700/30" />
                      </div>
                      <div className="h-4 w-44 rounded bg-slate-700/30" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl bg-[#050D1B] border border-[#172A48] h-[142px] p-3 flex flex-col justify-end space-y-1.5">
                          <div className="h-3.5 w-3/4 rounded bg-slate-700/40" />
                          <div className="h-3 w-1/2 rounded bg-slate-700/30" />
                        </div>
                      ))}
                      <div className="rounded-xl bg-[#17143B] border border-[#6037D9]/50 h-[142px] p-3 flex flex-col justify-between">
                        <div className="flex gap-2">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/30" />
                          <div className="space-y-1">
                            <div className="h-3.5 w-24 rounded bg-slate-700/40" />
                            <div className="h-2.5 w-28 rounded bg-slate-700/30" />
                          </div>
                        </div>
                        <div className="h-7 w-32 rounded-full bg-purple-500/40" />
                      </div>
                    </div>
                  </div>
                }
              >
                <section className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="theme-text-main text-[18px] font-extrabold tracking-tight">
                        Dành cho bạn & Hệ thống Rạp chiếu
                      </h2>
                      <p className="theme-text-muted text-xs">
                        {allMovies.length} bộ phim • {cinemas.length} cụm rạp •{' '}
                        {showtimes.length} suất chiếu
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveNav('cinemas')}
                      className="text-xs font-bold text-[#693BFF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Mở trang Rạp & Lịch chiếu toàn màn hình</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                    {allMovies.map((movie) => {
                      const visuals = getMovieVisuals(movie);
                      const rating = movieRatings[movie.id] || 4.8;
                      return (
                        <div
                          key={movie.id}
                          onClick={() => openFullMoviePage(movie.id)}
                          className="group relative cursor-pointer rounded-xl bg-[#050D1B] border border-[#172A48] hover:border-[#693BFF] transition-all duration-200 overflow-hidden h-[142px] hover:-translate-y-0.5"
                        >
                          <img
                            src={visuals.backdrop}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#030916]/95 via-[#030916]/55 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end">
                            <h4 className="text-[13px] font-bold text-white truncate group-hover:text-[#A875FF]">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-[#AAB8D0] mt-0.5">
                              <span className="flex items-center gap-1 font-bold text-white">
                                <Star
                                  size={11}
                                  className="text-[#FFB52E] fill-[#FFB52E]"
                                />
                                {rating.toFixed(1)}
                              </span>
                              <span>{formatDuration(movie.durationMinutes)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </LazySection>
            </div>
          )}

          {/* =================================================================
              VIEW 2: TRANG PHIM & CHI TIẾT ĐIỆN ẢNH TOÀN MÀN HÌNH (`activeNav === 'movies'`)
             ================================================================= */}
          {activeNav === 'movies' && (
            <div key="view-movies" className="page-transition space-y-6 pb-8">
              {/* DANH SÁCH PHIM DẠNG THẺ POSTER CHỮ NHẬT ĐỨNG (Giống Trang Chủ) */}
              <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#172A48]/80 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <Film size={20} className="text-[#693BFF]" />
                      <span>Danh Sách Phim Chiếu Rạp</span>
                    </h2>
                    <p className="text-xs text-[#AAB8D0] mt-1">
                      Chọn một bộ phim để xem chi tiết, trailer và lịch chiếu trực tiếp
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveNav('home')}
                      className="px-4 py-2 rounded-xl bg-[#693BFF]/15 text-[#693BFF] hover:bg-[#693BFF] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Về Trang chủ</span>
                    </button>
                  </div>
                </div>

                {/* Grid các thẻ phim hình chữ nhật đứng chuẩn trang chủ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
                  {allMovies
                    .filter(
                      (m) =>
                        !searchQuery.trim() ||
                        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.genres?.some((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((movie) => {
                      const isCurrent = selectedMovieId === movie.id;
                      const visuals = getMovieVisuals(movie);
                      const rating = movieRatings[movie.id];
                      const fav = isMovieFavorite(movie.id);
                      const movieShowtimeCount = showtimes.filter((s) => s.movieId === movie.id).length;

                      return (
                        <div
                          key={movie.id}
                          onClick={() => openFullMoviePage(movie.id)}
                          onMouseMove={handleCard3DTilt}
                          onMouseLeave={handleCard3DReset}
                          className={`cinema-card group relative flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-md cursor-pointer ${
                            isCurrent
                              ? 'border-[#693BFF] ring-2 ring-[#693BFF] shadow-[0_0_24px_rgba(105,59,255,0.45)]'
                              : isDarkMode
                              ? 'bg-[#061020] border-[#172A48] hover:border-[#693BFF]'
                              : 'bg-white border-slate-200 hover:border-[#693BFF] shadow-sm hover:shadow-lg'
                          }`}
                        >
                          {/* Vệt phản chiếu ánh sáng Specular Glare khi nghiêng 3D */}
                          <div className="cinema-glare" />

                          {/* 1. Phần ảnh Poster hình chữ nhật đứng - không bị chữ đè */}
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-950">
                            <img
                              src={visuals.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                            />

                            {/* Lớp phủ điện ảnh mịn khi rê chuột */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Nút Play trung tâm xuất hiện thanh lịch */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                              <div className="w-11 h-11 rounded-full bg-[#693BFF]/90 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_20px_rgba(105,59,255,0.7)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <Play size={18} className="fill-white ml-0.5" />
                              </div>
                            </div>

                            {/* Badge độ tuổi & suất chiếu */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                              <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-extrabold text-white">
                                {movie.ageRating}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#693BFF]/90 text-[10px] font-bold text-white shadow-sm">
                                {movieShowtimeCount} suất chiếu
                              </span>
                            </div>

                            {/* Nút Yêu thích */}
                            <div className="absolute top-2.5 right-2.5 z-10">
                              <button
                                onClick={(e) => handleToggleFavorite(e, movie.id)}
                                title={fav ? 'Bỏ thích' : 'Yêu thích'}
                                className={`heart-pop btn-press w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                  fav
                                    ? 'bg-rose-500 border-rose-400 text-white'
                                    : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:bg-black/80'
                                }`}
                              >
                                <Heart size={13} className={fav ? 'fill-white' : ''} />
                              </button>
                            </div>

                            {/* Đang chọn banner */}
                            {isCurrent && (
                              <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-[#693BFF]/95 text-center text-[10.5px] font-extrabold text-white shadow-lg backdrop-blur-sm">
                                ● Đang xem chi tiết
                              </div>
                            )}
                          </div>

                          {/* 2. Phần thông tin chữ nằm RIÊNG BIỆT BÊN DƯỚI - hoàn toàn KHÔNG che ảnh */}
                          <div className={`p-3.5 flex-1 flex flex-col justify-between space-y-2 ${isDarkMode ? 'bg-[#061020]' : 'bg-white'}`}>
                            <div>
                              <div className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-[#A875FF]' : 'text-[#693BFF]'}`}>
                                {movie.genres?.map((g) => g.name).join(' • ') || movie.director}
                              </div>
                              <h3 className={`text-sm font-extrabold truncate group-hover:text-[#693BFF] transition-colors mt-0.5 ${
                                isDarkMode ? 'text-white' : 'text-slate-900'
                              }`}>
                                {movie.title}
                              </h3>
                              <div className={`text-[10.5px] truncate mt-0.5 ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                                ĐD: {movie.director || 'Đang cập nhật'}
                              </div>
                            </div>

                            <div className={`flex items-center justify-between pt-2.5 border-t gap-2 ${
                              isDarkMode ? 'border-[#172A48]/70' : 'border-slate-100'
                            }`}>
                              <div className="flex items-center gap-2 text-xs min-w-0">
                                <div className={`flex items-center gap-1 font-bold text-xs whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {rating ? (
                                    <>
                                      <Star size={12} className="text-[#FFB52E] fill-[#FFB52E] flex-shrink-0" />
                                      <span>{rating.toFixed(1)}</span>
                                    </>
                                  ) : (
                                    <span className={`text-[10.5px] font-medium whitespace-nowrap ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-400'}`}>Chưa có đánh giá</span>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                                  <Clock size={11} className="flex-shrink-0" />
                                  <span>{formatDuration(movie.durationMinutes)}</span>
                                </div>
                              </div>

                              <Link
                                href={`/booking?showtimeId=${getFirstShowtimeIdForMovie(movie.id)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="btn-press px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                              >
                                Đặt vé
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 2.5: TRANG CHI TIẾT PHIM RIÊNG BIỆT (`activeNav === 'movie-detail'`)
             ================================================================= */}
          {activeNav === 'movie-detail' && (
            <div key="view-movie-detail" className="page-transition space-y-6 pb-8">
              {/* Thanh điều hướng quay lại trang riêng */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveNav('movies');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#693BFF]/15 hover:bg-[#693BFF] text-[#693BFF] hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>Quay lại danh sách phim</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">Chi tiết phim:</span>
                  <span className="px-3 py-1 rounded-full bg-[#693BFF]/20 border border-[#693BFF]/40 text-white text-xs font-bold truncate max-w-[220px]">
                    {selectedMovieDetail?.title || 'Phim'}
                  </span>
                  <button
                    onClick={() => {
                      setActiveNav('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Về Trang chủ
                  </button>
                </div>
              </div>

              {selectedMovieDetail ? (
                <div id="movie-detail-view" className="space-y-6">
                  {/* Full-width Hero Backdrop của Phim */}
                  <div className="hero-stage-dark relative rounded-3xl overflow-hidden border border-[#1B325B] bg-[#050E1E] min-h-[340px] flex items-end shadow-2xl">
                    <img
                      src={getMovieVisuals(selectedMovieDetail).backdrop}
                      alt={selectedMovieDetail.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030916] via-[#030916]/80 to-black/30" />

                    <div className="relative z-10 w-full p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                        <img
                          src={getMovieVisuals(selectedMovieDetail).poster}
                          alt={selectedMovieDetail.title}
                          className="w-36 h-52 rounded-2xl object-cover border-2 border-[#693BFF] shadow-2xl flex-shrink-0"
                        />
                        <div className="space-y-2.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#693BFF] text-white text-xs font-extrabold">
                              {selectedMovieDetail.status === 'now_showing'
                                ? 'ĐANG CHIẾU'
                                : 'SẮP CHIẾU'}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-xs font-extrabold text-white backdrop-blur-sm">
                              {selectedMovieDetail.ageRating}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-black/60 border border-white/20 text-xs font-bold text-[#93C5FD] backdrop-blur-sm">
                              {selectedMovieDetail.language}
                            </span>
                          </div>

                          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                            {selectedMovieDetail.title}
                          </h1>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#CBD5E1]">
                            {selectedMovieReviews && selectedMovieReviews.totalReviews > 0 ? (
                              <span className="flex items-center gap-1.5 font-extrabold text-[#FFB52E]">
                                <Star size={16} className="fill-[#FFB52E]" />
                                {selectedMovieReviews.averageRating.toFixed(1)} / 5 ({selectedMovieReviews.totalReviews} đánh giá)
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300 font-medium">
                                Chưa có đánh giá từ khán giả
                              </span>
                            )}
                            <span>•</span>
                            <span>
                              {selectedMovieDetail.genres
                                ?.map((g) => g.name)
                                .join(', ')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(
                                selectedMovieDetail.durationMinutes
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              Khởi chiếu:{' '}
                              {formatDateVN(selectedMovieDetail.releaseDate)}
                            </span>
                          </div>

                          <p className="text-sm text-[#E2E8F0] leading-relaxed pt-1">
                            {selectedMovieDetail.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                        <button
                          onClick={(e) =>
                            handleToggleFavorite(e, selectedMovieDetail.id)
                          }
                          className={`px-4 py-3 rounded-xl border font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                            isMovieFavorite(selectedMovieDetail.id)
                              ? 'bg-rose-500 border-rose-400 text-white'
                              : 'bg-black/60 border-white/25 text-white hover:border-rose-400 backdrop-blur-md'
                          }`}
                        >
                          <Heart
                            size={15}
                            className={
                              isMovieFavorite(selectedMovieDetail.id)
                                ? 'fill-white'
                                : ''
                            }
                          />
                          <span>
                            {isMovieFavorite(selectedMovieDetail.id)
                              ? 'Đã yêu thích'
                              : 'Yêu thích'}
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            openTrailer(
                              getMovieVisuals(selectedMovieDetail).youtubeId,
                              selectedMovieDetail.title
                            )
                          }
                          className="px-5 py-3 rounded-xl bg-black/60 hover:bg-black/80 border border-purple-400/50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer backdrop-blur-md"
                        >
                          <Play size={15} className="fill-white" />
                          <span>Xem Trailer HD</span>
                        </button>

                        <Link
                          href={`/booking?showtimeId=${getFirstShowtimeIdForMovie(
                            selectedMovieDetail.id
                          )}`}
                          className="px-6 py-3 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white font-extrabold text-sm shadow-[0_6px_20px_rgba(105,59,255,0.55)] flex items-center gap-2"
                        >
                          <Ticket size={16} />
                          <span>Đặt vé ngay</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Lưới 12 Cột Toàn Màn Hình: Trái (8 cột: Diễn viên + Lịch chiếu) | Phải (4 cột: Đánh giá thực tế từ MySQL) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* CỘT TRÁI (8 CỘT): ĐẠO DIỄN, DIỄN VIÊN & LỊCH CHIẾU CỦA PHIM */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Đạo diễn & Dàn diễn viên từ bảng `movie_casts` */}
                      <ScrollReveal>
                        <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4">
                        <h3 className="theme-text-main text-base font-extrabold flex items-center gap-2">
                          <Film size={18} className="text-[#693BFF]" />
                          <span>
                            Đạo diễn & Diễn viên chính
                          </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {(selectedMovieDetail.casts &&
                          selectedMovieDetail.casts.length > 0
                            ? selectedMovieDetail.casts
                            : [
                                {
                                  id: 0,
                                  roleType: 'director',
                                  personName: selectedMovieDetail.director,
                                  characterName: 'Đạo diễn chính',
                                },
                              ]
                          ).map((c) => {
                            const isDirector =
                              c.roleType === 'director' ||
                              c.characterName?.toLowerCase().includes('đạo diễn') ||
                              c.personName === selectedMovieDetail.director;

                            return (
                              <div
                                key={c.id}
                                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                                  isDirector
                                    ? isDarkMode
                                      ? 'bg-gradient-to-br from-[#24133A] via-[#160E2A] to-[#0D152F] border-amber-400/50 hover:border-amber-400 shadow-[0_6px_24px_rgba(245,158,11,0.2)]'
                                      : 'bg-gradient-to-br from-amber-50 via-purple-50 to-white border-2 border-amber-300 hover:border-amber-500 shadow-md hover:shadow-xl'
                                    : isDarkMode
                                    ? 'bg-gradient-to-br from-[#121B38] via-[#0D142D] to-[#1C113A] border-purple-500/40 hover:border-[#EC4899] shadow-[0_6px_20px_rgba(105,59,255,0.18)]'
                                    : 'bg-gradient-to-br from-violet-50 via-pink-50 to-white border-2 border-purple-200 hover:border-[#693BFF] shadow-md hover:shadow-xl'
                                }`}
                              >
                                {/* Dải viền Neon Graffiti trên đỉnh thẻ */}
                                <div
                                  className={`h-[3.5px] w-full ${
                                    isDirector
                                      ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-[#EC4899]'
                                      : 'bg-gradient-to-r from-[#693BFF] via-[#EC4899] to-[#FFB52E]'
                                  }`}
                                />

                                <div className="p-4 flex items-center gap-3.5">
                                  {/* Avatar nghệ thuật với vòng viền Graffiti Neon */}
                                  <div
                                    className={`relative w-12 h-12 rounded-2xl p-[2px] flex-shrink-0 shadow-md ${
                                      isDirector
                                        ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-[#EC4899]'
                                        : 'bg-gradient-to-tr from-[#693BFF] via-[#EC4899] to-[#FFB52E]'
                                    }`}
                                  >
                                    <div
                                      className={`w-full h-full rounded-[14px] flex items-center justify-center font-black text-base ${
                                        isDirector
                                          ? 'bg-[#180F2A] text-amber-300'
                                          : 'bg-[#0B1226] text-white'
                                      }`}
                                    >
                                      {c.personName.charAt(0)}
                                    </div>
                                    {isDirector && (
                                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-[10px] text-black font-black shadow-sm">
                                        👑
                                      </div>
                                    )}
                                  </div>

                                  {/* Thông tin Tác giả / Đạo diễn & Diễn viên */}
                                  <div className="min-w-0 flex-1">
                                    <div
                                      className={`text-[14.5px] font-black truncate tracking-tight ${
                                        isDirector
                                          ? isDarkMode
                                            ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400'
                                            : 'text-amber-950'
                                          : isDarkMode
                                          ? 'text-white group-hover:text-purple-300 transition-colors'
                                          : 'text-slate-900 group-hover:text-[#693BFF] transition-colors'
                                      }`}
                                    >
                                      {c.personName}
                                    </div>

                                    {/* Nhãn vai trò Graffiti Badge */}
                                    <div className="mt-1 flex items-center gap-1.5">
                                      {isDirector ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10.5px] font-black text-amber-500 dark:text-amber-300 tracking-wider uppercase shadow-xs">
                                          🎬 Đạo diễn
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-[10.5px] font-bold text-purple-600 dark:text-purple-300 tracking-wide truncate max-w-[160px]">
                                          🎭 {c.characterName || 'Diễn viên chính'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      </ScrollReveal>

                      {/* Lịch chiếu trực tiếp của bộ phim này tại các rạp */}
                      <ScrollReveal delay={100}>
                        <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="theme-text-main text-base font-extrabold flex items-center gap-2">
                            <Calendar size={18} className="text-[#693BFF]" />
                            <span>
                              Lịch chiếu trực tiếp của phim {selectedMovieDetail.title}
                            </span>
                          </h3>
                        </div>

                        {showtimes.filter(
                          (s) => s.movieId === selectedMovieDetail.id
                        ).length === 0 ? (
                          <div className="theme-subcard p-6 rounded-xl bg-[#0A1830] border border-[#1B325B] text-sm text-center theme-text-muted">
                            Phim này hiện thuộc danh mục Sắp khởi chiếu (chưa mở
                            bán suất chiếu).
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {showtimes
                              .filter(
                                (s) => s.movieId === selectedMovieDetail.id
                              )
                              .map((st) => (
                                <div
                                  key={st.id}
                                  className="theme-subcard p-4 rounded-xl bg-[#0A1830] border border-[#1B325B] flex items-center justify-between gap-3 hover:border-[#693BFF] transition-colors"
                                >
                                  <div>
                                    <div className="theme-text-main text-sm font-bold">
                                      {st.cinemaName}
                                    </div>
                                    <div className="theme-text-muted text-xs mt-0.5">
                                      {st.roomName} • Định dạng{' '}
                                      <b className="text-[#693BFF]">
                                        {st.screenFormat}
                                      </b>{' '}
                                      • Ngày {formatDateVN(st.showDate)}
                                    </div>
                                  </div>

                                  <Link
                                    href={`/booking?showtimeId=${st.id}`}
                                    className="px-4 py-2 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-extrabold flex items-center gap-1.5 flex-shrink-0 shadow-md"
                                  >
                                    <span>{st.startTime.slice(0, 5)}</span>
                                    <ChevronRight size={13} />
                                  </Link>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      </ScrollReveal>
                    </div>

                    {/* CỘT PHẢI (4 CỘT): ĐÁNH GIÁ & BÌNH LUẬN THỰC TẾ TỪ MYSQL (`reviews`) */}
                    <div className="lg:col-span-4 space-y-6">
                      <ScrollReveal delay={150}>
                        <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="theme-text-main text-base font-extrabold flex items-center gap-2">
                            <Star
                              size={18}
                              className="text-[#FFB52E] fill-[#FFB52E]"
                            />
                            <span>
                              Đánh giá từ Khán giả
                            </span>
                          </h3>
                          {selectedMovieReviews && selectedMovieReviews.totalReviews > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-[#FFB52E]/15 text-[#FFB52E] text-xs font-extrabold">
                              ★ {selectedMovieReviews.averageRating.toFixed(1)} / 5 sao
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-[#94A3B8] text-xs font-medium">
                              Chưa có đánh giá
                            </span>
                          )}
                        </div>

                        <form
                          onSubmit={handleSubmitReview}
                          className="theme-subcard p-3.5 rounded-xl bg-[#0A1830] border border-[#1B325B] space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="theme-text-main text-xs font-bold">
                              Gửi đánh giá
                            </span>
                            <select
                              value={newReviewRating}
                              onChange={(e) =>
                                setNewReviewRating(Number(e.target.value))
                              }
                              className="theme-input bg-[#050E1E] border border-[#243E6C] rounded-lg px-2.5 py-1 text-xs text-[#FFB52E] font-bold"
                            >
                              {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                  ★ {r}/5 sao
                                </option>
                              ))}
                            </select>
                          </div>

                          <textarea
                            rows={2}
                            value={newReviewComment}
                            onChange={(e) =>
                              setNewReviewComment(e.target.value)
                            }
                            placeholder="Nhập cảm nhận của bạn về bộ phim..."
                            className="theme-input w-full bg-[#050E1E] border border-[#1E365F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#693BFF]"
                          />

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="w-full py-2 rounded-lg bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Send size={13} />
                            <span>
                              {submittingReview
                                ? 'Đang lưu...'
                                : 'Gửi đánh giá'}
                            </span>
                          </button>
                        </form>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {selectedMovieReviews?.reviews && selectedMovieReviews.reviews.length > 0 ? (
                            selectedMovieReviews.reviews.map((rev) => (
                              <div
                                key={rev.id}
                                className="theme-subcard p-3.5 rounded-xl bg-[#0A1830] border border-[#192F56] space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="theme-text-main text-xs font-extrabold">
                                    {rev.userFullName}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-[#FFB52E]/15 text-[#FFB52E] text-xs font-extrabold">
                                    ★ {rev.rating}/5 sao
                                  </span>
                                </div>
                                <p className="theme-text-muted text-xs leading-relaxed">
                                  {rev.comment}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs text-[#7F91AF]">
                              Chưa có đánh giá nào cho phim này. Hãy là người đầu tiên gửi đánh giá!
                            </div>
                          )}
                        </div>
                      </div>
                      </ScrollReveal>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="theme-card p-12 text-center rounded-2xl border space-y-4">
                  <Film size={40} className="mx-auto text-slate-500 animate-pulse" />
                  <p className="text-sm font-bold text-slate-300">Đang tải thông tin chi tiết phim...</p>
                  <button
                    onClick={() => setActiveNav('movies')}
                    className="px-4 py-2 rounded-xl bg-[#693BFF] text-white text-xs font-bold cursor-pointer"
                  >
                    Về danh sách phim
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 3: TRANG HỆ THỐNG RẠP & LỊCH CHIẾU TOÀN MÀN HÌNH (`activeNav === 'cinemas'`)
             ================================================================= */}
          {activeNav === 'cinemas' && (
            <div key="view-cinemas" className="page-transition space-y-6 pb-8">
              {/* Thanh tiêu đề & bộ lọc toàn màn hình */}
              <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="theme-text-main text-2xl font-extrabold tracking-tight">
                      Hệ thống Cụm Rạp & Lịch Chiếu Toàn Quốc
                    </h1>
                    <p className="theme-text-muted text-xs mt-1">
                      {cinemas.length} cụm rạp •{' '}
                      {showtimes.length} suất chiếu
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveNav('home')}
                    className="px-4 py-2 rounded-xl bg-[#693BFF]/15 text-[#693BFF] hover:bg-[#693BFF] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Về Trang chủ</span>
                  </button>
                </div>

                {/* Bộ lọc 3 chiều: Thành phố + Ngày chiếu + Định dạng */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2 border-t border-[#172A48]/60">
                  <div className="lg:col-span-4 space-y-1.5">
                    <span className="theme-text-muted text-[11px] font-bold uppercase">
                      1. Khu vực / Thành phố
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedCity === city
                              ? 'bg-[#693BFF] border-[#8B5CF6] text-white'
                              : 'theme-subcard bg-[#0A1830] border-[#1E365F] text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {city === 'ALL' ? 'Tất cả thành phố' : city}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-1.5">
                    <span className="theme-text-muted text-[11px] font-bold uppercase">
                      2. Ngày chiếu trong CSDL
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDate('')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedDate === ''
                            ? 'bg-[#693BFF] border-[#8B5CF6] text-white'
                            : 'theme-subcard bg-[#0A1830] border-[#1E365F] text-[#94A3B8]'
                        }`}
                      >
                        Tất cả ngày
                      </button>
                      {availableDates.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSelectedDate(d)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedDate === d
                              ? 'bg-[#693BFF] border-[#8B5CF6] text-white'
                              : 'theme-subcard bg-[#0A1830] border-[#1E365F] text-[#94A3B8]'
                          }`}
                        >
                          {formatDateVN(d)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-1.5">
                    <span className="theme-text-muted text-[11px] font-bold uppercase">
                      3. Định dạng phòng chiếu
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableFormats.map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setSelectedFormat(fmt)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedFormat === fmt
                              ? 'bg-[#693BFF] border-[#8B5CF6] text-white'
                              : 'theme-subcard bg-[#0A1830] border-[#1E365F] text-[#94A3B8]'
                          }`}
                        >
                          {fmt === 'ALL' ? 'Tất cả' : fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách chi tiết từng cụm rạp & suất chiếu toàn màn hình */}
              <div className="space-y-5">
                {cinemas
                  .filter(
                    (c) => selectedCity === 'ALL' || c.city === selectedCity
                  )
                  .map((cinema) => {
                    const cinemaShowtimes = showtimes.filter(
                      (s) =>
                        s.cinemaId === cinema.id &&
                        (!selectedDate || s.showDate === selectedDate) &&
                        (selectedFormat === 'ALL' ||
                          s.screenFormat === selectedFormat)
                    );

                    return (
                      <ScrollReveal key={cinema.id}>
                        <div
                          className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4 shadow-lg"
                        >
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#172A48]/60">
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-[#693BFF]/20 border border-[#693BFF]/50 flex items-center justify-center text-[#693BFF] flex-shrink-0">
                              <MapPin size={22} />
                            </div>
                            <div>
                              <h2 className="theme-text-main text-lg font-extrabold">
                                {cinema.name}
                              </h2>
                              <p className="theme-text-muted text-xs mt-0.5">
                                {cinema.address}, {cinema.district},{' '}
                                {cinema.city}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-[#693BFF] font-semibold mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {cinema.phone}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {cinema.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="px-3.5 py-1.5 rounded-full bg-[#693BFF]/15 text-[#693BFF] text-xs font-extrabold">
                            {cinemaShowtimes.length} suất chiếu đang mở bán
                          </span>
                        </div>

                        {cinemaShowtimes.length === 0 ? (
                          <p className="theme-text-muted text-xs italic">
                            Không có suất chiếu khớp với bộ lọc tại cụm rạp này.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
                            {cinemaShowtimes.map((st) => {
                              const movie = allMovies.find((m) => m.id === st.movieId);
                              const visuals = movie ? getMovieVisuals(movie) : null;
                              const posterSrc = visuals?.poster || st.moviePosterUrl || '/images/posters/dune2.jpg';
                              const rating = movieRatings[st.movieId];

                              return (
                                <Link
                                  key={st.id}
                                  href={`/booking?showtimeId=${st.id}`}
                                  onMouseMove={handleCard3DTilt}
                                  onMouseLeave={handleCard3DReset}
                                  className={`cinema-card group relative flex flex-col rounded-2xl border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                                    isDarkMode
                                      ? 'bg-[#061020] border-[#172A48] hover:border-[#693BFF]'
                                      : 'bg-white border-slate-200 hover:border-[#693BFF] shadow-sm'
                                  }`}
                                >
                                  {/* Vệt phản chiếu ánh sáng Specular Glare khi nghiêng 3D */}
                                  <div className="cinema-glare" />

                                  {/* 1. Phần ảnh Poster hình chữ nhật đứng (aspect-[3/4]) chuẩn rạp như trang Home */}
                                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-950">
                                    <img
                                      src={posterSrc}
                                      alt={st.movieTitle}
                                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />

                                    {/* Lớp phủ điện ảnh mịn khi rê chuột */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    {/* Icon Chọn ghế trung tâm xuất hiện khi rê chuột */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <div className="px-3.5 py-2 rounded-xl bg-[#693BFF]/90 backdrop-blur-md border border-white/30 flex items-center gap-1.5 text-white text-xs font-bold shadow-[0_0_20px_rgba(105,59,255,0.7)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                        <Ticket size={14} />
                                        <span>Chọn ghế</span>
                                      </div>
                                    </div>

                                    {/* Badge độ tuổi & định dạng phòng ở góc trên bên trái */}
                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/20 text-[10px] font-extrabold text-white">
                                        {movie?.ageRating || st.movieAgeRating || 'P'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-md bg-[#693BFF]/95 text-[10px] font-extrabold text-white shadow-sm">
                                        {st.screenFormat}
                                      </span>
                                    </div>

                                    {/* Giờ chiếu nổi bật badge to ở góc trên bên phải */}
                                    <div className="absolute top-2.5 right-2.5 z-10">
                                      <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#693BFF] to-[#8057FF] text-white text-xs font-black shadow-lg tracking-wider border border-white/20">
                                        {st.startTime.slice(0, 5)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Phần thông tin chữ nằm RIÊNG BIỆT BÊN DƯỚI - không che ảnh */}
                                  <div className={`p-4 flex-1 flex flex-col justify-between space-y-2.5 ${isDarkMode ? 'bg-[#061020]' : 'bg-white'}`}>
                                    <div>
                                      <div className={`text-[11px] font-bold truncate ${isDarkMode ? 'text-[#A875FF]' : 'text-[#693BFF]'}`}>
                                        {st.roomName} • {movie?.genres?.map((g) => g.name).join(' • ') || 'Chiếu rạp'}
                                      </div>
                                      <h3 className={`text-base font-extrabold truncate group-hover:text-[#693BFF] transition-colors mt-0.5 ${
                                        isDarkMode ? 'text-white' : 'text-slate-900'
                                      }`}>
                                        {st.movieTitle}
                                      </h3>
                                      <div className={`text-[11px] truncate mt-0.5 ${isDarkMode ? 'text-[#7F91AF]' : 'text-slate-500 font-medium'}`}>
                                        Ngày {formatDateVN(st.showDate)} • {cinema.name}
                                      </div>
                                    </div>

                                    <div className={`flex items-center justify-between pt-2.5 border-t gap-2 ${
                                      isDarkMode ? 'border-[#172A48]/70' : 'border-slate-100'
                                    }`}>
                                      <div className="flex items-center gap-2.5 text-xs min-w-0">
                                        {rating ? (
                                          <div className={`flex items-center gap-1 font-bold text-xs whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            <Star size={12} className="text-[#FFB52E] fill-[#FFB52E] flex-shrink-0" />
                                            <span>{rating.toFixed(1)}</span>
                                          </div>
                                        ) : (
                                          <div className={`flex items-center gap-1 text-[11px] whitespace-nowrap flex-shrink-0 ${isDarkMode ? 'text-[#AAB8D0]' : 'text-slate-500'}`}>
                                            <Clock size={11} className="flex-shrink-0" />
                                            <span>{formatDuration(st.movieDurationMinutes || movie?.durationMinutes)}</span>
                                          </div>
                                        )}
                                      </div>

                                      <span className="btn-press px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] group-hover:from-[#5729E8] group-hover:to-[#693BFF] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                                        <span>Chọn ghế</span>
                                        <ChevronRight size={13} />
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      </ScrollReveal>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 4: TRANG ƯU ĐÃI & MÃ GIẢM GIÁ TOÀN MÀN HÌNH (`activeNav === 'promos'`)
             ================================================================= */}
          {activeNav === 'promos' && (
            <div key="view-promos" className="page-transition space-y-6 pb-8">
              <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 flex items-center justify-between">
                <div>
                  <h1 className="theme-text-main text-2xl font-extrabold">
                    Chương trình Ưu đãi & Mã giảm giá
                  </h1>
                  <p className="theme-text-muted text-xs mt-1">
                    Vòng quay may mắn đổi điểm thưởng và các mã ưu đãi độc quyền
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('home')}
                  className="px-4 py-2 rounded-xl bg-[#693BFF]/15 text-[#693BFF] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Về Trang chủ</span>
                </button>
              </div>

              {/* VÒNG QUAY MAY MẮN CINEWHEEL TRONG PHẦN ƯU ĐÃI */}
              <LuckyWheel
                userPoints={userProfile?.loyaltyPoints ?? 0}
                isLoggedIn={!!userProfile}
                onRequireLogin={() => {
                  setAuthModalTab('login');
                  setShowAuthModal(true);
                }}
                onUpdatePoints={(newBal) => {
                  if (userProfile) {
                    setUserProfile({ ...userProfile, loyaltyPoints: newBal });
                  }
                }}
              />

              {/* THÔNG BÁO ĐỔI VOUCHER THÀNH CÔNG HOẶC THẤT BẠI */}
              {redeemSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-3 text-sm font-semibold animate-fade-in shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <span>{redeemSuccess.message}</span>
                  </div>
                  <button
                    onClick={() => setRedeemSuccess(null)}
                    className="p-1 text-emerald-400/80 hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              {redeemError && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-3 text-sm font-semibold animate-fade-in shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle size={20} className="text-rose-400 shrink-0" />
                    <span>{redeemError}</span>
                  </div>
                  <button
                    onClick={() => setRedeemError(null)}
                    className="p-1 text-rose-400/80 hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* TIÊU ĐỀ KHO MÃ VOUCHER & ĐỔI ĐIỂM */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h2 className="theme-text-main text-lg font-extrabold flex items-center gap-2">
                    <Gift size={20} className="text-[#693BFF]" />
                    <span>Kho Mã Ưu Đãi & Đổi Điểm Thưởng</span>
                  </h2>
                  <p className="theme-text-muted text-xs mt-0.5">
                    Sử dụng điểm tích lũy CineClub để đổi ngay các mã giảm giá hấp dẫn
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-2 self-start sm:self-auto">
                  <span className="theme-text-muted">Điểm của bạn:</span>
                  <span className="text-amber-400 font-extrabold flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-400" />
                    {userProfile?.loyaltyPoints ?? 0} pts
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {coupons.map((cp) => {
                  const isPercentage =
                    (cp.type || cp.discountType) === 'percentage';
                  const rawValue = Number(cp.value ?? cp.discountValue ?? 0);
                  const minOrder = Number(
                    cp.minOrderAmount ?? cp.minOrderValue ?? 0
                  );
                  const maxDiscount = Number(
                    cp.maxDiscount ?? cp.maxDiscountAmount ?? 0
                  );
                  const badgeText = isPercentage
                    ? `Giảm ${rawValue}%`
                    : `-${rawValue.toLocaleString('vi-VN')}đ`;

                  const userPoints = userProfile?.loyaltyPoints ?? 0;
                  const hasEnoughPoints = userPoints >= cp.pointsCost;
                  const isRedeeming = isRedeemingId === cp.id;

                  return (
                    <div
                      key={cp.id}
                      className="cinema-card theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 flex flex-col justify-between gap-5 shadow-lg transition-all duration-300 hover:border-[#693BFF]/40"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#693BFF]/20 text-[#693BFF] text-xs font-extrabold">
                            {badgeText}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1">
                            <Sparkles size={11} className="text-amber-400" />
                            Cần {cp.pointsCost} pts
                          </span>
                        </div>

                        <div>
                          <h3 className="theme-text-main text-lg font-extrabold tracking-wide">
                            Mã ưu đãi: {cp.code}
                          </h3>
                          <p className="theme-text-muted text-xs leading-relaxed mt-1">
                            {cp.description}
                          </p>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-[#172A48]/60 text-[11px]">
                          <p className="text-[#693BFF] font-semibold flex items-center gap-1.5">
                            <span>• Đơn tối thiểu:</span>
                            <strong>
                              {minOrder.toLocaleString('vi-VN')}đ
                            </strong>
                          </p>
                          {maxDiscount > 0 && isPercentage && (
                            <p className="theme-text-muted flex items-center gap-1.5">
                              <span>• Mức giảm tối đa:</span>
                              <strong>
                                {maxDiscount.toLocaleString('vi-VN')}đ
                              </strong>
                            </p>
                          )}
                          <p className="text-[11px] theme-text-muted flex items-center gap-1.5">
                            <span>• Lượt đã dùng:</span>
                            <span>
                              {cp.usedCount}/{cp.usageLimit || '∞'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#172A48]/50 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <code className="px-3 py-1.5 rounded-lg bg-[#693BFF]/15 text-[#693BFF] font-mono text-xs font-extrabold select-all">
                            {cp.code}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(cp.code);
                              setCopiedCode(cp.code);
                              setTimeout(() => setCopiedCode(null), 2000);
                            }}
                            className="btn-press px-3 py-1.5 rounded-lg bg-[#172A48] hover:bg-[#203a63] theme-text-main text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Sao chép mã vào bộ nhớ tạm"
                          >
                            {copiedCode === cp.code ? (
                              <>
                                <Check size={13} className="text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* NÚT ĐỔI ĐIỂM THƯỞNG LẤY MÃ */}
                        <button
                          onClick={() => handleRedeemCoupon(cp)}
                          disabled={isRedeeming}
                          className={`btn-press w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md ${
                            !userProfile
                              ? 'bg-[#693BFF] hover:bg-[#8057FF] text-white'
                              : hasEnoughPoints
                              ? 'bg-gradient-to-r from-amber-500 to-[#693BFF] hover:brightness-110 text-white'
                              : 'bg-[#172A48]/80 text-[#AAB8D0] hover:bg-[#172A48]'
                          }`}
                        >
                          {isRedeeming ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Đang đổi điểm...</span>
                            </>
                          ) : !userProfile ? (
                            <>
                              <LogIn size={13} />
                              <span>Đăng nhập để đổi ({cp.pointsCost} pts)</span>
                            </>
                          ) : hasEnoughPoints ? (
                            <>
                              <Sparkles size={13} className="text-amber-200" />
                              <span>Đổi mã ngay ({cp.pointsCost} pts)</span>
                            </>
                          ) : (
                            <>
                              <Lock size={13} className="text-rose-400" />
                              <span>Cần {cp.pointsCost} pts (Thiếu {cp.pointsCost - userPoints} pts)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {banners.length > 0 && (
                <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4">
                  <h2 className="theme-text-main text-base font-extrabold">
                    Chiến dịch quảng cáo đang diễn ra
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((bn) => (
                      <div
                        key={bn.id}
                        className="theme-subcard p-4 rounded-xl bg-[#0A1830] border border-[#1E365F] flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#693BFF] uppercase">
                            Banner #{bn.id} • Target: {bn.targetType}
                          </div>
                          <div className="theme-text-main text-sm font-extrabold mt-0.5">
                            {bn.title}
                          </div>
                          <div className="theme-text-muted text-xs mt-0.5">
                            Link đích: {bn.linkUrl}
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveNav('movies')}
                          className="px-3.5 py-2 rounded-xl bg-[#693BFF] text-white text-xs font-bold flex-shrink-0 cursor-pointer"
                        >
                          Khám phá
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              VIEW 5: TRANG THÀNH VIÊN, THÔNG BÁO, ĐIỂM THƯỞNG & DASHBOARD TOÀN MÀN HÌNH (`activeNav === 'members'`)
             ================================================================= */}
          {activeNav === 'members' && !userProfile && (
            <div key="view-members-guest" className="page-transition max-w-5xl mx-auto py-6 space-y-6">
              {/* 1. HERO BANNER CÂN ĐỐI KÈM THẺ CINEPASS 3D */}
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-[#22436D] bg-gradient-to-br from-[#0F1E3D] via-[#09152E] to-[#040B18] shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Trái: Nội dung chào mừng & Kêu gọi hành động */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#693BFF]/20 border border-[#693BFF]/40 text-[#C4B5FD] text-xs font-bold">
                      <Sparkles size={14} className="text-[#FFB52E]" />
                      <span>HỘI VIÊN ĐẶC QUYỀN CINECLUB</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                      Chào Mừng Đến Với CineClub
                    </h1>

                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      Đăng nhập hoặc đăng ký tài khoản thành viên để tận hưởng trọn vẹn đặc quyền điện ảnh: tích điểm đổi vé, voucher bắp nước và xem lại toàn bộ lịch sử vé điện tử có mã QR check-in tại quầy.
                    </p>

                    {/* Nút Đăng nhập & Đăng ký nhanh */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setAuthModalTab('login');
                          setShowAuthModal(true);
                        }}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white text-xs font-extrabold shadow-lg shadow-[#693BFF]/30 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn size={15} />
                        <span>Đăng nhập ngay</span>
                      </button>

                      <button
                        onClick={() => {
                          setAuthModalTab('register');
                          setShowAuthModal(true);
                        }}
                        className="px-6 py-2.5 rounded-full border border-[#3E5C8D] hover:border-[#693BFF] hover:bg-[#693BFF]/15 text-[#C4B5FD] hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus size={15} />
                        <span>Đăng ký tài khoản</span>
                      </button>
                    </div>
                  </div>

                  {/* Phải: Mô phỏng Thẻ VIP CineClub Cao Cấp (Lấp đầy khoảng trống cân đối) */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-[340px] rounded-2xl p-6 bg-gradient-to-br from-[#1E1145] via-[#101F42] to-[#09152E] border border-[#693BFF]/50 shadow-[0_20px_50px_rgba(105,59,255,0.25)] flex flex-col justify-between h-[210px] relative overflow-hidden group hover:border-[#A875FF] transition-all">
                      {/* Gradient glow decoration */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#693BFF]/30 rounded-full blur-2xl" />
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#EC4899]/20 rounded-full blur-2xl" />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FFB52E] to-[#F59E0B] flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                            <Crown size={15} />
                          </div>
                          <span className="font-extrabold text-white text-xs tracking-wider">CINEPASS VIP</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFB52E]/20 text-[#FFD439] text-[10px] font-black tracking-wide border border-[#FFB52E]/40">
                          PLATINUM
                        </span>
                      </div>

                      <div className="space-y-1 relative z-10">
                        <div className="text-[10px] text-[#8FA2C2] uppercase tracking-widest font-mono">Card Member</div>
                        <div className="text-base font-mono font-bold text-white tracking-widest">
                          8868 •••• •••• 9999
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#AAB8D0] relative z-10 pt-2 border-t border-[#1E3A66]">
                        <div>
                          <div className="text-[9px] text-[#64748B] uppercase">Tích lũy hoàn điểm</div>
                          <div className="font-bold text-[#FFB52E]">Lên tới 10% / vé</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[#64748B] uppercase">Hạn thẻ</div>
                          <div className="font-bold text-white">12/2028</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CÁC ĐẶC QUYỀN HỘI VIÊN CHÍNH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#061020] border border-[#172A48] hover:border-[#693BFF]/60 transition-all shadow-md group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-2xl mb-3.5 group-hover:scale-110 transition-transform">
                    🎟️
                  </div>
                  <h3 className="text-sm font-bold text-white">Tích điểm đổi vé</h3>
                  <p className="text-xs text-[#8FA2C2] mt-1.5 leading-relaxed">
                    Tích lũy đến 10% giá trị mọi đơn vé xem phim. Điểm tích lũy quy đổi trực tiếp thành vé miễn phí và combo bắp nước tại mọi rạp.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#061020] border border-[#172A48] hover:border-[#693BFF]/60 transition-all shadow-md group">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-2xl mb-3.5 group-hover:scale-110 transition-transform">
                    🎁
                  </div>
                  <h3 className="text-sm font-bold text-white">Quà tặng sinh nhật</h3>
                  <p className="text-xs text-[#8FA2C2] mt-1.5 leading-relaxed">
                    Nhận ngay voucher Combo Bắp Ngọt & Nước Ngọt miễn phí trong tháng sinh nhật của bạn cùng nhiều ưu đãi xem phim độc quyền.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#061020] border border-[#172A48] hover:border-[#693BFF]/60 transition-all shadow-md group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl mb-3.5 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <h3 className="text-sm font-bold text-white">Vé QR không in</h3>
                  <p className="text-xs text-[#8FA2C2] mt-1.5 leading-relaxed">
                    Không lo mất vé giấy hay xếp hàng dài chờ in vé. Chỉ cần đưa mã QR điện tử trên điện thoại quét trực tiếp tại cửa soát vé siêu tốc.
                  </p>
                </div>
              </div>

              {/* 3. BẢNG SO SÁNH HẠNG THÀNH VIÊN */}
              <div className="p-6 rounded-2xl bg-[#061020] border border-[#172A48] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Các Hạng Hội Viên CineClub</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Nâng hạng tự động dựa trên tổng chi tiêu tích lũy</p>
                  </div>
                  <span className="text-xs text-[#A875FF] font-semibold">Tự động kích hoạt khi đăng ký</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-[#0A1830] border border-[#1E365F]">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Hạng Bạc (Silver)</span>
                      <span className="text-[10px] text-[#64748B]">Mặc định</span>
                    </div>
                    <div className="text-lg font-black text-white mt-1">Hoàn 5%</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">• 1 Voucher sinh nhật<br />• Đặt vé trực tuyến 24/7</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A1830] border border-[#3E5C8D]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#FFD439]">
                      <span>Hạng Vàng (Gold)</span>
                      <span className="text-[10px] text-[#FFD439]">Từ 500 điểm</span>
                    </div>
                    <div className="text-lg font-black text-amber-400 mt-1">Hoàn 8%</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">• Combo sinh nhật cao cấp<br />• Ưu tiên chọn ghế VIP</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#1C133E] to-[#0A1830] border border-[#693BFF]/60">
                    <div className="flex items-center justify-between text-xs font-bold text-[#C4B5FD]">
                      <span>Bạch Kim (Platinum)</span>
                      <span className="text-[10px] text-[#C4B5FD]">Từ 1500 điểm</span>
                    </div>
                    <div className="text-lg font-black text-[#A875FF] mt-1">Hoàn 10%</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1">• Miễn phí nâng ghế Suite<br />• Quà tri ân độc quyền</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === 'members' && userProfile && (
            <div key="view-members-auth" className="page-transition space-y-6 pb-8">
              <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#693BFF] to-[#A875FF] flex items-center justify-center text-2xl font-extrabold text-white shadow-lg">
                    {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="theme-text-main text-2xl font-extrabold">
                        {userProfile.fullName}
                      </h1>
                      <span className="px-3 py-0.5 rounded-full bg-[#FFB52E]/20 text-[#FFB52E] text-xs font-extrabold uppercase">
                        ★ Hạng {userProfile.memberTier || 'SILVER'} ({userProfile.role || 'CUSTOMER'})
                      </span>
                    </div>
                    <p className="theme-text-muted text-xs mt-1">
                      Email: {userProfile.email} • SĐT: {userProfile.phone || 'Chưa cập nhật'} • Điểm thưởng tích lũy:{' '}
                      <b className="text-[#FFB52E]">
                        <AnimatedNumber value={userProfile.loyaltyPoints ?? 0} /> điểm
                      </b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Nút Đăng xuất tài khoản */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>

              {/* 3 CỘT CHỨC NĂNG BACKEND: CẬP NHẬT HỒ SƠ (`PUT /api/v1/users/profile`) + ĐIỂM THƯỞNG (`GET /api/v1/users/loyalty`) + THÔNG BÁO (`GET /api/v1/notifications`) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Cột 1: Cập nhật thông tin cá nhân */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setSavingProfile(true);
                      setProfileMsg(null);
                      const updated = await cineBookingApi.updateMyProfile({
                        fullName: editFullName,
                        phone: editPhone,
                      });
                      setUserProfile(updated);
                      setProfileMsg(
                        'Đã lưu thông tin cá nhân thành công!'
                      );
                    } catch (err: any) {
                      setProfileMsg(
                        err?.message || 'Lỗi cập nhật thông tin cá nhân'
                      );
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-5 space-y-3.5"
                >
                  <h3 className="theme-text-main text-sm font-extrabold">
                    Cập nhật hồ sơ cá nhân
                  </h3>
                  <div className="space-y-1">
                    <label className="theme-text-muted text-xs">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="theme-input w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs font-bold text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="theme-text-muted text-xs">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="theme-input w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs font-bold text-white"
                    />
                  </div>
                  {profileMsg && (
                    <div className="text-xs text-emerald-400 font-semibold">
                      {profileMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-bold cursor-pointer"
                  >
                    {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>

                {/* Cột 2: Lịch sử Điểm thưởng Thành viên (`GET /api/v1/users/loyalty`) */}
                <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="theme-text-main text-sm font-extrabold">
                      Lịch sử điểm thưởng
                    </h3>
                    <span className="text-xs font-extrabold text-[#FFB52E]">
                      {loyaltySummary?.loyaltyPoints ??
                        userProfile?.loyaltyPoints ??
                        0}{' '}
                      điểm
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
                    {!loyaltySummary?.recentTransactions?.length ? (
                      <div className="text-xs theme-text-muted py-4 text-center">
                        Chưa có giao dịch điểm thưởng nào.
                      </div>
                    ) : (
                      loyaltySummary.recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="theme-subcard p-2.5 rounded-xl bg-[#0A1830] border border-[#1E365F] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="theme-text-main font-bold truncate">
                              {tx.description}
                            </div>
                            <div className="theme-text-muted text-[10.5px]">
                              Số dư sau GD: {tx.balanceAfter} điểm
                            </div>
                          </div>
                          <span
                            className={`font-extrabold whitespace-nowrap ${
                              tx.points >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {tx.points >= 0 ? `+${tx.points}` : tx.points} điểm
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cột 3: Hộp thư Thông báo (`GET /api/v1/notifications`) */}
                <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="theme-text-main text-sm font-extrabold">
                      Thông báo
                    </h3>
                    {notifications.some((n) => !n.isRead) && (
                      <button
                        onClick={async () => {
                          await cineBookingApi.markAllNotificationsAsRead();
                          const fresh =
                            await cineBookingApi.getMyNotifications();
                          setNotifications(fresh || []);
                        }}
                        className="text-[11px] font-bold text-[#693BFF] hover:underline cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-[210px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-xs theme-text-muted py-4 text-center">
                        Chưa có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`theme-subcard p-2.5 rounded-xl border text-xs space-y-1 ${
                            n.isRead
                              ? 'bg-[#0A1830]/60 border-[#1E365F]'
                              : 'bg-[#0A1830] border-[#693BFF]'
                          }`}
                        >
                          <div className="theme-text-main font-bold">
                            {n.title}
                          </div>
                          <div className="theme-text-muted text-[11px] leading-snug">
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách đơn đặt vé thực tế toàn màn hình */}
              <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-6 space-y-4">
                <h2 className="theme-text-main text-lg font-extrabold">
                  Lịch sử đặt vé
                </h2>

                {userBookings.length === 0 ? (
                  <div className="p-8 text-center theme-text-muted text-sm">
                    Tài khoản này chưa có đơn đặt vé nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBookings.map((b) => (
                      <div
                        key={b.id}
                        className="theme-subcard p-4 rounded-2xl bg-[#0A1830] border border-[#243E6C] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-extrabold text-[#693BFF]">
                              #{b.bookingCode}
                            </span>
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
                          </div>

                          <h3 className="theme-text-main text-base font-extrabold">
                            {b.movieTitle}
                          </h3>
                          <p className="theme-text-muted text-xs">
                            {b.cinemaName} • {b.roomName} ({b.screenFormat})
                          </p>
                          <p className="theme-text-muted text-xs">
                            Suất: {b.startTime?.slice(0, 5)} • Ngày{' '}
                            {formatDateVN(b.showDate)}
                          </p>
                          {b.tickets && b.tickets.length > 0 && (
                            <p className="text-xs font-bold text-[#FFB52E]">
                              Ghế: {b.tickets.map((t) => t.seatCode).join(', ')}{' '}
                              — {Number(b.totalAmount).toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#172A48]/40">
                          {b.status === 'confirmed' ? (
                            <button
                              onClick={async () => {
                                setViewingTicketBooking(b);
                                const hist = await cineBookingApi
                                  .getBookingHistory(b.id)
                                  .catch(() => []);
                                setViewingBookingHistory(hist || []);
                              }}
                              className="py-2 text-center rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-bold text-white cursor-pointer"
                            >
                              Xem Vé QR & Lịch sử
                            </button>
                          ) : b.status === 'pending' ? (
                            <button
                              onClick={async () => {
                                const remSec = b.holdExpiresAt
                                  ? Math.max(
                                      0,
                                      Math.floor(
                                        (new Date(b.holdExpiresAt).getTime() -
                                          Date.now()) /
                                          1000
                                      )
                                    )
                                  : 0;
                                if (b.holdExpiresAt && remSec <= 0) {
                                  alert(
                                    `Đơn giữ ghế #${b.bookingCode} đã quá 5 phút và đã tự động hết hạn. Ghế đã được giải phóng.`
                                  );
                                  const fresh =
                                    await cineBookingApi.getUserBookings(
                                      userProfile?.id || 2
                                    );
                                  setUserBookings(fresh || []);
                                  return;
                                }
                                try {
                                  const zp =
                                    await cineBookingApi.createZaloPayOrder(
                                      b.id
                                    );
                                  setHomeZaloPayModal({
                                    bookingId: b.id,
                                    bookingCode: b.bookingCode,
                                    appTransId: zp.appTransId,
                                    orderUrl: zp.orderUrl,
                                    qrCode: zp.qrCode || zp.orderUrl,
                                    amount: Number(zp.amount || b.totalAmount),
                                  });
                                  setHomeZaloPayCountdown(
                                    remSec > 0 ? remSec : 300
                                  );
                                  setHomeZaloPayMsg(
                                    'Quét mã QR ZaloPay Sandbox hoặc bấm kiểm tra trạng thái sau khi thanh toán.'
                                  );
                                } catch (err: any) {
                                  alert(
                                    err?.message ||
                                      'Không thể tạo mã QR ZaloPay Sandbox'
                                  );
                                  const fresh =
                                    await cineBookingApi.getUserBookings(
                                      userProfile?.id || 2
                                    );
                                  setUserBookings(fresh || []);
                                }
                              }}
                              className="py-2 text-center rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-xs font-bold text-white cursor-pointer"
                            >
                              Mở Mã QR ZaloPay
                            </button>
                          ) : (
                            <Link
                              href={`/booking?showtimeId=${b.showtimeId}`}
                              className="py-2 text-center rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-bold text-white"
                            >
                              Đặt lại suất này
                            </Link>
                          )}

                          {b.status === 'pending' && (
                            <button
                              onClick={async () => {
                                try {
                                  await cineBookingApi.cancelUnpaidBooking(
                                    b.id,
                                    'Khách hàng hủy đơn giữ ghế từ trang Thành viên'
                                  );
                                  const freshBookings =
                                    await cineBookingApi.getUserBookings(
                                      userProfile?.id || 2
                                    );
                                  setUserBookings(freshBookings);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 text-xs font-bold cursor-pointer"
                            >
                              Hủy giữ ghế
                            </button>
                          )}
                          {b.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                try {
                                  await cineBookingApi.requestAndProcessRefund(
                                    b.id,
                                    'Khách hàng hủy vé từ trang Thành viên'
                                  );
                                  const [freshUser, freshBookings, notifs, loyalty] =
                                    await Promise.all([
                                      cineBookingApi.getMe().catch(() => null),
                                      cineBookingApi
                                        .getUserBookings(userProfile?.id || 2)
                                        .catch(() => []),
                                      cineBookingApi
                                        .getMyNotifications()
                                        .catch(() => []),
                                      cineBookingApi
                                        .getMyLoyaltySummary()
                                        .catch(() => null),
                                    ]);
                                  if (freshUser) setUserProfile(freshUser);
                                  setUserBookings(freshBookings);
                                  setNotifications(notifs || []);
                                  setLoyaltySummary(loyalty);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-400 text-xs font-bold cursor-pointer"
                            >
                              Hủy & Hoàn tiền
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BẢO MẬT & TÀI KHOẢN KHÁCH HÀNG: ĐỔI MẬT KHẨU & ĐĂNG KÝ TÀI KHOẢN MỚI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Đổi mật khẩu tài khoản cá nhân */}
                <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-5 space-y-3">
                  <h3 className="theme-text-main text-sm font-extrabold flex items-center gap-2">
                    <Tag size={15} className="text-[#693BFF]" />
                    <span>Đổi mật khẩu tài khoản cá nhân</span>
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        setPasswordMsg(null);
                        await cineBookingApi.changePassword({
                          currentPassword,
                          newPassword,
                          confirmPassword,
                        });
                        setPasswordMsg('Đổi mật khẩu thành công!');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      } catch (err: any) {
                        setPasswordMsg(err?.message || 'Lỗi đổi mật khẩu');
                      }
                    }}
                    className="space-y-2.5"
                  >
                    <input
                      type="password"
                      required
                      placeholder="Mật khẩu hiện tại"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="theme-input w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        required
                        placeholder="Mật khẩu mới (>= 6 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="theme-input w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="theme-input w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white"
                      />
                    </div>
                    {passwordMsg && (
                      <div className="text-[11.5px] font-bold text-emerald-400">
                        {passwordMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Cập nhật mật khẩu mới
                    </button>
                  </form>
                </div>

                {/* 2. Cấp bậc hội viên & Đặc quyền */}
                <div className="theme-card rounded-2xl bg-[#061020] border border-[#172A48] p-5 space-y-3">
                  <h3 className="theme-text-main text-sm font-extrabold flex items-center gap-2">
                    <Crown size={15} className="text-[#FFB52E]" />
                    <span>Cấp bậc hội viên & Đặc quyền tích lũy</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#0A1830] border border-[#1E365F] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#A875FF]">Hạng SILVER (Bạc)</div>
                        <div className="text-[11px] theme-text-muted mt-0.5">Tích lũy 5% giá trị đơn vé • Quà tặng sinh nhật</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#693BFF]/20 text-[#A875FF] font-bold">Mặc định</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A1830] border border-[#1E365F] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#FFB52E]">Hạng GOLD (Vàng)</div>
                        <div className="text-[11px] theme-text-muted mt-0.5">Tích lũy 10% giá trị đơn vé • Miễn phí combo bắp nước</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFB52E]/20 text-[#FFB52E] font-bold">&gt; 500 điểm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A1830] border border-[#1E365F] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-rose-400">Hạng PLATINUM (Bạch Kim)</div>
                        <div className="text-[11px] theme-text-muted mt-0.5">Tích lũy 15% • Quà tặng độc quyền & Suất chiếu sớm VIP</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">&gt; 2.000 điểm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* =================================================================
            2.3 FOOTER DÀNH CHO NGƯỜI DÙNG (CINEBOOKING OFFICIAL FOOTER)
           ================================================================= */}
        <footer
          className={`border-t transition-colors mt-auto ${
            isDarkMode
              ? 'bg-[#030814] border-[#14233D] text-[#94A3B8]'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {/* Dải Banner Phục vụ & Công nghệ Điện ảnh đỉnh cao */}
          <div className={`border-b py-5 px-6 ${
            isDarkMode ? 'border-[#14233D] bg-[#050D1D]/70' : 'border-slate-200 bg-white/70'
          }`}>
            <div className="max-w-[1536px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#693BFF]/15 border border-[#693BFF]/40 flex items-center justify-center text-[#A875FF] flex-shrink-0">
                  <Ticket size={20} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Đặt Vé Tức Thì 24/7</div>
                  <div className="text-[11px] text-[#64748B]">Chọn ghế & QR Code trong 30s</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFB52E]/15 border border-[#FFB52E]/40 flex items-center justify-center text-[#FFB52E] flex-shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Công Nghệ Chuẩn IMAX</div>
                  <div className="text-[11px] text-[#64748B]">Dolby Atmos & 4DX Motion</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Thanh Toán Bảo Mật</div>
                  <div className="text-[11px] text-[#64748B]">ZaloPay, MoMo, Visa/Master</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <Headphones size={20} />
                </div>
                <div>
                  <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hỗ Trợ Khách Hàng</div>
                  <div className="text-[11px] text-[#64748B]">Hotline: 1900 6868 (8:00 - 24:00)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Khối Nội dung Chính của Footer: 5 Cột Thông tin */}
          <div className="max-w-[1536px] mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Cột 1: Thương hiệu CineBooking & Thông tin liên hệ */}
              <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#693BFF] to-[#A875FF] flex items-center justify-center shadow-md">
                    <Film size={18} className="text-white" />
                  </div>
                  <div>
                    <span className={`font-extrabold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      CineBooking
                    </span>
                    <span className="block text-[9.5px] font-black uppercase tracking-wider text-[#A875FF]">
                      Hệ Thống Đặt Vé Phim Quốc Tế
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-[#7C8DA6]">
                  Nền tảng đặt vé xem phim trực tuyến hiện đại hàng đầu Việt Nam. Kết nối trực tiếp các cụm rạp hàng đầu (CGV, Lotte, Galaxy, BHD Star) với hệ thống giữ chỗ tức thì, đặt trước bắp nước và thanh toán an toàn tiện lợi.
                </p>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#693BFF] flex-shrink-0 mt-0.5" />
                    <span>Tầng 12, Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>Hotline: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>1900 6868</strong> (1.000đ/phút)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={15} className="text-amber-400 flex-shrink-0" />
                    <span>Email: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>hotro@cinebooking.vn</strong></span>
                  </div>
                </div>
              </div>

              {/* Cột 2: Khám Phá Điện Ảnh */}
              <div className="space-y-3">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Khám Phá Điện Ảnh
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => {
                        setActiveNav('movies');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#693BFF] transition-colors cursor-pointer text-left"
                    >
                      Phim đang chiếu rạp
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveNav('movies');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#693BFF] transition-colors cursor-pointer text-left"
                    >
                      Phim sắp khởi chiếu (Sneak Show)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveNav('cinemas');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#693BFF] transition-colors cursor-pointer text-left"
                    >
                      Lịch chiếu rạp toàn quốc
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveNav('promos');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#693BFF] transition-colors cursor-pointer text-left"
                    >
                      Ưu đãi & Voucher bắp nước
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveNav('members');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#693BFF] transition-colors cursor-pointer text-left"
                    >
                      Hội viên đặc quyền CineClub
                    </button>
                  </li>
                </ul>
              </div>

              {/* Cột 3: Chính Sách & Hỗ Trợ */}
              <div className="space-y-3">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Chính Sách & Điều Khoản
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <span className="hover:text-[#693BFF] transition-colors cursor-pointer">
                      Điều khoản sử dụng dịch vụ
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-[#693BFF] transition-colors cursor-pointer">
                      Chính sách bảo mật thông tin
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-[#693BFF] transition-colors cursor-pointer">
                      Quy chế hoạt động sàn TMĐT
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-[#693BFF] transition-colors cursor-pointer">
                      Chính sách đổi trả & hoàn tiền vé
                    </span>
                  </li>
                  <li>
                    <span className="hover:text-[#693BFF] transition-colors cursor-pointer">
                      Quy định phân loại độ tuổi phim
                    </span>
                  </li>
                </ul>
              </div>

              {/* Cột 4: Mạng Xã Hội & Kênh Truyền Thông */}
              <div className="space-y-3.5">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Kết Nối Với Chúng Tôi
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer group ${
                      isDarkMode
                        ? 'bg-[#08152B] border-[#172A48] hover:border-[#1877F2]/70 hover:bg-[#1877F2]/10 text-white'
                        : 'bg-white border-slate-200 hover:border-[#1877F2] hover:bg-blue-50/60 text-slate-800'
                    }`}
                    title="Theo dõi Fanpage CineBooking trên Facebook"
                  >
                    <svg className="w-6 h-6 text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[11px] font-bold">Facebook</span>
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer group ${
                      isDarkMode
                        ? 'bg-[#08152B] border-[#172A48] hover:border-pink-500/70 hover:bg-pink-500/10 text-white'
                        : 'bg-white border-slate-200 hover:border-black hover:bg-slate-50 text-slate-800'
                    }`}
                    title="Kênh TikTok chính thức CineBooking"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" style={{ filter: isDarkMode ? 'drop-shadow(-1.5px -1.5px 0 #00F2FE) drop-shadow(1.5px 1.5px 0 #FE2C55)' : 'none', color: isDarkMode ? '#FFFFFF' : '#000000' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    <span className="text-[11px] font-bold">TikTok</span>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer group ${
                      isDarkMode
                        ? 'bg-[#08152B] border-[#172A48] hover:border-[#FF0000]/70 hover:bg-[#FF0000]/10 text-white'
                        : 'bg-white border-slate-200 hover:border-[#FF0000] hover:bg-rose-50/60 text-slate-800'
                    }`}
                    title="Kênh YouTube Trailer & Hậu Trường CineBooking"
                  >
                    <svg className="w-6 h-6 text-[#FF0000] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="text-[11px] font-bold">YouTube</span>
                  </a>
                </div>

                <div className="pt-2">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    isDarkMode ? 'bg-[#061123] border-[#1E3A66]' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
                      <div className="text-[10.5px] leading-tight">
                        <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Chứng Nhận An Toàn</strong>
                        <div className="text-[9.5px] text-[#64748B]">Đã đăng ký Bộ Công Thương</div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải bản quyền Bottom Bar */}
          <div className={`border-t py-4 px-6 ${
            isDarkMode ? 'border-[#14233D] bg-[#020610]' : 'border-slate-200 bg-slate-100'
          }`}>
            <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
              <div>
                © 2026 <strong>CineBooking Cinema Corporation</strong>. Toàn bộ bản quyền thuộc về hệ thống rạp CineBooking.
              </div>
              <div className="flex items-center gap-4">
                <span>Giấy phép ĐKKD số: 0316888688</span>
                <span>•</span>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-1 text-[#693BFF] hover:text-[#8057FF] font-semibold cursor-pointer"
                >
                  <span>Lên đầu trang</span>
                  <ArrowUp size={12} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* MODAL XEM VÉ ĐIỆN TỬ QR & LỊCH SỬ TRẠNG THÁI (`GET /api/v1/bookings/{id}/history`) */}
      {viewingTicketBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setViewingTicketBooking(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#061123] border border-[#243E6C] rounded-3xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#162949] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Vé Điện Tử QR Code (#{viewingTicketBooking.bookingCode})
                </h3>
                <p className="text-xs text-emerald-400 font-bold uppercase">
                  Trạng thái: {viewingTicketBooking.paymentStatus} •{' '}
                  {viewingTicketBooking.status}
                </p>
              </div>
              <button
                onClick={() => setViewingTicketBooking(null)}
                className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A1830] border border-[#1E365F] text-center space-y-2.5">
              <div className="text-sm font-extrabold text-white">
                {viewingTicketBooking.movieTitle}
              </div>
              <div className="text-xs text-[#94A3B8]">
                {viewingTicketBooking.cinemaName} •{' '}
                {viewingTicketBooking.roomName} (
                {viewingTicketBooking.screenFormat})
              </div>
              <div className="text-xs font-bold text-[#FFB52E]">
                Suất: {viewingTicketBooking.startTime?.slice(0, 5)} • Ngày{' '}
                {formatDateVN(viewingTicketBooking.showDate)} • Ghế:{' '}
                {viewingTicketBooking.tickets
                  ?.map((t) => t.seatCode)
                  .join(', ')}
              </div>

              <div className="p-3 bg-white rounded-2xl w-fit mx-auto shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                    viewingTicketBooking.tickets?.[0]?.ticketCode ||
                      viewingTicketBooking.bookingCode
                  )}`}
                  alt="E-Ticket QR"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <div className="text-xs font-mono font-bold text-[#93C5FD]">
                Mã vé:{' '}
                {viewingTicketBooking.tickets?.[0]?.ticketCode ||
                  viewingTicketBooking.bookingCode}
              </div>
            </div>

            {/* Lịch sử trạng thái đơn từ GET /api/v1/bookings/{id}/history */}
            {viewingBookingHistory.length > 0 && (
              <div className="space-y-1.5 text-left">
                <div className="text-xs font-extrabold text-[#94A3B8] uppercase">
                  Lịch sử trạng thái đơn:
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {viewingBookingHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-[11px] flex items-center justify-between gap-2"
                    >
                      <span className="text-white font-semibold">
                        {h.oldStatus ? `${h.oldStatus} → ` : ''}
                        <b className="text-emerald-400">{h.newStatus}</b>:{' '}
                        {h.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => window.print()}
                className="py-2.5 rounded-xl bg-[#102344] hover:bg-[#193464] text-xs font-bold text-white cursor-pointer"
              >
                In / Lưu vé PDF
              </button>
              <button
                onClick={() => setViewingTicketBooking(null)}
                className="py-2.5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-xs font-bold text-white cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THANH TOÁN QR ZALOPAY SANDBOX TRỰC TIẾP TRÊN TRANG THÀNH VIÊN */}
      {homeZaloPayModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setHomeZaloPayModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#061123] border border-[#0068FF]/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#162949] pb-3">
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-white">
                  Thanh Toán Mã QR ZaloPay Sandbox
                </h3>
                <p className="text-[11px] text-[#93C5FD]">
                  Đơn #{homeZaloPayModal.bookingCode} • GD:{' '}
                  {homeZaloPayModal.appTransId}
                </p>
              </div>
              <button
                onClick={() => setHomeZaloPayModal(null)}
                className="w-8 h-8 rounded-full bg-[#0B1B35] text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 mx-auto w-fit border-4 border-[#0068FF]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(
                  homeZaloPayModal.qrCode || homeZaloPayModal.orderUrl
                )}`}
                alt="ZaloPay QR"
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div className="text-base font-extrabold text-[#FFB52E]">
              Số tiền: {homeZaloPayModal.amount.toLocaleString('vi-VN')}đ
            </div>

            {/* THỜI GIAN GIỮ GHẾ THỰC TẾ CÒN LẠI TỪ CSDL */}
            <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[#94A3B8]">Thời gian giữ ghế còn lại:</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">
                {Math.floor(homeZaloPayCountdown / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {(homeZaloPayCountdown % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="text-xs text-[#93C5FD]">{homeZaloPayMsg}</div>

            <div className="space-y-2">
              <a
                href={homeZaloPayModal.orderUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs"
              >
                Mở cổng ZaloPay Sandbox ↗
              </a>
              <button
                onClick={async () => {
                  try {
                    const res = await cineBookingApi.queryZaloPayOrder(
                      homeZaloPayModal.appTransId
                    );
                    if (res.returnCode === 1 || res.paymentStatus === 'paid') {
                      const fresh = await cineBookingApi.getUserBookings(
                        userProfile?.id || 2
                      );
                      setUserBookings(fresh || []);
                      setHomeZaloPayModal(null);
                    } else {
                      setHomeZaloPayMsg(
                        res.returnMessage ||
                          'Đơn hàng đang chờ thanh toán trên ZaloPay Sandbox...'
                      );
                    }
                  } catch (err: any) {
                    setHomeZaloPayMsg(err?.message || 'Lỗi truy vấn ZaloPay');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#102344] hover:bg-[#193464] border border-[#243E6C] text-white font-bold text-xs cursor-pointer"
              >
                Tôi đã thanh toán — Kiểm tra ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAILER MODAL POPUP (Dành riêng khi bấm nút Xem Trailer) */}
      {showTrailerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#071329] border border-[#172A48] rounded-2xl overflow-hidden shadow-2xl m-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#172A48]">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-[#693BFF]" />
                <span className="font-bold text-sm text-white">
                  {modalVideoTitle} — Official Trailer
                </span>
              </div>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="w-8 h-8 rounded-full bg-[#08162B] hover:bg-rose-500/20 text-[#AAB8D0] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${modalVideoId}?autoplay=1&rel=0`}
                title={`${modalVideoTitle} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOBAL AUTH MODAL: ĐĂNG NHẬP & ĐĂNG KÝ HỘI VIÊN CINEBOOKING
         ===================================================================== */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#071329] border border-[#1E3A66] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] m-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#693BFF] via-[#EC4899] to-[#FFB52E]" />

            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#693BFF] to-[#A875FF] flex items-center justify-center text-white shadow-lg">
                  <Film size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    CineBooking ID
                  </h3>
                  <p className="text-xs text-[#8FA2C2] mt-0.5">
                    Hệ thống rạp chiếu phim chuẩn quốc tế
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-8 h-8 rounded-full bg-[#0B1A34] hover:bg-rose-500/20 text-[#8FA2C2] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-5">
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0A1830] border border-[#1E365F]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setLoginError(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authModalTab === 'login'
                      ? 'bg-[#693BFF] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setRegError(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authModalTab === 'register'
                      ? 'bg-[#693BFF] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Đăng ký mới
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-6">
              {authModalTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold theme-text-muted">
                      Email đăng nhập
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-[#64748B]" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold theme-text-muted">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-[#64748B]" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3 text-[#64748B] hover:text-white cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <LogIn size={15} />
                    )}
                    <span>Đăng nhập ngay</span>
                  </button>

                  {/* Quick fill buttons */}
                  <div className="pt-2 border-t border-[#172A48]">
                    <div className="text-[11px] text-[#64748B] text-center mb-2">
                      Tài khoản thử nghiệm nhanh:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fillLoginTestAccount('customer')}
                        className="py-1.5 px-2 rounded-lg bg-[#0F2244] hover:bg-[#152B55] border border-[#1E3A66] text-[11px] text-[#93C5FD] font-semibold transition-colors cursor-pointer text-center"
                      >
                        👤 Khách hàng mẫu
                      </button>
                      <button
                        type="button"
                        onClick={() => fillLoginTestAccount('admin')}
                        className="py-1.5 px-2 rounded-lg bg-[#0F2244] hover:bg-[#152B55] border border-[#1E3A66] text-[11px] text-[#FDE047] font-semibold transition-colors cursor-pointer text-center"
                      >
                        👑 Quản trị viên mẫu
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold theme-text-muted">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-[#64748B]" />
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold theme-text-muted">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-[#64748B]" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold theme-text-muted">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3 text-[#64748B]" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912345678"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold theme-text-muted">
                        Mật khẩu
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder=">= 6 ký tự"
                        className="w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold theme-text-muted">
                        Nhập lại
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Khớp mật khẩu"
                        className="w-full px-3 py-2 rounded-xl bg-[#0A1830] border border-[#1E365F] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#693BFF]"
                      />
                    </div>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      {regError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#693BFF] to-[#8057FF] hover:from-[#5729E8] hover:to-[#693BFF] text-white text-xs font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {regLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <UserPlus size={15} />
                    )}
                    <span>Tạo tài khoản hội viên</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
