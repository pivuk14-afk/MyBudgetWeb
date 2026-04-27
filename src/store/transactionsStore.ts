import { create } from "zustand";
import type { Transaction } from "../types/transaction";
import { apiRequest } from "../utils/api";

interface TransactionsState {
  transactions: Transaction[];
  isLoaded: boolean;
  loadForUser: () => Promise<void>;
  addTransaction: (
    data: Omit<Transaction, "id">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, "id">>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clear: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoaded: false,
  loadForUser: async () => {
    const items = await apiRequest<Transaction[]>("/transactions", {
      method: "GET",
      auth: true
    });
    set({ transactions: items, isLoaded: true });
  },
  addTransaction: async (data) => {
    const created = await apiRequest<Transaction>("/transactions", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data)
    });
    set((state) => ({ transactions: [created, ...state.transactions] }));
  },
  updateTransaction: async (id, updates) => {
    const updatedTx = await apiRequest<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(updates)
    });
    set((state) => {
      const updated = state.transactions.map((tx) =>
        tx.id === id ? updatedTx : tx
      );
      return { transactions: updated };
    });
  },
  deleteTransaction: async (id) => {
    await apiRequest<void>(`/transactions/${id}`, {
      method: "DELETE",
      auth: true
    });
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id)
    }));
  },
  clear: () => set({ transactions: [], isLoaded: false })
}));

