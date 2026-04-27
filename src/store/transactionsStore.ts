import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Transaction } from "../types/transaction";
import { loadTransactions, saveTransactions } from "../utils/storage";

interface TransactionsState {
  transactions: Transaction[];
  isLoaded: boolean;
  loadForUser: (userId: string) => void;
  addTransaction: (
    userId: string,
    data: Omit<Transaction, "id">
  ) => void;
  updateTransaction: (
    userId: string,
    id: string,
    updates: Partial<Omit<Transaction, "id">>
  ) => void;
  deleteTransaction: (userId: string, id: string) => void;
  clear: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  isLoaded: false,
  loadForUser: (userId) => {
    const items = loadTransactions(userId);
    set({ transactions: items, isLoaded: true });
  },
  addTransaction: (userId, data) => {
    const tx: Transaction = { ...data, id: uuidv4() };
    set((state) => {
      const updated = [tx, ...state.transactions];
      saveTransactions(userId, updated);
      return { transactions: updated };
    });
  },
  updateTransaction: (userId, id, updates) => {
    set((state) => {
      const updated = state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      );
      saveTransactions(userId, updated);
      return { transactions: updated };
    });
  },
  deleteTransaction: (userId, id) => {
    set((state) => {
      const updated = state.transactions.filter((tx) => tx.id !== id);
      saveTransactions(userId, updated);
      return { transactions: updated };
    });
  },
  clear: () => set({ transactions: [], isLoaded: false })
}));

