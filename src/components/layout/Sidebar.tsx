import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  PlusCircle,
  MinusCircle,
  ListOrdered,
  LineChart,
  LogOut
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navLinkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    navLinkBase,
    isActive
      ? "bg-primary/10 text-primary"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  ].join(" ");

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    onClose();
  };

  return (
    <>
      {/* Мобильный оверлей */}
      <div
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-md transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 px-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Навигация
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <NavLink to="/dashboard" className={getNavLinkClass} onClick={onClose}>
              <BarChart3 className="h-4 w-4" />
              <span>Дашборд</span>
            </NavLink>

            <NavLink to="/add-income" className={getNavLinkClass} onClick={onClose}>
              <PlusCircle className="h-4 w-4 text-emerald-500" />
              <span>Добавить доход</span>
            </NavLink>

            <NavLink to="/add-expense" className={getNavLinkClass} onClick={onClose}>
              <MinusCircle className="h-4 w-4 text-rose-500" />
              <span>Добавить расход</span>
            </NavLink>

            <NavLink to="/history" className={getNavLinkClass} onClick={onClose}>
              <ListOrdered className="h-4 w-4" />
              <span>История</span>
            </NavLink>

            <NavLink to="/reports" className={getNavLinkClass} onClick={onClose}>
              <LineChart className="h-4 w-4" />
              <span>Отчёты</span>
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>
    </>
  );
};

