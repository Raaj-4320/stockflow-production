import { clsx } from "clsx";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  stickyHeader?: boolean;
  compact?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

const alignMap = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function Table<T>({
  columns,
  data,
  rowKey,
  stickyHeader = false,
  compact = false,
  emptyState,
  className,
  onRowClick,
}: TableProps<T>) {
  const cellPad = compact ? "px-3 py-2" : "px-4 py-3.5";

  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse min-w-max">
        <thead
          className={clsx(
            "bg-[var(--surface)]",
            stickyHeader && "sticky top-0 z-10 backdrop-blur"
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={clsx(
                  cellPad,
                  "text-2xs font-medium text-muted uppercase tracking-wider border-b border-subtle whitespace-nowrap",
                  alignMap[col.align ?? "left"],
                  col.className
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-faint">
                      <path d="M5 2L8 5H2z" fill="currentColor" />
                      <path d="M5 8L2 5h6z" fill="currentColor" opacity="0.4" />
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-muted">
                {emptyState ?? "No data"}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  "border-b border-subtle last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-[var(--surface-hover)]"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      cellPad,
                      "text-sm text-text",
                      alignMap[col.align ?? "left"],
                      col.className
                    )}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
