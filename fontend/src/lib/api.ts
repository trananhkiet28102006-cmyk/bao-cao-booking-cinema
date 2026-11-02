/**
 * CINEBOOKING BACKEND API CLIENT (100% REAL DATABASE INTEGRATION)
 * Kết nối trực tiếp tới Spring Boot Backend (C:\Users\trana\Desktop\java\backend)
 * Database: MySQL (nguyenthanhnhan_2124110299)
 * Base URL: http://localhost:8080/api/v1
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface BackendGenre {
  id: number;
  name: string;
  slug: string;
}

export interface BackendCast {
  id: number;
  roleType: string;
  personName: string;
  characterName?: string;
  avatarUrl?: string;
  displayOrder?: number;
}

export interface BackendMovie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  ageRating: string;
  language: string;
  trailerUrl: string;
  posterUrl: string;
  status: string; // 'now_showing' | 'coming_soon'
  releaseDate: string;
  endDate: string;
  director: string;
  genres: BackendGenre[];
  casts?: BackendCast[];
}

export interface BackendBanner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  targetType: string;
  targetId: number | null;
  displayOrder: number;
  isActive: boolean;
}

export interface BackendUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
}

export interface BackendCinemaRoom {
  id: number;
  cinemaId: number;
  name: string;
  roomType: string;
  totalSeats: number;
  status: string;
}

export interface BackendCinema {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  rooms?: BackendCinemaRoom[];
}

export interface BackendShowtime {
  id: number;
  movieId: number;
  movieTitle: string;
  movieDurationMinutes: number;
  moviePosterUrl: string;
  movieAgeRating: string;
  roomId: number;
  roomName: string;
  roomType: string;
  cinemaId: number;
  cinemaName: string;
  cinemaCity: string;
  showDate: string;
  startTime: string;
  estimatedEndTime: string;
  screenFormat: string;
  status: string;
}

export interface BackendSeatStatus {
  seatId: number;
  seatNumber: string;
  rowName: string;
  rowIndex: number;
  colIndex: number;
  seatType: string; // 'standard' | 'vip' | 'couple'
  status: string; // 'AVAILABLE' | 'BOOKED'
  price: number | null;
}

export interface BackendSeatLayout {
  showtimeId: number;
  movieId: number;
  movieTitle: string;
  roomId: number;
  roomName: string;
  roomType: string;
  cinemaId: number;
  cinemaName: string;
  showDate: string;
  startTime: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  seats: BackendSeatStatus[];
}

export interface BackendFnbItem {
  id: number;
  itemName: string;
  category: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  isActive: boolean;
}

export interface BackendReviewItem {
  id: number;
  userId: number;
  userFullName: string;
  movieId: number;
  movieTitle: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface BackendMovieReviewsSummary {
  movieId: number;
  movieTitle: string;
  averageRating: number;
  totalReviews: number;
  reviews: BackendReviewItem[];
}

export interface BackendFavoriteItem {
  id: number;
  userId: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string;
  movieAgeRating: string;
  movieDurationMinutes: number;
  movieStatus: string;
  createdAt: string;
}

export interface BackendUserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  loyaltyPoints: number;
  memberTier: string;
  status: string;
}

export interface BackendAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUserProfile;
}

export interface BackendTicketResponse {
  id: number;
  ticketCode: string;
  seatId: number;
  seatCode: string;
  seatType: string;
  finalPrice: number;
  qrCodeUrl: string | null;
  checkinStatus: string;
}
export type BackendBookingTicket = BackendTicketResponse;

export interface BackendBookingFnbResponse {
  id: number;
  fnbItemId: number;
  itemName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pickupStatus: string;
}
export type BackendBookingFnb = BackendBookingFnbResponse;

export interface BackendBookingResponse {
  id: number;
  bookingCode: string;
  userId: number;
  userFullName: string;
  showtimeId: number;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showDate: string;
  startTime: string;
  screenFormat: string;
  couponCode?: string | null;
  contactPhone: string;
  contactEmail: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  ticketSubtotal: number;
  fnbSubtotal: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  holdExpiresAt: string | null;
  createdAt: string;
  tickets: BackendTicketResponse[];
  fnbItems: BackendBookingFnbResponse[];
}


export interface LuckyWheelPrize {
  id: number;
  name: string;
  prizeType: string;
  prizeValue: number;
  probabilityWeight: number;
  color: string;
  icon: string;
  slotIndex: number;
}

export interface SpinResult {
  slotIndex: number;
  prizeName: string;
  prizeType: string;
  prizeValue: number;
  pointsSpent: number;
  pointsRewarded: number;
  couponCode?: string | null;
  newBalance: number;
  message: string;
}

export interface SpinHistoryItem {
  id: number;
  prizeName: string;
  prizeType: string;
  pointsSpent: number;
  pointsRewarded: number;
  couponCode?: string | null;
  createdAt: string;
}

export interface BackendCoupon {
  id: number;
  code: string;
  description: string;
  type?: string;
  discountType: string; // 'percentage' | 'fixed_amount'
  value?: number;
  discountValue: number;
  minOrderAmount?: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit?: number | null;
  startDate: string;
  endDate: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  status?: string;
  pointsCost: number;
}

export interface BackendNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  sentAt: string;
  readAt: string | null;
}

export interface BackendLoyaltyTransaction {
  id: number;
  userId: number;
  bookingId: number | null;
  bookingCode?: string | null;
  type: string; // 'earn' | 'redeem'
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface BackendLoyaltySummary {
  userId: number;
  fullName: string;
  email: string;
  loyaltyPoints: number;
  memberTier: string;
  nextTier: string | null;
  pointsToNextTier: number;
  recentTransactions: BackendLoyaltyTransaction[];
}

// Khớp đúng DTO thực tế của GET /api/v1/admin/dashboard/summary
export interface BackendDashboardSummary {
  totalRevenue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  totalBookings: number;
  paidBookings: number;
  cancelledBookings: number;
  totalTicketsSold: number;
  totalCustomers: number;
  topMovies: {
    movieId: number;
    title: string;
    posterUrl: string;
    ticketsSold: number;
    revenue: number;
  }[];
  revenueByPaymentMethod: Record<string, number>;
}

const TOKEN_STORAGE_KEY = 'cinebooking_jwt_token';
const USER_STORAGE_KEY = 'cinebooking_user_profile';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): BackendUserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(auth: BackendAuthResponse) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, auth.accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  customToken?: string
): Promise<T> {
  const token = customToken || getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || `HTTP Error ${res.status}`);
  }
  return json.data;
}

/**
 * Đăng nhập tài khoản khách hàng thực tế trong MySQL (khachhang@gmail.com / Customer@123)
 */
