import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>();

  const registerUser = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values.name, values.email, values.password);
      showToast("success", "Аккаунт создан");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось создать аккаунт";
      showToast("error", message);
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Регистрация в MyBudget Web
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Создайте новый аккаунт, чтобы начать учёт бюджета
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Имя"
            placeholder="Иван Иванов"
            {...register("name", { required: "Введите имя" })}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email", { required: "Введите email" })}
            error={errors.email?.message}
          />

          <Input
            label="Пароль"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Введите пароль",
              minLength: {
                value: 6,
                message: "Минимальная длина пароля — 6 символов"
              }
            })}
            error={errors.password?.message}
          />

          <Input
            label="Повторите пароль"
            type="password"
            autoComplete="new-password"
            {...register("passwordConfirm", {
              required: "Повторите пароль",
              validate: (value) =>
                value === passwordValue || "Пароли не совпадают"
            })}
            error={errors.passwordConfirm?.message}
          />

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать аккаунт"}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-600">
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};

