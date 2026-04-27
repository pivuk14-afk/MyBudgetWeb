import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>();

  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      showToast("success", "Добро пожаловать!");
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось выполнить вход";
      showToast("error", message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Вход в MyBudget Web
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Введите данные аккаунта, чтобы продолжить
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            autoComplete="current-password"
            {...register("password", { required: "Введите пароль" })}
            error={errors.password?.message}
          />

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-600">
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

