import { create } from "zustand";
import type { Toast, ToastType } from "../types/toast";

interface UiState {
  toasts: Toast[];
  showToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  showToast: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = { id, type, message };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
  clearToasts: () => set({ toasts: [] })
}));

