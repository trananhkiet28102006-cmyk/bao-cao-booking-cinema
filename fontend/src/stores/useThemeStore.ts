import { create } from 'zustand';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: true, // Mặc định Dark mode theo đúng ảnh concept
  toggleTheme: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      if (typeof document !== 'undefined') {
        if (nextMode) {
          document.documentElement.classList.remove('light-theme');
        } else {
          document.documentElement.classList.add('light-theme');
        }
      }
      return { isDarkMode: nextMode };
    }),
}));
