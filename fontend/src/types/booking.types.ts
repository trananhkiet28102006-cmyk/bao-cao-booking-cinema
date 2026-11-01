import { Seat } from './seat.types';

export interface BookingSummary {
  bookingId?: number;
  bookingCode?: string;
  showtimeId: number;
  movieTitle: string;
  moviePoster: string;
  ageRating: string;
  duration: string;
  cinemaName: string;
  cinemaAddress: string;
  roomName: string;
  format: string;
  showDate: string;
  showTime: string;
  selectedSeats: Seat[];
  seatTotal: number;
  fnbTotal: number;
  discountAmount: number;
  finalTotal: number;
  holdExpiresAt?: string; // countdown timer
}

export interface FnbItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
}
