import { create } from 'zustand';
import { BookingSummary, FnbItem } from '@/types/booking.types';

interface BookingStore {
  booking: BookingSummary;
  fnbItems: FnbItem[];
  appliedCoupon: string | null;
  holdTimeSeconds: number;
  isCheckoutOpen: boolean;
  
  // Actions
  updateFnbQuantity: (id: number, delta: number) => void;
  applyCoupon: (code: string) => boolean;
  setCheckoutOpen: (open: boolean) => void;
  decrementHoldTimer: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  booking: {
    showtimeId: 101,
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    ageRating: 'P16',
    duration: '2h 46m',
    cinemaName: 'CGV Vincom Đồng Khởi',
    cinemaAddress: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
    roomName: 'Phòng 3',
    format: 'IMAX',
    showDate: 'Thứ 6, 26/04/2024',
    showTime: '19:30',
    selectedSeats: [],
    seatTotal: 170000,
    fnbTotal: 0,
    discountAmount: 0,
    finalTotal: 170000,
  },
  fnbItems: [
    {
      id: 1,
      name: 'Combo Solo Bắp + Nước',
      description: '1 Bắp ngọt 60oz + 1 Nước ngọt 32oz',
      price: 85000,
      imageUrl: 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?w=300&auto=format&fit=crop&q=80',
      quantity: 0,
    },
    {
      id: 2,
      name: 'Combo Couple Siêu Tiết Kiệm',
      description: '1 Bắp ngọt 60oz + 2 Nước ngọt 32oz',
      price: 120000,
      imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300&auto=format&fit=crop&q=80',
      quantity: 0,
    },
  ],
  appliedCoupon: null,
  holdTimeSeconds: 300, // 5 phút chuẩn backend
  isCheckoutOpen: false,

  updateFnbQuantity: (id, delta) => {
    const { fnbItems } = get();
    const updated = fnbItems.map((item) => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    });

    const fnbTotal = updated.reduce((sum, item) => sum + item.price * item.quantity, 0);
    set({ fnbItems: updated });
  },

  applyCoupon: (code) => {
    if (code.toUpperCase() === 'CINE20' || code.toUpperCase() === 'ZALOPAY') {
      set({ appliedCoupon: code.toUpperCase() });
      return true;
    }
    return false;
  },

  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  decrementHoldTimer: () => {
    set((state) => ({
      holdTimeSeconds: Math.max(0, state.holdTimeSeconds - 1),
    }));
  },

  resetBooking: () => {
    set((state) => ({
      ...state,
      appliedCoupon: null,
      holdTimeSeconds: 300,
      isCheckoutOpen: false,
    }));
  },
}));
