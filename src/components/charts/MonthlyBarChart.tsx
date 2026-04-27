import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";
import type { MonthlySummaryItem } from "../../utils/reports";

interface MonthlyBarChartProps {
  data: MonthlySummaryItem[];
}

export const MonthlyBarChart = ({ data }: MonthlyBarChartProps) => {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center text-xs text-slate-500">
        Нет данных для отчёта
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip
            formatter={(value: number) =>
              `${value.toLocaleString("ru-RU", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ₽`
            }
          />
          <Legend />
          <Bar
            dataKey="income"
            name="Доходы"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expense"
            name="Расходы"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

