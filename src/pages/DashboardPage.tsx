import { useMemo } from "react";
import { Card } from "../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/Table";
import { ExpensesPieChart } from "../components/charts/ExpensesPieChart";
import { IncomeExpenseLineChart } from "../components/charts/IncomeExpenseLineChart";
import { useTransactionsStore } from "../store/transactionsStore";
import { formatCurrency, formatDate } from "../utils/format";

export const DashboardPage = () => {
  const transactions = useTransactionsStore((s) => s.transactions);

  const { totalIncome, totalExpense, balance, monthSavings, lastTransactions } =
    useMemo(() => {
      let income = 0;
      let expense = 0;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let monthIncome = 0;
      let monthExpense = 0;

      for (const tx of transactions) {
        if (tx.type === "income") {
          income += tx.amount;
        } else {
          expense += tx.amount;
        }

        const d = new Date(tx.date);
        if (
          !Number.isNaN(d.getTime()) &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        ) {
          if (tx.type === "income") {
            monthIncome += tx.amount;
          } else {
            monthExpense += tx.amount;
          }
        }
      }

      const ordered = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        monthSavings: monthIncome - monthExpense,
        lastTransactions: ordered.slice(0, 5)
      };
    }, [transactions]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Общий доход">
          <div className="text-sm text-emerald-600">Доходы за всё время</div>
          <div className="mt-2 text-xl font-semibold text-emerald-700">
            {formatCurrency(totalIncome)}
          </div>
        </Card>

        <Card title="Общие расходы">
          <div className="text-sm text-rose-600">Расходы за всё время</div>
          <div className="mt-2 text-xl font-semibold text-rose-700">
            {formatCurrency(totalExpense)}
          </div>
        </Card>

        <Card title="Текущий баланс">
          <div className="text-sm text-sky-600">Доходы - расходы</div>
          <div className="mt-2 text-xl font-semibold text-sky-700">
            {formatCurrency(balance)}
          </div>
        </Card>

        <Card title="Экономия в этом месяце">
          <div className="text-sm text-slate-600">
            Разница доходов и расходов
          </div>
          <div className="mt-2 text-xl font-semibold text-slate-800">
            {formatCurrency(monthSavings)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Структура расходов по категориям">
          <ExpensesPieChart transactions={transactions} />
        </Card>

        <Card title="Доходы и расходы за 6 месяцев">
          <IncomeExpenseLineChart transactions={transactions} />
        </Card>
      </div>

      <Card title="Последние транзакции" subtitle="5 последних операций">
        {lastTransactions.length === 0 ? (
          <div className="py-4 text-xs text-slate-500">
            Пока нет ни одной транзакции. Начните с добавления дохода или
            расхода.
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Дата</TableHeaderCell>
                <TableHeaderCell>Тип</TableHeaderCell>
                <TableHeaderCell align="right">Сумма</TableHeaderCell>
                <TableHeaderCell>Категория</TableHeaderCell>
                <TableHeaderCell>Описание</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lastTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        tx.type === "income"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {tx.type === "income" ? "Доход" : "Расход"}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span
                      className={
                        tx.type === "income"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    >
                      {tx.type === "income" ? "+" : "-"}{" "}
                      {formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

