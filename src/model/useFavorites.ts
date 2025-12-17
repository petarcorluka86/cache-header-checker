"use client";
import { useState } from "react";

const FAVORITES_KEY = "cache-header-checker:favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      if (typeof window === "undefined") {
        return [];
      }
      const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        return JSON.parse(storedFavorites);
      }
      return [];
    } catch (e) {
      console.error("Failed to read favorites from localStorage", e);
      return [];
    }
  });

  const persistFavorites = (items: string[]) => {
    setFavorites(items);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Failed to persist favorites", e);
    }
  };

  const addToFavorites = (itemUrl: string) => {
    const trimmed = itemUrl.trim();
    if (!trimmed) return;
    if (favorites.includes(trimmed)) return;
    const next = [trimmed, ...favorites];
    persistFavorites(next);
  };

  const removeFromFavorites = (itemUrl: string) => {
    const trimmed = itemUrl.trim();
    const next = favorites.filter((entry) => entry !== trimmed);
    persistFavorites(next);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
  };
}
