import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthStore } from "../store/authStore";
import { useTransactionsStore } from "../store/transactionsStore";
import { useUiStore } from "../store/uiStore";

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
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const onSubmit = async (values: AddExpenseFormValues) => {
    const amount = parseFloat(values.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("error", "Сумма должна быть положительным числом");
      return;
    }

    const isoDate = new Date(values.date).toISOString();

    addTransaction(currentUser.id, {
      type: "expense",
      amount,
      category: values.category,
      description: values.description,
      date: isoDate
    });

    showToast("success", "Расход добавлен");
    navigate("/dashboard");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Добавить расход</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card space-y-4 md:space-y-5"
      >
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

