export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';
export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'SOLD' | 'HELD';

export interface Seat {
  id: string; // e.g., 'seat-C04'
  code: string; // e.g., 'C04'
  rowLabel: string; // e.g., 'C'
  seatNumber: number; // e.g., 4
  type: SeatType;
  status: SeatStatus;
  price: number; // e.g., 85000
  // 3D coordinates for spatial layout
  position3D: [number, number, number]; // [x, y, z]
  block: 'LEFT' | 'CENTER' | 'RIGHT';
}

export interface ShowtimeSeatMap {
  showtimeId: number;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  format: string; // IMAX, 2D, 3D
  showDate: string; // e.g., "Thứ 6, 26/04/2024"
  showTime: string; // e.g., "19:30"
  seats: Seat[];
}
