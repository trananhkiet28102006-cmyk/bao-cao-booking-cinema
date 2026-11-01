export type SeatType = 'REGULAR' | 'VIP' | 'COUPLE' | 'SWEETBOX';
export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'HOLD';

export interface Seat {
  id: string;
  code: string;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  price: number;
  position: [number, number, number];
}
