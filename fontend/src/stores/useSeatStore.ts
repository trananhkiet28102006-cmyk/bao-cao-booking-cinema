import { create } from 'zustand';
import { Seat, SeatType, SeatStatus } from '@/types/seat.types';

// Dựng sơ đồ ghế mẫu cho rạp chuẩn rạp CGV IMAX Đồng Khởi (8 hàng A->H, 3 block)
export const generateInitialSeats = (): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats: Seat[] = [];

  rows.forEach((row, rowIndex) => {
    // Độ sâu Z tăng dần từ hàng A (gần màn hình) về sau
    // Độ cao Y tăng dần (bậc thang rạp chiếu)
    const z = -2 + rowIndex * 1.1;
    const y = rowIndex * 0.35;

    // Xác định loại ghế theo hàng
    let type: SeatType = 'STANDARD';
    let price = 85000;
    if (rowIndex >= 3 && rowIndex <= 5) {
      type = 'VIP';
      price = 120000;
    } else if (rowIndex >= 6) {
      type = 'COUPLE';
      price = 200000;
    }

    // 16 ghế mỗi hàng chia làm 3 block: Left (1-4), Center (5-12), Right (13-16)
    for (let num = 1; num <= 16; num++) {
      let block: 'LEFT' | 'CENTER' | 'RIGHT' = 'CENTER';
      let xOffset = 0;

      if (num <= 4) {
        block = 'LEFT';
        xOffset = (num - 2.5) * 0.7 - 2.0; // Khoảng cách lối đi bên trái
      } else if (num >= 13) {
        block = 'RIGHT';
        xOffset = (num - 14.5) * 0.7 + 2.0; // Khoảng cách lối đi bên phải
      } else {
        block = 'CENTER';
        xOffset = (num - 8.5) * 0.7; // Block trung tâm
      }

      const code = `${row}${num < 10 ? '0' + num : num}`;
      const id = `seat-${code}`;

      // Giả lập một vài ghế đã bán để giống thực tế
      let status: SeatStatus = 'AVAILABLE';
      if ((row === 'A' && num === 5) || (row === 'B' && num === 8) || (row === 'F' && num === 7)) {
        status = 'SOLD';
      }

      // Hai ghế C04 và C05 mặc định là SELECTED theo đúng ảnh mẫu concept
      if (code === 'C04' || code === 'C05') {
        status = 'SELECTED';
      }

      seats.push({
        id,
        code,
        rowLabel: row,
        seatNumber: num,
        type,
        status,
        price,
        position3D: [xOffset, y, z],
        block,
      });
    }
  });

  return seats;
};

interface SeatStore {
  seats: Seat[];
  selectedSeatIds: string[];
  hoveredSeat: Seat | null;
  viewMode: '3D' | '2D';
  maxSeats: number;
  
  // Actions
  toggleSeat: (seatId: string) => void;
  removeSeat: (seatId: string) => void;
  clearSelection: () => void;
  setHoveredSeat: (seat: Seat | null) => void;
  setViewMode: (mode: '3D' | '2D') => void;
  getTotalPrice: () => number;
  getSelectedSeats: () => Seat[];
}

export const useSeatStore = create<SeatStore>((set, get) => {
  const initialSeats = generateInitialSeats();
  const initialSelectedIds = ['seat-C04', 'seat-C05'];

  return {
    seats: initialSeats,
    selectedSeatIds: initialSelectedIds,
    hoveredSeat: null,
    viewMode: '3D',
    maxSeats: 6,

    toggleSeat: (seatId: string) => {
      const { seats, selectedSeatIds, maxSeats } = get();
      const targetSeat = seats.find((s) => s.id === seatId);

      if (!targetSeat || targetSeat.status === 'SOLD' || targetSeat.status === 'HELD') {
        return;
      }

      const isAlreadySelected = selectedSeatIds.includes(seatId);

      if (isAlreadySelected) {
        // Bỏ chọn
        set({
          selectedSeatIds: selectedSeatIds.filter((id) => id !== seatId),
          seats: seats.map((s) =>
            s.id === seatId ? { ...s, status: 'AVAILABLE' } : s
          ),
        });
      } else {
        // Chọn mới (giới hạn tối đa 6 ghế)
        if (selectedSeatIds.length >= maxSeats) {
          alert(`Bạn chỉ có thể chọn tối đa ${maxSeats} ghế cho mỗi đơn hàng.`);
          return;
        }

        set({
          selectedSeatIds: [...selectedSeatIds, seatId],
          seats: seats.map((s) =>
            s.id === seatId ? { ...s, status: 'SELECTED' } : s
          ),
        });
      }
    },

    removeSeat: (seatId: string) => {
      const { seats, selectedSeatIds } = get();
      set({
        selectedSeatIds: selectedSeatIds.filter((id) => id !== seatId),
        seats: seats.map((s) =>
          s.id === seatId ? { ...s, status: 'AVAILABLE' } : s
        ),
      });
    },

    clearSelection: () => {
      const { seats } = get();
      set({
        selectedSeatIds: [],
        seats: seats.map((s) =>
          s.status === 'SELECTED' ? { ...s, status: 'AVAILABLE' } : s
        ),
      });
    },

    setHoveredSeat: (seat) => set({ hoveredSeat: seat }),
    setViewMode: (mode) => set({ viewMode: mode }),

    getTotalPrice: () => {
      const { seats, selectedSeatIds } = get();
      return seats
        .filter((s) => selectedSeatIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0);
    },

    getSelectedSeats: () => {
      const { seats, selectedSeatIds } = get();
      return seats.filter((s) => selectedSeatIds.includes(s.id));
    },
  };
});
