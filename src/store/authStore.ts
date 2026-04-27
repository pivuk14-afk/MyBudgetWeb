import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { User } from "../types/user";
import { hashPassword } from "../utils/password";
import {
  loadCurrentUserId,
  loadUsers,
  saveCurrentUserId,
  saveUsers
} from "../utils/storage";
import { useTransactionsStore } from "./transactionsStore";

interface AuthState {
  currentUser: User | null;
  users: User[];
  isInitialized: boolean;
  initFromStorage: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  isInitialized: false,
  initFromStorage: () => {
    const users = loadUsers();
    const currentUserId = loadCurrentUserId();
    const currentUser = users.find((u) => u.id === currentUserId) ?? null;

    set({ users, currentUser, isInitialized: true });

    if (currentUser) {
      useTransactionsStore.getState().loadForUser(currentUser.id);
    }
  },
  register: async (name, email, password) => {
    const { users } = get();
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email === normalizedEmail);
    if (exists) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const newUser: User = {
      id: uuidv4(),
      email: normalizedEmail,
      password: hashPassword(password),
      name: name.trim()
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    saveCurrentUserId(newUser.id);

    set({ users: updatedUsers, currentUser: newUser });
    useTransactionsStore.getState().loadForUser(newUser.id);
  },
  login: async (email, password) => {
    const { users } = get();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) {
      throw new Error("Неверный email или пароль");
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      throw new Error("Неверный email или пароль");
    }

    saveCurrentUserId(user.id);
    set({ currentUser: user });
    useTransactionsStore.getState().loadForUser(user.id);
  },
  logout: () => {
    saveCurrentUserId(null);
    set({ currentUser: null });
    useTransactionsStore.getState().clear();
  }
}));