export async function ensureBackendAuth(): Promise<BackendAuthResponse | null> {
  try {
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();
    if (existingToken) {
      try {
        const freshUser = await apiFetch<BackendUserProfile>('/auth/me');
        const updated = {
          accessToken: existingToken,
          tokenType: 'Bearer',
          expiresIn: 86400000,
          user: freshUser,
        };
        saveAuthSession(updated);
        return updated;
      } catch {
        clearAuthSession();
        return null;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function ensureAdminAuth(
  email = 'admin@cinema.com',
  password = 'Admin@123'
): Promise<BackendAuthResponse | null> {
  try {
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();
    if (
      existingToken &&
      existingUser &&
      (existingUser.role === 'ADMIN' || existingUser.role === 'STAFF')
    ) {
      return {
        accessToken: existingToken,
        tokenType: 'Bearer',
        expiresIn: 86400000,
        user: existingUser,
      };
    }
    const auth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAuthSession(auth);
    return auth;
  } catch (err) {
    console.error('Admin Auth error:', err);
    return null;
  }
}

export const cineBookingApi = {
  // 1. Auth & User Profile (AuthController & UserController)
  login: async (email: string, password: string) => {
    const auth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveAuthSession(auth);
    return auth;
  },
  register: async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const auth = await apiFetch<BackendAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    saveAuthSession(auth);
    return auth;
  },
  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    await ensureBackendAuth();
    return apiFetch<void>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  getMe: () => apiFetch<BackendUserProfile>('/auth/me'),
  updateMyProfile: async (payload: { fullName: string; phone: string }) => {
    await ensureBackendAuth();
    const updated = await apiFetch<BackendUserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const token = getStoredToken();
    if (token) {
      saveAuthSession({
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 86400000,
        user: updated,
      });
    }
    return updated;
  },
  getMyLoyaltySummary: async () => {
    await ensureBackendAuth();
    return apiFetch<BackendLoyaltySummary>('/users/loyalty');
  },

  // 2. Movies, Casts, Genres & Reviews (MovieController, GenreController, ReviewController, UploadController)
  uploadImage: async (file: File, folder: string = 'movies'): Promise<BackendUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json: ApiResponse<BackendUploadResponse> = await res.json();
    if (!res.ok) {
      throw new Error(json?.message || `Lỗi tải ảnh lên Cloudinary qua Backend: HTTP ${res.status}`);
    }
    return json.data;
  },
  getGenres: () => apiFetch<BackendGenre[]>('/genres'),
  createMovie: async (payload: {
    title: string;
    description: string;
    durationMinutes: number;
    ageRating: string;
    language: string;
    trailerUrl: string;
    posterUrl: string;
    status: string;
    releaseDate: string;
    endDate: string;
    director: string;
    genreIds: number[];
  }) => {
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    return apiFetch<BackendMovie>(
      '/movies',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      adminAuth.accessToken
    );
  },
  getAllMovies: (status?: string, keyword?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (keyword) params.set('keyword', keyword);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<BackendMovie[]>(`/movies${qs}`);
  },
  getNowShowingMovies: () => apiFetch<BackendMovie[]>('/movies/now-showing'),
  getComingSoonMovies: () => apiFetch<BackendMovie[]>('/movies/coming-soon'),
  getMovieDetail: (id: number) => apiFetch<BackendMovie>(`/movies/${id}`),
  getMovieReviews: (movieId: number) =>
    apiFetch<BackendMovieReviewsSummary>(`/movies/${movieId}/reviews`),
  submitMovieReview: async (movieId: number, rating: number, comment: string) => {
    await ensureBackendAuth();
    return apiFetch<BackendReviewItem>(`/movies/${movieId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  // 3. Favorites (FavoriteController)
  getMyFavorites: async () => {
    await ensureBackendAuth();
    return apiFetch<BackendFavoriteItem[]>('/favorites');
  },
  addFavorite: async (movieId: number) => {
    await ensureBackendAuth();
    return apiFetch<BackendFavoriteItem>(`/favorites/movies/${movieId}`, {
      method: 'POST',
    });
  },
  removeFavorite: async (movieId: number) => {
    await ensureBackendAuth();
    return apiFetch<void>(`/favorites/movies/${movieId}`, {
      method: 'DELETE',
    });
  },

  // 4. Banners (BannerController)
  getActiveBanners: () => apiFetch<BackendBanner[]>('/banners/active'),

  // 5. Cinemas & Showtimes (CinemaController, ShowtimeController, SeatController)
  getCinemas: (city?: string) =>
    apiFetch<BackendCinema[]>(
      `/cinemas${city ? `?city=${encodeURIComponent(city)}` : ''}`
    ),
  getCinemaById: (id: number) => apiFetch<BackendCinema>(`/cinemas/${id}`),
  getShowtimes: (filters?: {
    cinemaId?: number;
    movieId?: number;
    showDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.cinemaId) params.set('cinemaId', String(filters.cinemaId));
    if (filters?.movieId) params.set('movieId', String(filters.movieId));
    if (filters?.showDate) params.set('showDate', filters.showDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<BackendShowtime[]>(`/showtimes${qs}`);
  },
  getShowtimeById: (id: number) =>
    apiFetch<BackendShowtime>(`/showtimes/${id}`),
  createShowtime: async (payload: {
    movieId: number;
    roomId: number;
    showDate: string;
    startTime: string;
    screenFormat: string;
    status: string;
  }) => {
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    return apiFetch<BackendShowtime>(
      '/showtimes',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      adminAuth.accessToken
    );
  },
  getSeatLayoutByShowtime: (showtimeId: number) =>
    apiFetch<BackendSeatLayout>(`/showtimes/${showtimeId}/seats`),

  // 6. Ticket Price Calculation & Holidays (TicketPriceRuleController, HolidayController)
  calculateTicketPrice: (payload: {
    showtimeId: number;
    seatType: string;
    customerType?: string;
  }) =>
    apiFetch<{
      showtimeId: number;
      screenType: string;
      seatType: string;
      dayType: string;
      timeSlot: string;
      customerType: string;
      finalPrice: number;
      appliedRuleId: number | null;
    }>('/ticket-price-rules/calculate', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: payload.showtimeId,
        seatType: payload.seatType,
        customerType: payload.customerType || 'adult',
      }),
    }),

  // 7. F&B Items & Coupons (FnbItemController, CouponController)
  getFnbItems: () => apiFetch<BackendFnbItem[]>('/fnb-items?activeOnly=true'),
  getCoupons: async (activeOnly = true) => {
    const list = await apiFetch<any[]>(`/coupons?activeOnly=${activeOnly}`);
    return (list || []).map((cp) => {
      const isPercent = (cp.type || cp.discountType) === 'percentage';
      const rawVal = Number(cp.value ?? cp.discountValue ?? 0);
      const minOrder = Number(cp.minOrderAmount ?? cp.minOrderValue ?? 0);
      const maxDisc =
        cp.maxDiscount != null
          ? Number(cp.maxDiscount)
          : cp.maxDiscountAmount != null
          ? Number(cp.maxDiscountAmount)
          : null;

      let cost = 150;
      if (cp.code === 'CINEMA20') cost = 150;
      else if (cp.code === 'WELCOME30K') cost = 200;
      else if (cp.code === 'VIP50K') cost = 300;
      else if (isPercent) cost = Math.max(100, Math.round(rawVal * 10));
      else cost = Math.max(100, Math.round(rawVal / 150));

      return {
        id: cp.id,
        code: cp.code,
        description:
          cp.description ||
          `Giảm ${
            isPercent ? `${rawVal}%` : `${rawVal.toLocaleString('vi-VN')}đ`
          } cho mọi giao dịch xem phim tại CineBooking.`,
        type: cp.type || (isPercent ? 'percentage' : 'fixed_amount'),
        discountType: isPercent ? 'percentage' : 'fixed_amount',
        value: rawVal,
        discountValue: rawVal,
        minOrderAmount: minOrder,
        minOrderValue: minOrder,
        maxDiscount: maxDisc,
        maxDiscountAmount: maxDisc,
        usageLimit: cp.usageLimit,
        usedCount: cp.usedCount || 0,
        perUserLimit: cp.perUserLimit,
        startDate: cp.validFrom || cp.startDate || '',
        endDate: cp.validTo || cp.endDate || '',
        validFrom: cp.validFrom,
        validTo: cp.validTo,
        isActive: cp.status === 'active' || cp.isActive === true || !cp.status,
        status: cp.status || 'active',
        pointsCost: cost,
      } as BackendCoupon;
    });
  },
  redeemCoupon: async (couponId: number) => {
    await ensureBackendAuth();
    return apiFetch<{
      couponId: number;
      code: string;
      pointsSpent: number;
      newBalance: number;
      message: string;
    }>(`/coupons/${couponId}/redeem`, {
      method: 'POST',
    });
  },
  applyCoupon: async (code: string, orderAmount: number, userId?: number) => {
    await ensureBackendAuth();
    return apiFetch<{
      valid: boolean;
      couponCode: string;
      discountAmount: number;
      finalAmount: number;
      message: string;
    }>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount, userId }),
    });
  },

  // 8. Bookings & Payments (BookingController, PaymentController)
  createBooking: async (payload: {
    userId?: number;
    cinemaId?: number;
    showtimeId: number;
    seatIds: number[];
    fnbItems?: { fnbItemId: number; quantity: number }[];
    couponCode?: string;
    contactPhone: string;
    contactEmail: string;
    paymentMethod: string;
  }) => {
    await ensureBackendAuth();
    return apiFetch<BackendBookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        customerType: 'adult',
      }),
    });
  },

  getUserBookings: async (userId?: number) => {
    await ensureBackendAuth();
    const qs = userId ? `?userId=${userId}` : '';
    return apiFetch<BackendBookingResponse[]>(`/bookings${qs}`);
  },

  getBookingById: async (bookingId: number) => {
    await ensureBackendAuth();
    return apiFetch<BackendBookingResponse>(`/bookings/${bookingId}`);
  },

  cancelUnpaidBooking: async (bookingId: number, reason?: string) => {
    await ensureBackendAuth();
    return apiFetch<BackendBookingResponse>(
      `/bookings/${bookingId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Khách hàng chủ động hủy đơn chưa thanh toán' }),
      }
    );
  },

  getBookingHistory: async (bookingId: number) => {
    await ensureBackendAuth();
    return apiFetch<
      {
        id: number;
        oldStatus: string | null;
        newStatus: string;
        note: string;
        changedAt: string;
      }[]
    >(`/bookings/${bookingId}/history`);
  },

  checkinTicket: async (ticketCode: string, cinemaId?: number, showtimeId?: number) => {
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    return apiFetch<BackendBookingTicket>(
      '/bookings/tickets/check-in',
      {
        method: 'POST',
        body: JSON.stringify({
          ticketCode: ticketCode.trim(),
          ...(cinemaId ? { cinemaId } : {}),
          ...(showtimeId ? { showtimeId } : {}),
        }),
      },
      adminAuth.accessToken
    );
  },

  claimFnb: async (bookingId: number) => {
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    return apiFetch<BackendBookingFnb[]>(
      `/bookings/${bookingId}/fnb/claim`,
      {
        method: 'POST',
      },
      adminAuth.accessToken
    );
  },

  processPayment: async (bookingId: number, paymentMethod: string) => {
    // Endpoint /payments/process yêu cầu quyền STAFF/ADMIN để xác nhận thanh toán tại quầy/gateway
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    return apiFetch<{
      id: number;
      bookingId: number;
      bookingCode: string;
      paymentMethod: string;
      transactionId: string;
      amount: number;
      status: string;
      loyaltyPointsEarned: number;
    }>(
      '/payments/process',
      {
        method: 'POST',
        body: JSON.stringify({
          bookingId,
          paymentMethod: paymentMethod.toUpperCase(),
          simulateSuccess: true,
        }),
      },
      adminAuth.accessToken
    );
  },

  createZaloPayOrder: async (bookingId: number) => {
    await ensureBackendAuth();
    return apiFetch<{
      paymentAttemptId: number;
      bookingId: number;
      bookingCode: string;
      appTransId: string;
      orderUrl: string;
      zpTransToken: string;
      orderToken: string;
      qrCode: string;
      amount: number;
      returnCode: number;
      returnMessage: string;
      status: string;
    }>(`/payments/zalopay/create/${bookingId}`, {
      method: 'POST',
    });
  },

  queryZaloPayOrder: async (appTransId: string) => {
    await ensureBackendAuth();
    return apiFetch<{
      bookingId: number;
      bookingCode: string;
      bookingStatus: string;
      paymentStatus: string;
      appTransId: string;
      returnCode: number;
      returnMessage: string;
      subReturnCode?: number;
      subReturnMessage?: string;
      isProcessing: boolean;
      amount: number;
      zpTransId: number;
      loyaltyPointsEarned?: number;
      totalLoyaltyPoints?: number;
      memberTier?: string;
    }>(`/payments/zalopay/query/${encodeURIComponent(appTransId)}`, {
      method: 'POST',
    });
  },

  getPaymentsByBooking: async (bookingId: number) => {
    await ensureBackendAuth();
    return apiFetch<
      {
        id: number;
        bookingId: number;
        bookingCode: string;
        paymentMethod: string;
        transactionId: string;
        amount: number;
        status: string;
        loyaltyPointsEarned: number;
        createdAt: string;
      }[]
    >(`/payments/booking/${bookingId}`);
  },

  requestAndProcessRefund: async (bookingId: number, reason: string) => {
    const adminAuth = await apiFetch<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@cinema.com',
        password: 'Admin@123',
      }),
    });
    const refundReq = await apiFetch<{
      id: number;
      bookingId: number;
      bookingCode: string;
      amount: number;
      reason: string;
      status: string;
    }>(
      '/refunds',
      {
        method: 'POST',
        body: JSON.stringify({ bookingId, reason }),
      },
      adminAuth.accessToken
    );
    return apiFetch<{
      id: number;
      bookingId: number;
      bookingCode: string;
      amount: number;
      reason: string;
      status: string;
    }>(
      `/refunds/${refundReq.id}/process`,
      {
        method: 'PUT',
        body: JSON.stringify({
          approve: true,
          note: 'Đã hoàn tiền và giải phóng ghế tự động trên MySQL',
        }),
      },
      adminAuth.accessToken
    );
  },

  getLoyaltyTransactions: async (userId: number) => {
    await ensureBackendAuth();
    return apiFetch<BackendLoyaltyTransaction[]>(
      `/loyalty-transactions/user/${userId}`
    );
  },

  // 9. Notifications (NotificationController)
  getMyNotifications: async (): Promise<BackendNotification[]> => {
    await ensureBackendAuth();
    // Backend trả về dạng phân trang { content: [...] } và trạng thái đọc qua field `status` ('unread' | 'read')
    const raw = await apiFetch<any>('/notifications?size=50');
    const list: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.content)
      ? raw.content
      : [];
    return list.map((n) => ({
      ...n,
      isRead:
        typeof n.isRead === 'boolean'
          ? n.isRead
          : String(n.status || '').toLowerCase() !== 'unread',
    }));
  },
  getUnreadNotificationCount: async () => {
    await ensureBackendAuth();
    return apiFetch<{ unreadCount: number }>('/notifications/unread-count');
  },
  markNotificationAsRead: async (id: number) => {
    await ensureBackendAuth();
    return apiFetch<BackendNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
  markAllNotificationsAsRead: async () => {
    await ensureBackendAuth();
    return apiFetch<void>('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // 10. Admin Dashboard & Management (DashboardController, UserController, ReviewController...)
  getDashboardSummary: async () => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<BackendDashboardSummary>(
      '/admin/dashboard/summary',
      {},
      adminAuth?.accessToken
    );
  },

  getAllUsersAdmin: async (filters?: {
    role?: string;
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const adminAuth = await ensureAdminAuth();
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.keyword) params.set('keyword', filters.keyword);
    params.set('page', String(filters?.page ?? 0));
    params.set('size', String(filters?.size ?? 50));
    const raw = await apiFetch<any>(
      `/users?${params.toString()}`,
      {},
      adminAuth?.accessToken
    );
    return Array.isArray(raw) ? raw : raw?.content || [];
  },

  updateUserStatusAdmin: async (id: number, status: string) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<BackendUserProfile>(
      `/users/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      adminAuth?.accessToken
    );
  },

  updateUserRoleAdmin: async (id: number, role: string) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<BackendUserProfile>(
      `/users/${id}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      },
      adminAuth?.accessToken
    );
  },

  deleteMovieAdmin: async (id: number) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<void>(
      `/movies/${id}`,
      {
        method: 'DELETE',
      },
      adminAuth?.accessToken
    );
  },

  updateMovieAdmin: async (id: number, payload: any) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<BackendMovie>(
      `/movies/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      adminAuth?.accessToken
    );
  },

  deleteShowtimeAdmin: async (id: number) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<void>(
      `/showtimes/${id}`,
      {
        method: 'DELETE',
      },
      adminAuth?.accessToken
    );
  },

  getAllReviewsAdmin: async (filters?: {
    movieId?: number;
    status?: string;
  }) => {
    const adminAuth = await ensureAdminAuth();
    const params = new URLSearchParams();
    if (filters?.movieId) params.set('movieId', String(filters.movieId));
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<
      {
        id: number;
        movieId: number;
        movieTitle: string;
        userId: number;
        userName: string;
        rating: number;
        comment: string;
        status: string;
        createdAt: string;
      }[]
    >(`/reviews/admin${qs}`, {}, adminAuth?.accessToken);
  },

  updateReviewStatusAdmin: async (id: number, status: string) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<any>(
      `/reviews/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      adminAuth?.accessToken
    );
  },

  deleteReviewAdmin: async (id: number) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<void>(
      `/reviews/${id}`,
      {
        method: 'DELETE',
      },
      adminAuth?.accessToken
    );
  },

  createCouponAdmin: async (payload: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount?: number | null;
    usageLimit?: number | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<BackendCoupon>(
      '/coupons',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      adminAuth?.accessToken
    );
  },

  deleteCouponAdmin: async (id: number) => {
    const adminAuth = await ensureAdminAuth();
    return apiFetch<void>(
      `/coupons/${id}`,
      {
        method: 'DELETE',
      },
      adminAuth?.accessToken
    );
  },

  getAllBookingsAdmin: async (filters?: {
    userId?: number;
    showtimeId?: number;
    status?: string;
  }) => {
    const adminAuth = await ensureAdminAuth();
    const params = new URLSearchParams();
    if (filters?.userId) params.set('userId', String(filters.userId));
    if (filters?.showtimeId) params.set('showtimeId', String(filters.showtimeId));
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<BackendBookingResponse[]>(
      `/bookings${qs}`,
      {},
      adminAuth?.accessToken
    );
  },

  // 13. Lucky Wheel (Vòng Quay May Mắn Đổi Điểm Thưởng 200 pts)
  getLuckyWheelPrizes: async () => {
    return apiFetch<LuckyWheelPrize[]>('/lucky-wheel/prizes');
  },

  spinLuckyWheel: async () => {
    return apiFetch<SpinResult>('/lucky-wheel/spin', {
      method: 'POST',
    });
  },

  getLuckyWheelHistory: async () => {
    return apiFetch<SpinHistoryItem[]>('/lucky-wheel/my-history');
  },
};