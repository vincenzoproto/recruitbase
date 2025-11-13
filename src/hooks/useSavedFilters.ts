import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export const useSavedFilters = (userId: string, filterType: "candidates" | "offers") => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const storageKey = `saved_filters_${filterType}_${userId}`;

  useEffect(() => {
    loadSavedFilters();
  }, [userId, filterType]);

  const loadSavedFilters = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
  };

  const saveFilter = (name: string, filters: Record<string, any>) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.success(`Filtro "${name}" salvato!`);
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.success("Filtro eliminato");
  };

  const applyFilter = (id: string): Record<string, any> | null => {
    const filter = savedFilters.find(f => f.id === id);
    if (filter) {
      toast.success(`Filtro "${filter.name}" applicato`);
      return filter.filters;
    }
    return null;
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    applyFilter,
  };
};
