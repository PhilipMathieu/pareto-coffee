import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pareto-coffee-hidden-places";

function loadHiddenPlaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.warn("Failed to load hidden places from localStorage:", err);
  }
  return new Set();
}

function saveHiddenPlaces(hiddenSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hiddenSet]));
  } catch (err) {
    console.warn("Failed to save hidden places to localStorage:", err);
  }
}

export function useHiddenPlaces() {
  const [hiddenIds, setHiddenIds] = useState(() => loadHiddenPlaces());

  useEffect(() => {
    saveHiddenPlaces(hiddenIds);
  }, [hiddenIds]);

  const hide = useCallback((id) => {
    setHiddenIds((prev) => new Set([...prev, id]));
  }, []);

  const unhide = useCallback((id) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isHidden = useCallback((id) => hiddenIds.has(id), [hiddenIds]);

  const clearAll = useCallback(() => {
    setHiddenIds(new Set());
  }, []);

  return { hiddenIds, hide, unhide, isHidden, clearAll };
}
