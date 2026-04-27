import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, X } from "lucide-react";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "../components/ui/Table";
import { Pagination } from "../components/ui/Pagination";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useTransactionsStore } from "../store/transactionsStore";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { formatCurrency, formatDate } from "../utils/format";
import type { Transaction } from "../types/transaction";

const PAGE_SIZE = 10;

interface EditFormValues {
  amount: string;
  description: string;
  category: string;
  date: string;
}

const toInputDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const HistoryPage = () => {
  const transactions = useTransactionsStore((s) => s.transactions);
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);
  const updateTransaction = useTransactionsStore((s) => s.updateTransaction);
  const currentUser = useAuthStore((s) => s.currentUser);
  const showToast = useUiStore((s) => s.showToast);

  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (categoryFilter !== "all" && tx.category !== categoryFilter)
        return false;

      const d = new Date(tx.date);
      if (!Number.isNaN(d.getTime())) {
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (d < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          if (d > to) return false;
        }
      }

      if (search.trim()) {
        const term = search.trim().toLowerCase();
        if (!tx.description.toLowerCase().includes(term)) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, dateFrom, dateTo, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (!currentUser) return null;

  const handleDelete = (tx: Transaction) => {
    const confirmed = window.confirm("Удалить эту транзакцию?");
    if (!confirmed) return;
    deleteTransaction(tx.id)
      .then(() => {
        showToast("success", "Транзакция удалена");
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось удалить транзакцию";
        showToast("error", message);
      });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EditFormValues>();

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    reset({
      amount: tx.amount.toString().replace(".", ","),
      description: tx.description,
      category: tx.category,
      date: toInputDate(tx.date)
    });
  };

  const closeEdit = () => {
    setEditingTx(null);
  };

  const onEditSubmit = async (values: EditFormValues) => {
    if (!editingTx || !currentUser) return;

    const amount = parseFloat(values.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("error", "Сумма должна быть положительным числом");
      return;
    }

    const isoDate = new Date(values.date).toISOString();

    try {
      await updateTransaction(editingTx.id, {
        amount,
        description: values.description,
        category: values.category,
        date: isoDate
      });

      showToast("success", "Транзакция обновлена");
      closeEdit();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось обновить транзакцию";
      showToast("error", message);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">
        История транзакций
      </h1>

      <Card title="Фильтры">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Тип"
            value={typeFilter}
            onChange={(e) =>
              (setPage(1), setTypeFilter(e.target.value as typeof typeFilter))
            }
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </Select>

          <Select
            label="Категория"
            value={categoryFilter}
            onChange={(e) => (setPage(1), setCategoryFilter(e.target.value))}
          >
            <option value="all">Все категории</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Input
            label="Дата от"
            type="date"
            value={dateFrom}
            onChange={(e) => (setPage(1), setDateFrom(e.target.value))}
          />

          <Input
            label="Дата до"
            type="date"
            value={dateTo}
            onChange={(e) => (setPage(1), setDateTo(e.target.value))}
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input
            label="Поиск по описанию"
            placeholder="Например, магазин"
            value={search}
            onChange={(e) => (setPage(1), setSearch(e.target.value))}
          />
        </div>
      </Card>

      <Card title="Транзакции">
        {filtered.length === 0 ? (
          <div className="py-4 text-xs text-slate-500">
            По выбранным фильтрам транзакции не найдены.
          </div>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Дата</TableHeaderCell>
                  <TableHeaderCell>Тип</TableHeaderCell>
                  <TableHeaderCell align="right">Сумма</TableHeaderCell>
                  <TableHeaderCell>Категория</TableHeaderCell>
                  <TableHeaderCell>Описание</TableHeaderCell>
                  <TableHeaderCell align="center">Действия</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          tx.type === "income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {tx.type === "income" ? "Доход" : "Расход"}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span
                        className={
                          tx.type === "income"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {tx.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                          title="Редактировать"
                          onClick={() => openEdit(tx)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-rose-50 p-1 text-rose-600 hover:bg-rose-100"
                          title="Удалить"
                          onClick={() => handleDelete(tx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Редактирование транзакции
              </h2>
              <button
                type="button"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                onClick={closeEdit}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-3">
              <Input
                label="Сумма (₽)"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { required: "Введите сумму" })}
                error={errors.amount?.message}
              />

              <Input
                label="Описание"
                {...register("description", { required: "Введите описание" })}
                error={errors.description?.message}
              />

              <Input
                label="Категория"
                {...register("category", { required: "Введите категорию" })}
                error={errors.category?.message}
              />

              <Input
                label="Дата"
                type="date"
                {...register("date", { required: "Выберите дату" })}
                error={errors.date?.message}
              />

              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeEdit}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

