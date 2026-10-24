/**
 * Date utility functions for accurate calculation of Today, This Week, and This Month metrics.
 * Supports sheet date format M/D/YYYY (e.g., 10/4/2026 for 4th Oct 2026).
 */

/**
 * Returns current local date as YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month as YYYY-MM
 */
export function getCurrentMonthString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns Monday of current week (YYYY-MM-DD)
 */
export function getStartOfWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return getLocalDateString(monday);
}

/**
 * Returns Sunday of current week (YYYY-MM-DD)
 */
export function getEndOfWeek(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() + (day === 0 ? 0 : 7 - day);
  const sunday = new Date(date.setDate(diff));
  return getLocalDateString(sunday);
}

/**
 * Parses dates from Google Sheets (e.g., "10/4/2026" or "10/04/2026" for 4th Oct) into standardized "YYYY-MM-DD"
 */
export function parseSheetDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const clean = String(dateStr).trim();

  // Handle M/D/YYYY or MM/DD/YYYY (e.g., 10/4/2026 for 4th Oct 2026)
  const slashMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slashMatch) {
    const month = String(parseInt(slashMatch[1], 10)).padStart(2, '0');
    const day = String(parseInt(slashMatch[2], 10)).padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY-MM-DD (e.g. 2026-10-04)
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.substring(0, 10);
  }

  // Handle "4-Oct-2026" or "04-Oct-2026"
  const wordMonthMatch = clean.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,9})[-\s/](\d{4})$/);
  if (wordMonthMatch) {
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const mStr = wordMonthMatch[2].toLowerCase().substring(0, 3);
    const month = monthMap[mStr] || '10';
    const day = String(parseInt(wordMonthMatch[1], 10)).padStart(2, '0');
    const year = wordMonthMatch[3];
    return `${year}-${month}-${day}`;
  }

  return clean;
}

/**
 * Formats standardized ISO "YYYY-MM-DD" into Google Sheet format "M/D/YYYY" (e.g. "10/4/2026" for 4th Oct 2026)
 */
export function formatISOToSheetDate(dateStr: string): string {
  if (!dateStr) return '';
  const clean = String(dateStr).trim();

  // If already M/D/YYYY format, keep it
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    return clean;
  }

  // Convert YYYY-MM-DD to M/D/YYYY
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    return `${month}/${day}/${year}`;
  }

  return clean;
}

/**
 * Formats a date string nicely for the UI (e.g., '04 Oct', 'Today')
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const iso = parseSheetDateToISO(dateStr);
  const today = getLocalDateString();
  if (iso === today) return 'Today';
  
  try {
    const parts = iso.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
  } catch {}
  return dateStr;
}

export function getMonthFriendlyLabel(monthKey: string): string {
  if (!monthKey) return '';
  try {
    const parts = monthKey.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
    }
  } catch {}
  return monthKey;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
