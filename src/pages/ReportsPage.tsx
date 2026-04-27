import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "../components/ui/Table";
import { Select } from "../components/ui/Select";
import { MonthlyBarChart } from "../components/charts/MonthlyBarChart";
import { useTransactionsStore } from "../store/transactionsStore";
import { useUiStore } from "../store/uiStore";
import {
  buildCategorySummary,
  buildMonthlySummary,
  exportTransactionsToCsv
} from "../utils/reports";
import { formatCurrency } from "../utils/format";

export const ReportsPage = () => {
  const transactions = useTransactionsStore((s) => s.transactions);
  const showToast = useUiStore((s) => s.showToast);

  const years = useMemo(() => {
    const set = new Set<number>();
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (!Number.isNaN(d.getTime())) {
        set.add(d.getFullYear());
      }
    });
    const result = Array.from(set).sort((a, b) => a - b);
    if (!result.length) {
      result.push(new Date().getFullYear());
    }
    return result;
  }, [transactions]);

  const [selectedYear, setSelectedYear] = useState<number>(years[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const { yearTransactions, monthlyData, topCategories } = useMemo(() => {
    const yearTx = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === selectedYear;
    });

    const monthly = buildMonthlySummary(yearTx);

    const monthNumber =
      selectedMonth === "all" ? undefined : parseInt(selectedMonth, 10);

    const monthFiltered = yearTx.filter((tx) => {
      if (tx.type !== "expense") return false;
      const d = new Date(tx.date);
      if (Number.isNaN(d.getTime())) return false;
      if (monthNumber && d.getMonth() + 1 !== monthNumber) return false;
      return true;
    });

    const categories = buildCategorySummary(monthFiltered);

    return {
      yearTransactions: yearTx,
      monthlyData: monthly,
      topCategories: categories
    };
  }, [transactions, selectedYear, selectedMonth]);

  const handleExport = () => {
    if (!yearTransactions.length) {
      showToast("info", "Нет данных для экспорта");
      return;
    }

    const monthNumber =
      selectedMonth === "all" ? undefined : parseInt(selectedMonth, 10);

    const filtered = yearTransactions.filter((tx) => {
      const d = new Date(tx.date);
      if (Number.isNaN(d.getTime())) return false;
      if (monthNumber && d.getMonth() + 1 !== monthNumber) return false;
      return true;
    });

    if (!filtered.length) {
      showToast("info", "Нет транзакций за выбранный период");
      return;
    }

    const monthPart =
      monthNumber != null ? `-${monthNumber.toString().padStart(2, "0")}` : "";
    const filename = `mybudget-report-${selectedYear}${monthPart}.csv`;
    exportTransactionsToCsv(filename, filtered);
    showToast("success", "Отчёт экспортирован в CSV");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Отчёты</h1>

      <Card title="Параметры отчёта">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Год"
            value={selectedYear.toString()}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>

          <Select
            label="Месяц"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">Все месяцы</option>
            <option value="1">Январь</option>
            <option value="2">Февраль</option>
            <option value="3">Март</option>
            <option value="4">Апрель</option>
            <option value="5">Май</option>
            <option value="6">Июнь</option>
            <option value="7">Июль</option>
            <option value="8">Август</option>
            <option value="9">Сентябрь</option>
            <option value="10">Октябрь</option>
            <option value="11">Ноябрь</option>
            <option value="12">Декабрь</option>
          </Select>

          <div className="flex items-end">
            <Button type="button" fullWidth onClick={handleExport}>
              Экспорт CSV
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Доходы и расходы по месяцам" subtitle={`${selectedYear} год`}>
          <MonthlyBarChart data={monthlyData} />
        </Card>

        <Card title="Топ категорий расходов">
          {topCategories.length === 0 ? (
            <div className="py-4 text-xs text-slate-500">
              Нет данных по расходам за выбранный период.
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Категория</TableHeaderCell>
                  <TableHeaderCell align="right">Сумма</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCategories.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

