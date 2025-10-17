import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: string;
}

interface TelegramState {
  user: TelegramUser | null;
  setUser: (user: TelegramUser) => void;
  clearUser: () => void;
}

export const useTelegramStore = create<TelegramState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'telegram-user', // ✅ key for localStorage
    }
  )
);
