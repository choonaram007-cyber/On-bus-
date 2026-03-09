import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAV_KEY = "ob_favorite_buses";

interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (busId: string) => boolean;
  toggleFavorite: (busId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((val) => {
      if (val) {
        try { setFavorites(JSON.parse(val)); } catch {}
      }
    });
  }, []);

  const toggleFavorite = async (busId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(busId)
        ? prev.filter((id) => id !== busId)
        : [...prev, busId];
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (busId: string) => favorites.includes(busId);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
