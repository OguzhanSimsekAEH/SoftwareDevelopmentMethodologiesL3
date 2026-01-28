// src/store/uiStore.js
import { create } from "zustand";

function getInitialTheme() {
  // SSR durumu vs. için küçük koruma, Vite’te sorun olmaz ama dursun
  if (typeof window === "undefined") return "dark";

  // 1) Daha önce kullanıcı tema seçtiyse onu kullan
  const stored = window.localStorage.getItem("astral-bloom-theme");
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  // 2) Sistem tercihine bak (OS dark mode vs.)
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches;

  return prefersDark ? "dark" : "light";
}

export const useUIStore = create((set) => ({
  theme: getInitialTheme(), // "dark" | "light"
  isMobileNavOpen: false, // ileride mobil drawer için kullanırız

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";

      // Kullanıcı seçimini sakla
      if (typeof window !== "undefined") {
        window.localStorage.setItem("astral-bloom-theme", next);
      }

      return { theme: next };
    }),

  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
