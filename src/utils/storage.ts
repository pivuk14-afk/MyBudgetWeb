import type { User } from "../types/user";
import type { Transaction } from "../types/transaction";

const USERS_KEY = "mybudget_users";
const CURRENT_USER_ID_KEY = "mybudget_current_user_id";
const TRANSACTIONS_PREFIX = "mybudget_transactions_";

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const loadUsers = (): User[] => {
  return safeParse<User[]>(localStorage.getItem(USERS_KEY)) ?? [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loadCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
};

export const saveCurrentUserId = (userId: string | null) => {
  if (!userId) {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_ID_KEY, userId);
  }
};

export const loadTransactions = (userId: string): Transaction[] => {
  const key = `${TRANSACTIONS_PREFIX}${userId}`;
  return safeParse<Transaction[]>(localStorage.getItem(key)) ?? [];
};

export const saveTransactions = (userId: string, items: Transaction[]) => {
  const key = `${TRANSACTIONS_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(items));
};

