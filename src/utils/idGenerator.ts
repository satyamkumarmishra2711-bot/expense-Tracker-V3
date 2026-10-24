/**
 * Generates a deterministic unique Transaction ID.
 * Uses a combination of Card identifier, Date, Amount, Type, and sanitized Description/RefID.
 * Same transaction uploaded multiple times across statements will generate the EXACT same ID,
 * preventing duplicate records.
 */
export function generateTransactionId(params: {
  card: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  reference_id?: string;
}): string {
  const cleanCard = (params.card || 'card').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanDate = (params.date || '').replace(/[^0-9]/g, '');
  const cleanAmount = Number(params.amount || 0).toFixed(2);
  const cleanType = (params.type || 'debit').substring(0, 2).toLowerCase();
  
  // Clean description: remove transient digits/auth codes/dates, keep merchant tokens
  const cleanRef = (params.reference_id || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanDesc = (params.description || '')
    .toLowerCase()
    .replace(/ref\s*no[:.\s]*\w+/gi, '')
    .replace(/auth\s*code[:.\s]*\w+/gi, '')
    .replace(/[\s\-_/\\.:,]+/g, ' ')
    .trim();

  // Create a 32-bit hash representation
  const inputString = `${cleanCard}_${cleanDate}_${cleanAmount}_${cleanType}_${cleanRef || cleanDesc}`;
  
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  return `tx_${cleanDate || 'nodate'}_${hexHash}_${cleanAmount.replace('.', '')}`;
}

/**
 * Derives normalized statement month (YYYY-MM) and readable label from a date or statement string.
 */
export function getStatementMonth(dateStr: string): { key: string; label: string } {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (dateStr) {
    const clean = dateStr.trim();
    // Direct YYYY-MM-DD or YYYY-MM
    const isoMatch = clean.match(/^(\d{4})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthNum = parseInt(isoMatch[2], 10);
      if (monthNum >= 1 && monthNum <= 12) {
        return {
          key: `${year}-${isoMatch[2]}`,
          label: `${monthNames[monthNum - 1]} ${year}`
        };
      }
    }
  }

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return {
        key: `${year}-${month}`,
        label: `${monthNames[date.getMonth()]} ${year}`
      };
    }
  } catch {}
  
  return {
    key: '2026-10',
    label: 'October 2026'
  };
}

/**
 * Calculates user-selectable billing cycle (e.g. 18th to 18th, 1st to 1st, 15th to 15th, etc.).
 * Default cycle end day is 18th (runs from 19th of prev month to 18th of current month).
 */
export function getBillingCycle(dateStr: string, cycleEndDay: number = 18): { key: string; label: string; rangeText: string } {
  if (!dateStr) {
    return { key: '2026-10', label: 'Oct 2026 (19 Sep - 18 Oct)', rangeText: '19 Sep - 18 Oct' };
  }

  // If cycleEndDay is 1 or <= 0 (standard Calendar Month 1st to end of month)
  if (cycleEndDay === 1 || cycleEndDay <= 0) {
    const monthObj = getStatementMonth(dateStr);
    return {
      key: monthObj.key,
      label: monthObj.label,
      rangeText: `1st - ${monthObj.label.split(' ')[0]}`
    };
  }

  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-');
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);

      // If day > cycleEndDay, it falls into the billing cycle ending on cycleEndDay of next month
      const targetEndDate = day > cycleEndDay ? new Date(year, month + 1, cycleEndDay) : new Date(year, month, cycleEndDay);
      const startDay = cycleEndDay + 1;
      const targetStartDate = new Date(targetEndDate.getFullYear(), targetEndDate.getMonth() - 1, startDay);

      const endYear = targetEndDate.getFullYear();
      const endMonthNum = String(targetEndDate.getMonth() + 1).padStart(2, '0');
      const key = `${endYear}-${endMonthNum}`;

      const startMonthName = targetStartDate.toLocaleString('en-US', { month: 'short' });
      const endMonthName = targetEndDate.toLocaleString('en-US', { month: 'short' });
      const fullEndMonth = targetEndDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      const rangeText = `${startDay} ${startMonthName} - ${cycleEndDay} ${endMonthName}`;
      const label = `${fullEndMonth} (${rangeText})`;

      return { key, label, rangeText };
    }
  } catch {}

  return { key: '2026-10', label: 'Oct 2026', rangeText: `Day ${cycleEndDay}` };
}

// Backward-compatible alias
export const get18thBillingCycle = (dateStr: string) => getBillingCycle(dateStr, 18);
