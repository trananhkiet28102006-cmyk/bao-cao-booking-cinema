export interface Movie {
  id: number;
  title: string;
  tagline?: string;
  synopsis?: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  durationMinutes: number;
  ageRating: string; // P16, P18, P, C13
  imdbRating: number; // e.g. 8.6
  genres: string[];
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'FEATURED';
  releaseDate?: string;
}

export interface CastMember {
  id: number;
  name: string;
  characterName: string;
  avatarUrl: string;
}
