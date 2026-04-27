import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import type { Transaction } from "../../types/transaction";

interface IncomeExpenseLineChartProps {
  transactions: Transaction[];
}

interface LinePoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export const IncomeExpenseLineChart = ({
  transactions
}: IncomeExpenseLineChartProps) => {
  const now = new Date();

  const points: LinePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("ru-RU", {
      month: "short"
    });
    points.push({ key, label, income: 0, expense: 0 });
  }

  const pointMap = new Map(points.map((p) => [p.key, p]));

  for (const tx of transactions) {
    const d = new Date(tx.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point = pointMap.get(key);
    if (!point) continue;
    if (tx.type === "income") {
      point.income += tx.amount;
    } else {
      point.expense += tx.amount;
    }
  }

  if (!transactions.length) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500">
        Нет данных по транзакциям
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={points}>
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
          <Line
            type="monotone"
            dataKey="income"
            name="Доходы"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Расходы"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

