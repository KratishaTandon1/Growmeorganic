// src/hooks/useArtworksData.ts
import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, Artwork } from '../types/artwork';

const API_BASE_URL = 'https://api.artic.edu/api/v1/artworks';
const ROWS_PER_PAGE = 12; // Must match the limit used in the main App component

interface UseArtworksData {
  data: Artwork[];
  totalRecords: number;
  loading: boolean;
  error: string | null;
  fetchData: (page: number) => void;
  currentPage: number;
}

export function useArtworksData(): UseArtworksData {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      // Fetch only the requested page's data (Server-Side Pagination)
      const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${ROWS_PER_PAGE}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      setData(result.data);
      // The total field is required for the PrimeReact DataTable paginator
      setTotalRecords(result.pagination.total);
      
    } catch (err) {
      console.error("Failed to fetch artworks:", err);
      setError("Failed to load data. Please check the network.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  return { data, totalRecords, loading, error, fetchData, currentPage };
}