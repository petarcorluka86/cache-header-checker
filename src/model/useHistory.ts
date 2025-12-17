"use client";
import { useState } from "react";

const HISTORY_KEY = "cache-header-checker:history";

export function useHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      if (typeof window === "undefined") {
        return [];
      }
      const storedHistory = window.localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
      return [];
    } catch (e) {
      console.error("Failed to read history from localStorage", e);
      return [];
    }
  });

  const persistHistory = (items: string[]) => {
    setHistory(items);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Failed to persist history", e);
    }
  };

  const pushToHistory = (itemUrl: string) => {
    const trimmed = itemUrl.trim();
    if (!trimmed) return;
    const existingWithout = history.filter((entry) => entry !== trimmed);
    const next = [trimmed, ...existingWithout].slice(0, 30);
    persistHistory(next);
  };

  const removeFromHistory = (itemUrl: string) => {
    const trimmed = itemUrl.trim();
    const next = history.filter((entry) => entry !== trimmed);
    persistHistory(next);
  };

  return {
    history,
    pushToHistory,
    removeFromHistory,
  };
}
