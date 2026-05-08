export function exportCSV(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(';');
  const body = rows.map(row =>
    keys.map(k => {
      const v = row[k];
      if (v === null || v === undefined) return '';
      const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(';')
  );
  const csv = '﻿' + [header, ...body].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
