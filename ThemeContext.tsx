import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkColors, LightColors, ThemeColors } from "@/constants/colors";

const THEME_KEY = "ob_theme_mode";

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "dark") setIsDark(true);
      else setIsDark(false);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);

  const value = useMemo(() => ({ isDark, colors, toggleTheme }), [isDark, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
