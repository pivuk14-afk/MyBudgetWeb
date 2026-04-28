import type { Transaction } from "../types/transaction";
import * as XLSX from "xlsx";

export interface MonthlySummaryItem {
  month: number;
  label: string;
  income: number;
  expense: number;
}

export interface CategorySummaryItem {
  category: string;
  total: number;
}

export const buildMonthlySummary = (transactions: Transaction[]): MonthlySummaryItem[] => {
  const map = new Map<number, { income: number; expense: number }>();

  for (const tx of transactions) {
    const d = new Date(tx.date);
    if (Number.isNaN(d.getTime())) continue;
    const month = d.getMonth(); // 0-11
    const current = map.get(month) ?? { income: 0, expense: 0 };
    if (tx.type === "income") {
      current.income += tx.amount;
    } else {
      current.expense += tx.amount;
    }
    map.set(month, current);
  }

  const result: MonthlySummaryItem[] = [];
  for (let m = 0; m < 12; m++) {
    const data = map.get(m) ?? { income: 0, expense: 0 };
    result.push({
      month: m + 1,
      label: `${(m + 1).toString().padStart(2, "0")}`,
      income: data.income,
      expense: data.expense
    });
  }

  return result;
};

export const buildCategorySummary = (transactions: Transaction[]): CategorySummaryItem[] => {
  const map = new Map<string, number>();

  for (const tx of transactions) {
    const current = map.get(tx.category) ?? 0;
    map.set(tx.category, current + tx.amount);
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

export const exportTransactionsToCsv = (filename: string, transactions: Transaction[]) => {
  const rows = transactions.map((tx) => ({
    Дата: new Date(tx.date).toLocaleDateString("ru-RU"),
    Тип: tx.type === "income" ? "Доход" : "Расход",
    Сумма: tx.amount,
    Категория: tx.category,
    Описание: tx.description
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Отчет");

  // XLSX гарантирует корректную кириллицу в Excel без проблем кодировки CSV.
  const safeName = filename.toLowerCase().endsWith(".xlsx")
    ? filename
    : filename.replace(/\.csv$/i, ".xlsx");
  XLSX.writeFile(workbook, safeName, { bookType: "xlsx" });
};

