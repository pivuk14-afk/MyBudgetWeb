import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useAuthStore } from "../store/authStore";
import { useTransactionsStore } from "../store/transactionsStore";
import { useUiStore } from "../store/uiStore";

interface AddIncomeFormValues {
  amount: string;
  source: string;
  category: string;
  date: string;
}

const INCOME_CATEGORIES = [
  "Зарплата",
  "Фриланс",
  "Инвестиции",
  "Подработка",
  "Подарок",
  "Другое"
];

export const AddIncomePage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddIncomeFormValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: INCOME_CATEGORIES[0]
    }
  });

  const currentUser = useAuthStore((s) => s.currentUser);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  if (!currentUser) return null;

  const onSubmit = async (values: AddIncomeFormValues) => {
    const amount = parseFloat(values.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("error", "Сумма должна быть положительным числом");
      return;
    }

    const isoDate = new Date(values.date).toISOString();

    addTransaction(currentUser.id, {
      type: "income",
      amount,
      category: values.category,
      description: values.source,
      date: isoDate
    });

    showToast("success", "Доход добавлен");
    reset({
      amount: "",
      source: "",
      category: INCOME_CATEGORIES[0],
      date: new Date().toISOString().slice(0, 10)
    });
    navigate("/dashboard");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Добавить доход</h1>

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
          label="Источник"
          placeholder="Например, зарплата"
          {...register("source", { required: "Укажите источник дохода" })}
          error={errors.source?.message}
        />

        <Select
          label="Категория"
          {...register("category", { required: "Выберите категорию" })}
          error={errors.category?.message}
        >
          {INCOME_CATEGORIES.map((cat) => (
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
            {isSubmitting ? "Добавление..." : "Добавить доход"}
          </Button>
        </div>
      </form>
    </div>
  );
};

