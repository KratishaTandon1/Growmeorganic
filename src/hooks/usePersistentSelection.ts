import { useState, useCallback } from 'react';

export interface UsePersistentSelectionReturn {
  selectedIds: Set<number>;
  deselectedIds: Set<number>;
  bulkSelectedCount: number;
  selectionStartingPage: number;
  toggleRowSelection: (id: number, isSelected: boolean) => void;
  setBulkSelection: (count: number, startingPage: number) => void;
}

export function usePersistentSelection(): UsePersistentSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [bulkSelectedCount, setBulkSelectedCount] = useState<number>(0);
  const [selectionStartingPage, setSelectionStartingPage] = useState<number>(1);

  const toggleRowSelection = useCallback((id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(prev => new Set([...prev, id]));
      setDeselectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      if (bulkSelectedCount > 0) {
        setDeselectedIds(prev => new Set([...prev, id]));
      }
    }
  }, [bulkSelectedCount]);

  const setBulkSelection = useCallback((count: number, startingPage: number) => {
    setBulkSelectedCount(count);
    setSelectionStartingPage(startingPage);
    // Clear individual selections when applying bulk selection
    setSelectedIds(new Set());
    setDeselectedIds(new Set());
  }, []);

  return {
    selectedIds,
    deselectedIds,
    bulkSelectedCount,
    selectionStartingPage,
    toggleRowSelection,
    setBulkSelection
  };
}