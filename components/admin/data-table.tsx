import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  empty = 'Nothing to show.',
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
      {caption ? (
        <div className="border-b border-line px-6 py-4">
          <p className="text-sm font-semibold text-ink">{caption}</p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-ink-muted">{empty}</p>
      ) : (
        <div className="wf-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-2xs uppercase tracking-[0.12em] text-ink-faint">
                {columns.map((column) => (
                  <th key={column.key} scope="col" className={cn('px-6 py-3 font-semibold', column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-line/70 last:border-0 transition-colors hover:bg-surface-soft">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-6 py-4 text-sm text-ink-soft', column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
