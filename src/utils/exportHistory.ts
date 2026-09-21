import type { CalculationHistoryItem } from '../types/calculator';

/**
 * Escapes an individual field according to RFC 4180 CSV specifications:
 * - If the field contains commas, double quotes, or newlines, it must be enclosed in double quotes.
 * - Any double quote character inside the field is escaped by doubling it ("").
 */
export function escapeCSVField(val: string): string {
  if (typeof val !== 'string') {
    return '""';
  }

  const needsQuotes = /[",\r\n]/.test(val);
  if (needsQuotes) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Converts calculation history items into an RFC 4180 compliant CSV string with headers.
 */
export function historyToCSV(items: readonly CalculationHistoryItem[]): string {
  const headers = ['Timestamp', 'Date (ISO)', 'Expression', 'Result'];
  const headerRow = headers.map(escapeCSVField).join(',');

  if (!items || items.length === 0) {
    return headerRow + '\r\n';
  }

  const rows = items.map((item) => {
    let isoDate = '';
    try {
      if (typeof item.timestamp === 'number' && Number.isFinite(item.timestamp)) {
        isoDate = new Date(item.timestamp).toISOString();
      }
    } catch {
      isoDate = '';
    }

    const cols = [
      String(item.timestamp ?? ''),
      isoDate,
      item.expression,
      item.result,
    ];

    return cols.map(escapeCSVField).join(',');
  });

  return [headerRow, ...rows].join('\r\n') + '\r\n';
}

/**
 * Triggers a browser download of calculation history in CSV format.
 * Automatically handles Blob generation, URL creation, and cleanup.
 * Fails gracefully and returns false if browser APIs are unavailable.
 */
export function exportHistoryAsCSV(
  items: readonly CalculationHistoryItem[],
  customFilename?: string
): boolean {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false;
  }

  try {
    const csvContent = historyToCSV(items);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);

    const filename =
      customFilename ||
      `calcx-pro-history-${new Date().toISOString().slice(0, 10)}.csv`;

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', objectUrl);
    downloadLink.setAttribute('download', filename);
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up allocated blob URL
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 100);

    return true;
  } catch {
    return false;
  }
}
