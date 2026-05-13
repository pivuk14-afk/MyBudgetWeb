/** Текущий баланс: сумма доходов − сумма расходов */
export const computeBalance = (
  items: { type: string; amount: number }[]
): number => {
  let income = 0;
  let expense = 0;
  for (const t of items) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return income - expense;
};

export const EPS = 1e-6;
