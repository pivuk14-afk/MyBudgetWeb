import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { Transaction } from "../../types/transaction";

const COLORS = ["#f97373", "#fb923c", "#facc15", "#22c55e", "#38bdf8", "#6366f1", "#ec4899", "#a855f7", "#14b8a6"];

interface ExpensesPieChartProps {
  transactions: Transaction[];
}

export const ExpensesPieChart = ({ transactions }: ExpensesPieChartProps) => {
  const map = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    const current = map.get(tx.category) ?? 0;
    map.set(tx.category, current + tx.amount);
  }

  const data = Array.from(map.entries()).map(([name, value]) => ({
    name,
    value
  }));

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500">
        Нет данных по расходам
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `${value.toLocaleString("ru-RU", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} ₽`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

