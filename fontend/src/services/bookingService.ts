import { apiClient } from './api';

export interface BookingPayload {
  showtimeId: number;
  userId?: number;
  seatIds: number[];
  couponCode?: string;
  fnbItems?: Array<{ fnbItemId: number; quantity: number }>;
}

export const bookingService = {
  createBooking: async (payload: BookingPayload) => {
    const res = await apiClient.post('/bookings', payload);
    return res.data;
  },

  getBookingById: async (bookingId: number) => {
    const res = await apiClient.get(`/bookings/${bookingId}`);
    return res.data;
  },

  getTicket: async (bookingId: number) => {
    const res = await apiClient.get(`/bookings/${bookingId}/ticket`);
    return res.data;
  },
};
