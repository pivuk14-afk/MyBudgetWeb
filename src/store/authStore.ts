import { create } from "zustand";
import type { User } from "../types/user";
import { apiRequest } from "../utils/api";
import { loadAccessToken, saveAccessToken } from "../utils/storage";
import { useTransactionsStore } from "./transactionsStore";

interface AuthState {
  currentUser: User | null;
  isInitialized: boolean;
  initFromStorage: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isInitialized: false,
  initFromStorage: async () => {
    const token = loadAccessToken();
    if (!token) {
      set({ currentUser: null, isInitialized: true });
      return;
    }

    try {
      const user = await apiRequest<User>("/auth/me", {
        method: "GET",
        auth: true
      });

      set({ currentUser: user, isInitialized: true });
      await useTransactionsStore.getState().loadForUser();
    } catch {
      saveAccessToken(null);
      set({ currentUser: null, isInitialized: true });
      useTransactionsStore.getState().clear();
    }
  },
  register: async (name, email, password) => {
    const response = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      })
    });

    saveAccessToken(response.accessToken);
    set({ currentUser: response.user });
    await useTransactionsStore.getState().loadForUser();
  },
  login: async (email, password) => {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password
      })
    });

    saveAccessToken(response.accessToken);
    set({ currentUser: response.user });
    await useTransactionsStore.getState().loadForUser();
  },
  logout: () => {
    saveAccessToken(null);
    set({ currentUser: null });
    useTransactionsStore.getState().clear();
  }
}));

