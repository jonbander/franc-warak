export type CsvValue = string | number | boolean | null | undefined;

const FORMULA_PREFIX = /^[\u0000-\u0020]*[=+\-@]/;

export const escapeCsvCell = (value: CsvValue): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';

  // Normalize line breaks before quoting so user text cannot create extra CSV rows.
  const text = String(value).replace(/\r\n?|\n/g, ' ');
  const safeText = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export const serializeCsv = (headers: string[], rows: CsvValue[][]): string => {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return `\uFEFF${lines.join('\n')}`;
};
