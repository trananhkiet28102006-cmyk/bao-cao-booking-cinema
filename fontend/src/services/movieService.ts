import { apiClient } from './api';

export interface BackendMovie {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  ageRating: string;
  language: string;
  trailerUrl: string;
  posterUrl: string;
  status: string; // now_showing, coming_soon
  releaseDate: string;
  director: string;
  genres: Array<{ id: number; name: string; slug: string }>;
}

export const movieService = {
  getAllMovies: async (status?: string, keyword?: string): Promise<BackendMovie[]> => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (keyword) params.keyword = keyword;
      const res = await apiClient.get('/movies', { params });
      return res.data?.data || [];
    } catch (error) {
      console.warn('Backend movie API offline, fallback to mock data:', error);
      return [];
    }
  },

  getMovieById: async (id: number): Promise<BackendMovie | null> => {
    try {
      const res = await apiClient.get(`/movies/${id}`);
      return res.data?.data || null;
    } catch (error) {
      console.warn(`Backend movie API for ID ${id} offline:`, error);
      return null;
    }
  },
};
