// src/types/artwork.ts

export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
  // Note: The API returns many more fields, but we only define the required ones here
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  current_page: number;
  total_pages: number;
}

export interface ApiResponse {
  data: Artwork[];
  pagination: Pagination;
  // Config field is present but not used in this assignment
  // config: any;
}

export type ArtworkId = number;