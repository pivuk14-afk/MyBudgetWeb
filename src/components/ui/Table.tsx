import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
};

interface TableHeadProps {
  children: ReactNode;
}

export const TableHead = ({ children }: TableHeadProps) => (
  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
    {children}
  </thead>
);

interface TableBodyProps {
  children: ReactNode;
}

export const TableBody = ({ children }: TableBodyProps) => (
  <tbody className="divide-y divide-slate-100">{children}</tbody>
);

interface TableRowProps {
  children: ReactNode;
}

export const TableRow = ({ children }: TableRowProps) => (
  <tr className="border-b border-slate-100 last:border-0">{children}</tr>
);

interface TableHeaderCellProps {
  children: ReactNode;
  align?: "left" | "right" | "center";
}

export const TableHeaderCell = ({
  children,
  align = "left"
}: TableHeaderCellProps) => (
  <th
    className={`px-4 py-2 text-xs font-semibold text-slate-500 ${
      align === "right"
        ? "text-right"
        : align === "center"
        ? "text-center"
        : "text-left"
    }`}
  >
    {children}
  </th>
);

interface TableCellProps {
  children: ReactNode;
  align?: "left" | "right" | "center";
}

export const TableCell = ({ children, align = "left" }: TableCellProps) => (
  <td
    className={`px-4 py-2 text-sm text-slate-700 ${
      align === "right"
        ? "text-right"
        : align === "center"
        ? "text-center"
        : "text-left"
    }`}
  >
    {children}
  </td>
);

