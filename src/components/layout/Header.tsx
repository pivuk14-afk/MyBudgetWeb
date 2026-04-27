import { Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getInitials } from "../../utils/format";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const user = useAuthStore((s) => s.currentUser);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="text-sm font-semibold tracking-tight text-primary">
              MyBudget Web
            </div>
            <div className="text-xs text-slate-500">
              Личный учёт доходов и расходов
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs md:block">
              <div className="font-semibold text-slate-800">{user.name}</div>
              <div className="text-slate-500">{user.email}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

