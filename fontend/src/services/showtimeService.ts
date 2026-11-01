import { apiClient } from './api';

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

export const showtimeService = {
  getAllShowtimes: async (params?: { movieId?: number; cinemaId?: number; showDate?: string }): Promise<BackendShowtime[]> => {
    try {
      const res = await apiClient.get('/showtimes', { params });
      return res.data?.data || [];
    } catch (error) {
      console.warn('Backend showtimes API offline:', error);
      return [];
    }
  },

  getShowtimeById: async (id: number): Promise<BackendShowtime | null> => {
    try {
      const res = await apiClient.get(`/showtimes/${id}`);
      return res.data?.data || null;
    } catch (error) {
      console.warn(`Backend showtime API for ID ${id} offline:`, error);
      return null;
    }
  },
};
