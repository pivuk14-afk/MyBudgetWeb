import { X } from "lucide-react";
import { useUiStore } from "../../store/uiStore";

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 md:justify-end md:px-6">
      <div className="space-y-2">
        {toasts.map((toast) => {
          const colorMap: Record<string, string> = {
            success: "border-emerald-400 bg-emerald-50 text-emerald-900",
            error: "border-rose-400 bg-rose-50 text-rose-900",
            info: "border-sky-400 bg-sky-50 text-sky-900"
          };

          return (
            <div
              key={toast.id}
              className={`flex min-w-[260px] max-w-sm items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-md ${
                colorMap[toast.type] ?? colorMap.info
              }`}
            >
              <div className="flex-1">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="mt-0.5 rounded-full p-0.5 text-xs text-slate-500 hover:bg-black/5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

