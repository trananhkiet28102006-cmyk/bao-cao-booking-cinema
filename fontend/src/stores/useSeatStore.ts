import { useSyncExternalStore } from 'react';

export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';
export type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'HOLD';

export interface SeatData {
  id: string;
  seatDbId: number;
  row: string;
  col: number;
  block: 'LEFT' | 'CENTER' | 'RIGHT';
  type: SeatType;
  price: number;
  status: SeatStatus;
}

export interface BackendSeatInput {
  seatId: number;
  seatNumber: string;
  rowName: string;
  rowIndex: number;
  colIndex: number;
  seatType: string;
  status: string;
  price: number | null;
}

export interface SeatPriceMap {
  STANDARD: number;
  VIP: number;
  COUPLE: number;
}

interface SeatState {
  seats: SeatData[];
  selectedSeats: SeatData[];
  hoveredSeatId: string | null;
  zoomLevel: number;
  isBackendSynced: boolean;
  syncFromBackend: (
    backendSeats: BackendSeatInput[],
    priceMap?: SeatPriceMap
  ) => void;
  updateLiveSeats: (
    backendSeats: BackendSeatInput[],
    priceMap?: SeatPriceMap
  ) => string[];
  markSelectedAsBooked: () => void;
  toggleSeat: (seatId: string) => void;
  clearSelection: () => void;
  setHoveredSeat: (seatId: string | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

/**
 * Chuyển đổi trực tiếp danh sách ghế thực tế từ MySQL (GET /api/v1/showtimes/{id}/seats)
 * thành sơ đồ ghế 2D theo hàng/cột và khối ghế (Trái - Giữa - Phải)
 */
function buildSeatsFromDatabase(
  backendSeats: BackendSeatInput[],
  priceMap: SeatPriceMap = { STANDARD: 90000, VIP: 120000, COUPLE: 190000 }
): SeatData[] {
  if (!backendSeats || backendSeats.length === 0) return [];

  const maxColByRow = new Map<string, number>();
  backendSeats.forEach((bs) => {
    const r = (bs.rowName || bs.seatNumber.charAt(0)).toUpperCase();
    const currentMax = maxColByRow.get(r) || 0;
    if (bs.colIndex > currentMax) {
      maxColByRow.set(r, bs.colIndex);
    }
  });

  return backendSeats.map((bs) => {
    const row = (bs.rowName || bs.seatNumber.charAt(0)).toUpperCase();
    const col = bs.colIndex || parseInt(bs.seatNumber.slice(1), 10) || 1;
    const maxCols = maxColByRow.get(row) || 12;

    const sideCount = maxCols >= 11 ? 3 : 2;
    const rightStart = maxCols - sideCount + 1;

    let block: 'LEFT' | 'CENTER' | 'RIGHT' = 'CENTER';
    if (col <= sideCount) block = 'LEFT';
    else if (col >= rightStart) block = 'RIGHT';

    const rawType = (bs.seatType || 'standard').toUpperCase();
    const type: SeatType =
      rawType === 'VIP'
        ? 'VIP'
        : rawType === 'COUPLE'
        ? 'COUPLE'
        : 'STANDARD';

    const status: SeatStatus =
      bs.status?.toUpperCase() === 'BOOKED'
        ? 'BOOKED'
        : bs.status?.toUpperCase() === 'HOLD'
        ? 'HOLD'
        : 'AVAILABLE';

    const price =
      bs.price !== null && bs.price !== undefined
        ? Number(bs.price)
        : priceMap[type];

    return {
      id: bs.seatNumber.trim().toUpperCase(),
      seatDbId: bs.seatId,
      row,
      col,
      block,
      type,
      price,
      status,
    };
  });
}

let storeState: SeatState = {
  seats: [],
  selectedSeats: [],
  hoveredSeatId: null,
  zoomLevel: 1,
  isBackendSynced: false,

  syncFromBackend: (backendSeats, priceMap) => {
    const dbSeats = buildSeatsFromDatabase(backendSeats, priceMap);

    // Chọn mặc định 2 ghế trống trung tâm hàng C (C04, C05) từ dữ liệu thật của DB
    const defaultPick = dbSeats.filter(
      (s) => (s.id === 'C04' || s.id === 'C05') && s.status === 'AVAILABLE'
    );
    const fallbackPick =
      defaultPick.length > 0
        ? defaultPick
        : dbSeats.filter((s) => s.status === 'AVAILABLE').slice(0, 2);

    setState({
      seats: dbSeats,
      selectedSeats: fallbackPick,
      isBackendSynced: true,
    });
  },

  updateLiveSeats: (backendSeats, priceMap) => {
    const dbSeats = buildSeatsFromDatabase(backendSeats, priceMap);
    const conflictedSeats: string[] = [];

    // Tự động kiểm tra xem ghế hiện tại người dùng đang chọn có bị ai khác đặt trước không
    const nextSelected = storeState.selectedSeats.filter((sel) => {
      const live = dbSeats.find((s) => s.id === sel.id);
      if (live && (live.status === 'BOOKED' || live.status === 'HOLD')) {
        conflictedSeats.push(sel.id);
        return false;
      }
      return true;
    });

    // Kiểm tra xem có thay đổi trạng thái ghế nào so với danh sách cũ hay không
    const hasStatusChange =
      storeState.seats.length !== dbSeats.length ||
      conflictedSeats.length > 0 ||
      dbSeats.some((s, idx) => {
        const old = storeState.seats[idx];
        return !old || old.status !== s.status;
      });

    if (hasStatusChange) {
      setState({
        seats: dbSeats,
        selectedSeats: nextSelected,
      });
    }

    return conflictedSeats;
  },

  markSelectedAsBooked: () => {
    const selectedIds = new Set(storeState.selectedSeats.map((s) => s.id));
    const nextSeats = storeState.seats.map((s) =>
      selectedIds.has(s.id) ? { ...s, status: 'BOOKED' as SeatStatus } : s
    );
    setState({
      seats: nextSeats,
    });
  },

  toggleSeat: (seatId) => {
    const seat = storeState.seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== 'AVAILABLE') return;

    const isSelected = storeState.selectedSeats.some((s) => s.id === seatId);
    if (isSelected) {
      setState({
        selectedSeats: storeState.selectedSeats.filter((s) => s.id !== seatId),
      });
    } else {
      if (storeState.selectedSeats.length >= 6) return;
      setState({
        selectedSeats: [...storeState.selectedSeats, seat],
      });
    }
  },

  clearSelection: () => setState({ selectedSeats: [] }),
  setHoveredSeat: (seatId) => setState({ hoveredSeatId: seatId }),
  zoomIn: () =>
    setState({ zoomLevel: Math.min(1.25, +(storeState.zoomLevel + 0.1).toFixed(2)) }),
  zoomOut: () =>
    setState({ zoomLevel: Math.max(0.8, +(storeState.zoomLevel - 0.1).toFixed(2)) }),
  resetZoom: () => setState({ zoomLevel: 1 }),
};

const listeners = new Set<() => void>();

function setState(partial: Partial<SeatState>) {
  storeState = { ...storeState, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return storeState;
}

export function useSeatStore(): SeatState {
  return useSyncExternalStore(subscribe, getState, getState);
}
