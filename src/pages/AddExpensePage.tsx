import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthStore } from "../store/authStore";
import { useTransactionsStore } from "../store/transactionsStore";
import { useUiStore } from "../store/uiStore";
import { computeBalance } from "../utils/balance";
import { formatCurrency } from "../utils/format";
interface AddExpenseFormValues {
  amount: string;
  description: string;
  category: string;
  date: string;
}

const EXPENSE_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Аренда",
  "Коммунальные услуги",
  "Развлечения",
  "Одежда",
  "Здоровье",
  "Образование",
  "Другое"
];

export const AddExpensePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AddExpenseFormValues>({
    defaultValues: {
      category: EXPENSE_CATEGORIES[0]
    }
  });

  const currentUser = useAuthStore((s) => s.currentUser);
  const transactions = useTransactionsStore((s) => s.transactions);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  const availableBalance = useMemo(
    () => computeBalance(transactions),
    [transactions]
  );

  if (!currentUser) return null;

  const onSubmit = async (values: AddExpenseFormValues) => {
    const amount = parseFloat(values.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("error", "Сумма должна быть положительным числом");
      return;
    }

    if (amount > availableBalance + 1e-6) {
      showToast(
        "error",
        `Недостаточно средств. Доступно не больше ${formatCurrency(availableBalance)}.`
      );
      return;
    }

    const isoDate = new Date(values.date).toISOString();

    try {
      await addTransaction({
        type: "expense",
        amount,
        category: values.category,
        description: values.description,
        date: isoDate
      });

      showToast("success", "Расход добавлен");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось добавить расход";
      showToast("error", message);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Добавить расход</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card space-y-4 md:space-y-5"
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-medium">Доступно для расхода: </span>
          <span
            className={
              availableBalance >= 0 ? "text-emerald-700" : "text-rose-700"
            }
          >
            {formatCurrency(Math.max(0, availableBalance))}
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Расход не может сделать баланс отрицательным.
          </p>
        </div>

        <Input
          label="Сумма (₽)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          {...register("amount", { required: "Введите сумму" })}
          error={errors.amount?.message}
        />

        <Input
          label="Описание"
          placeholder="Например, поход в магазин"
          {...register("description", { required: "Укажите описание" })}
          error={errors.description?.message}
        />

        <Select
          label="Категория"
          {...register("category", { required: "Выберите категорию" })}
          error={errors.category?.message}
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Input
          label="Дата"
          type="date"
          {...register("date", { required: "Выберите дату" })}
          error={errors.date?.message}
        />

        <div className="pt-1">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Добавление..." : "Добавить расход"}
          </Button>
        </div>
      </form>
    </div>
  );
};

