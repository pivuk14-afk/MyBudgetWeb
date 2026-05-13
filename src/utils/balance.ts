import type { Transaction } from "../types/transaction";

/** Баланс: доходы − расходы */
export const computeBalance = (transactions: Transaction[]): number => {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  }
  return income - expense;
};
