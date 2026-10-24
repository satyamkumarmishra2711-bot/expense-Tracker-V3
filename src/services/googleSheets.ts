import { Transaction, SheetMetadata, CategoryRule } from '../types/expense';
import { getAccessToken } from './auth';
import { parseSheetDateToISO, formatISOToSheetDate } from '../utils/dateUtils';

export const SHEET_HEADERS = [
  'Transaction_ID',
  'Date',
  'Description',
  'Merchant',
  'Amount',
  'Type',
  'Category',
  'Card',
  'Statement_ID',
  'Statement_Month',
  'Source_File',
  'Reference_ID',
  'Created_Date',
  'Updated_Date',
  'Notes'
];

export const DEFAULT_SHEET_NAME = 'Transactions';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * List Google Spreadsheets from user's Drive.
 */
export async function listUserSpreadsheets(): Promise<SheetMetadata[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Drive list query notice:', errorText);
      return [];
    }

    const data = await response.json();
    const files: GoogleDriveFile[] = data.files || [];

    return files.map(file => ({
      spreadsheetId: file.id,
      title: file.name,
      sheetName: DEFAULT_SHEET_NAME,
      url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      lastSyncedAt: file.modifiedTime
    }));
  } catch (err) {
    console.warn('Drive list error:', err);
    return [];
  }
}

/**
 * Connect to an existing Google Spreadsheet by URL or ID.
 */
export async function getSheetMetadataById(inputUrlOrId: string): Promise<SheetMetadata> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to connect this spreadsheet.');

  let sheetId = inputUrlOrId.trim();
  const urlMatch = inputUrlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    sheetId = urlMatch[1];
  }

  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) {
    throw new Error(`Could not access spreadsheet. Please make sure you are signed in with the Google account that has access to it.`);
  }

  const metaData = await metaRes.json();
  const title = metaData.properties?.title || `Google Sheet (${sheetId.substring(0, 8)})`;
  const sheets = metaData.sheets || [];
  const primarySheet = sheets[0]?.properties?.title || DEFAULT_SHEET_NAME;

  return {
    spreadsheetId: sheetId,
    title,
    sheetName: primarySheet,
    url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    lastSyncedAt: new Date().toISOString()
  };
}

/**
 * Creates a brand new Google Spreadsheet configured for StatementFlow expenses.
 */
export async function createStatementSpreadsheet(customTitle?: string): Promise<SheetMetadata> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to create a Google Sheet.');

  const title = customTitle || `StatementFlow Expenses - ${new Date().getFullYear()}`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: DEFAULT_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Sheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetId = sheetData.sheets?.[0]?.properties?.sheetId || 0;

  // Initialize header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${DEFAULT_SHEET_NAME}!A1:O1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [SHEET_HEADERS]
      })
    }
  );

  // Apply beautiful styling to header: dark background, white text, bold, freeze
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_HEADERS.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.12, blue: 0.2 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: SHEET_HEADERS.length
              }
            }
          }
        ]
      })
    });
  } catch (styleErr) {
    console.warn('Non-fatal error applying styles to sheet:', styleErr);
  }

  return {
    spreadsheetId,
    title,
    sheetName: DEFAULT_SHEET_NAME,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    lastSyncedAt: new Date().toISOString()
  };
}

export function normalizeStatementMonth(monthVal: string, dateVal: string): string {
  if (monthVal) {
    const clean = monthVal.trim();
    if (/^\d{4}-\d{2}$/.test(clean)) return clean;
    const mMatch = clean.match(/([A-Za-z]{3,9})\s*(\d{4})/i);
    if (mMatch) {
      const monthNames: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };
      const mStr = mMatch[1].toLowerCase().substring(0, 3);
      if (monthNames[mStr]) {
        return `${mMatch[2]}-${monthNames[mStr]}`;
      }
    }
  }

  if (dateVal) {
    const iso = parseSheetDateToISO(dateVal);
    if (/^\d{4}-\d{2}/.test(iso)) {
      return iso.substring(0, 7);
    }
  }

  return '2026-10';
}

/**
 * Fetches all transactions from the connected Google Sheet.
 */
export async function fetchSheetTransactions(spreadsheetId: string, sheetName = DEFAULT_SHEET_NAME): Promise<Transaction[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // First inspect spreadsheet metadata to verify sheet tab name
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let effectiveSheetName = sheetName;
  if (metaRes.ok) {
    const metaData = await metaRes.json();
    const sheets = metaData.sheets || [];
    const hasTarget = sheets.some((s: { properties?: { title?: string } }) => s.properties?.title === sheetName);
    if (!hasTarget && sheets.length > 0 && sheets[0].properties?.title) {
      effectiveSheetName = sheets[0].properties.title;
    }
  }

  const range = `${encodeURIComponent(effectiveSheetName)}!A1:O10000`;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch spreadsheet values: ${err}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length <= 1) {
    return []; // Only header or empty
  }

  const headerRow = rows[0].map(h => (h || '').toString().trim().toLowerCase());
  const colIndex = {
    id: headerRow.indexOf('transaction_id') !== -1 ? headerRow.indexOf('transaction_id') : 0,
    date: headerRow.indexOf('date') !== -1 ? headerRow.indexOf('date') : 1,
    desc: headerRow.indexOf('description') !== -1 ? headerRow.indexOf('description') : 2,
    merchant: headerRow.indexOf('merchant') !== -1 ? headerRow.indexOf('merchant') : 3,
    amount: headerRow.indexOf('amount') !== -1 ? headerRow.indexOf('amount') : 4,
    type: headerRow.indexOf('type') !== -1 ? headerRow.indexOf('type') : 5,
    category: headerRow.indexOf('category') !== -1 ? headerRow.indexOf('category') : 6,
    card: headerRow.indexOf('card') !== -1 ? headerRow.indexOf('card') : 7,
    statementId: headerRow.indexOf('statement_id') !== -1 ? headerRow.indexOf('statement_id') : 8,
    statementMonth: headerRow.indexOf('statement_month') !== -1 ? headerRow.indexOf('statement_month') : 9,
    sourceFile: headerRow.indexOf('source_file') !== -1 ? headerRow.indexOf('source_file') : 10,
    refId: headerRow.indexOf('reference_id') !== -1 ? headerRow.indexOf('reference_id') : 11,
    created: headerRow.indexOf('created_date') !== -1 ? headerRow.indexOf('created_date') : 12,
    updated: headerRow.indexOf('updated_date') !== -1 ? headerRow.indexOf('updated_date') : 13,
    notes: headerRow.indexOf('notes') !== -1 ? headerRow.indexOf('notes') : 14
  };

  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || !r[colIndex.id]) continue;

    const rawAmount = (r[colIndex.amount] || '0').replace(/[^0-9.-]/g, '');
    const amount = Math.abs(parseFloat(rawAmount) || 0);
    if (amount > 25000) continue; // Exclude expenses > 25k

    const typeStr = (r[colIndex.type] || '').toLowerCase().includes('credit') || (r[colIndex.type] || '').toLowerCase().includes('cr')
      ? 'credit'
      : 'debit';

    const rawDate = r[colIndex.date] || '';
    const normalizedDate = parseSheetDateToISO(rawDate) || rawDate;
    const rawMonth = r[colIndex.statementMonth] || '';
    const normalizedMonth = normalizeStatementMonth(rawMonth, normalizedDate);

    transactions.push({
      transaction_id: r[colIndex.id] || `row_${i}`,
      date: normalizedDate,
      description: r[colIndex.desc] || '',
      merchant: r[colIndex.merchant] || '',
      amount,
      type: typeStr,
      category: r[colIndex.category] || 'Other',
      card: r[colIndex.card] || 'Primary Card',
      statement_id: r[colIndex.statementId] || '',
      statement_month: normalizedMonth,
      source_file: r[colIndex.sourceFile] || '',
      reference_id: r[colIndex.refId] || '',
      created_date: r[colIndex.created] || new Date().toISOString(),
      updated_date: r[colIndex.updated] || new Date().toISOString(),
      notes: r[colIndex.notes] || ''
    });
  }

  return transactions;
}

/**
 * Helper to resolve the correct sheet/tab name in the spreadsheet.
 */
export async function resolveEffectiveSheetName(
  spreadsheetId: string,
  preferredName = DEFAULT_SHEET_NAME,
  token?: string | null
): Promise<string> {
  const authToken = token || (await getAccessToken());
  if (!authToken) return preferredName;

  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      const sheets = metaData.sheets || [];
      const hasTarget = sheets.some((s: { properties?: { title?: string } }) => s.properties?.title === preferredName);
      if (hasTarget) return preferredName;
      if (sheets.length > 0 && sheets[0].properties?.title) {
        return sheets[0].properties.title;
      }
    }
  } catch (err) {
    console.warn('Could not resolve effective sheet tab name:', err);
  }
  return preferredName;
}

/**
 * Appends new transactions to Google Sheet and skips duplicates.
 */
export async function syncNewTransactionsToSheet(
  spreadsheetId: string,
  newTransactions: Transaction[],
  existingTransactions: Transaction[],
  sheetName = DEFAULT_SHEET_NAME
): Promise<{ addedCount: number; duplicateCount: number }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const existingIdSet = new Set(existingTransactions.map(t => t.transaction_id));
  const toAppend = newTransactions.filter(t => !existingIdSet.has(t.transaction_id));
  const duplicateCount = newTransactions.length - toAppend.length;

  if (toAppend.length === 0) {
    return { addedCount: 0, duplicateCount };
  }

  const effectiveSheetName = await resolveEffectiveSheetName(spreadsheetId, sheetName, token);

  // Format rows for append in Google Sheet format (e.g., 10/4/2026 for 4th Oct 2026)
  const now = new Date().toISOString();
  const rows = toAppend.map(t => [
    t.transaction_id,
    formatISOToSheetDate(t.date),
    t.description,
    t.merchant,
    t.amount,
    t.type,
    t.category,
    t.card,
    t.statement_id,
    t.statement_month || normalizeStatementMonth('', t.date),
    t.source_file,
    t.reference_id || '',
    t.created_date || now,
    t.updated_date || now,
    t.notes || ''
  ]);

  const range = `${encodeURIComponent(effectiveSheetName)}!A:O`;
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!appendRes.ok) {
    const errText = await appendRes.text();
    throw new Error(`Failed to append transactions to Google Sheet: ${errText}`);
  }

  return { addedCount: toAppend.length, duplicateCount };
}

/**
 * Completely writes or overwrites all transactions into the connected Google Sheet
 * preserving the header row (A1:O1) and replacing all data rows cleanly.
 */
export async function overwriteAllTransactionsInSheet(
  spreadsheetId: string,
  transactions: Transaction[],
  sheetName = DEFAULT_SHEET_NAME
): Promise<number> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const effectiveSheetName = await resolveEffectiveSheetName(spreadsheetId, sheetName, token);

  // Format all rows for Sheets
  const now = new Date().toISOString();
  const rows = transactions.map(t => [
    t.transaction_id,
    formatISOToSheetDate(t.date),
    t.description,
    t.merchant,
    t.amount,
    t.type,
    t.category,
    t.card,
    t.statement_id,
    t.statement_month || normalizeStatementMonth('', t.date),
    t.source_file,
    t.reference_id || '',
    t.created_date || now,
    t.updated_date || now,
    t.notes || ''
  ]);

  // 1. Clear existing data in sheet
  try {
    const clearRange = `${encodeURIComponent(effectiveSheetName)}!A1:O10000`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${clearRange}:clear`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch {}

  // 2. Ensure Header row exists in A1:O1
  try {
    const headerRange = `${encodeURIComponent(effectiveSheetName)}!A1:O1`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: [SHEET_HEADERS] })
      }
    );
  } catch {}

  if (rows.length === 0) {
    return 0;
  }

  // 3. Write all rows starting at A2
  const writeRange = `${encodeURIComponent(effectiveSheetName)}!A2:O${rows.length + 1}`;
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${writeRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: rows })
    }
  );

  if (!writeRes.ok) {
    const errText = await writeRes.text();
    throw new Error(`Failed to write transactions to Google Sheet: ${errText}`);
  }

  return rows.length;
}

/**
 * Updates a single transaction in the Google Sheet by finding its row.
 */
export async function updateTransactionInSheet(
  spreadsheetId: string,
  updatedTx: Transaction,
  sheetName = DEFAULT_SHEET_NAME
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // Fetch all rows to find row index
  const range = `${encodeURIComponent(sheetName)}!A:A`;
  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!getRes.ok) throw new Error('Failed to find transaction row');
  const data = await getRes.json();
  const colA: string[][] = data.values || [];

  let targetRowIndex = -1;
  for (let i = 0; i < colA.length; i++) {
    if (colA[i]?.[0] === updatedTx.transaction_id) {
      targetRowIndex = i + 1; // 1-indexed for Sheets
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`Transaction ID ${updatedTx.transaction_id} not found in sheet`);
  }

  const rowValues = [
    updatedTx.transaction_id,
    formatISOToSheetDate(updatedTx.date),
    updatedTx.description,
    updatedTx.merchant,
    updatedTx.amount,
    updatedTx.type,
    updatedTx.category,
    updatedTx.card,
    updatedTx.statement_id,
    updatedTx.statement_month,
    updatedTx.source_file,
    updatedTx.reference_id || '',
    updatedTx.created_date,
    new Date().toISOString(),
    updatedTx.notes || ''
  ];

  const updateRange = `${encodeURIComponent(sheetName)}!A${targetRowIndex}:O${targetRowIndex}`;
  const putRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Failed to update transaction row: ${errText}`);
  }
}

/**
 * Bulk updates categories and merchants in the connected Google Sheet
 * for the specified transactions.
 */
export async function batchUpdateCategoriesInSheet(
  spreadsheetId: string,
  updatedTransactions: Transaction[],
  sheetName = DEFAULT_SHEET_NAME
): Promise<number> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  if (updatedTransactions.length === 0) return 0;

  // Fetch all transaction IDs and rows to find their exact row indices
  const range = `${encodeURIComponent(sheetName)}!A:G`;
  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!getRes.ok) throw new Error('Failed to fetch sheet rows for batch update');
  const data = await getRes.json();
  const rows: string[][] = data.values || [];

  const idToRowMap = new Map<string, number>();
  for (let i = 1; i < rows.length; i++) {
    const txId = rows[i]?.[0];
    if (txId) {
      idToRowMap.set(txId, i + 1); // 1-indexed for Sheets
    }
  }

  const valueRanges: Array<{ range: string; values: string[][] }> = [];
  let updatedCount = 0;

  for (const tx of updatedTransactions) {
    const rowIndex = idToRowMap.get(tx.transaction_id);
    if (rowIndex) {
      // Column D is Merchant, Column G is Category
      valueRanges.push({
        range: `${sheetName}!D${rowIndex}`,
        values: [[tx.merchant]]
      });
      valueRanges.push({
        range: `${sheetName}!G${rowIndex}`,
        values: [[tx.category]]
      });
      updatedCount++;
    }
  }

  if (valueRanges.length === 0) return 0;

  // Execute batchUpdate in chunks
  const CHUNK_SIZE = 100;
  for (let i = 0; i < valueRanges.length; i += CHUNK_SIZE) {
    const chunk = valueRanges.slice(i, i + CHUNK_SIZE);
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: chunk
      })
    });

    if (!batchRes.ok) {
      const err = await batchRes.text();
      console.warn('Batch update partial failure:', err);
    }
  }

  return updatedCount;
}

/**
 * Removes a transaction row from Google Sheet.
 */
export async function deleteTransactionFromSheet(
  spreadsheetId: string,
  txId: string,
  sheetName = DEFAULT_SHEET_NAME
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // Fetch sheetId and row index
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metaRes.ok) throw new Error('Failed to inspect spreadsheet');
  const meta = await metaRes.json();
  const sheetObj = meta.sheets?.find((s: { properties?: { title?: string } }) => s.properties?.title === sheetName) || meta.sheets?.[0];
  const sheetId = sheetObj?.properties?.sheetId || 0;

  // Find row index
  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:A`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await getRes.json();
  const colA: string[][] = data.values || [];

  let targetRowIndex = -1;
  for (let i = 0; i < colA.length; i++) {
    if (colA[i]?.[0] === txId) {
      targetRowIndex = i; // 0-indexed for batchUpdate
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Transaction ID not found in sheet');
  }

  const deleteRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: targetRowIndex,
              endIndex: targetRowIndex + 1
            }
          }
        }
      ]
    })
  });

  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    throw new Error(`Failed to delete row from Google Sheet: ${err}`);
  }
}

export const RULES_SHEET_NAME = 'Rules';

/**
 * Fetches categorization rules from the 'Rules' tab of the connected Google Sheet.
 * If the tab exists, parses Keyword/Pattern, Tag/Category, and Merchant Name.
 */
export async function fetchSheetRules(spreadsheetId: string): Promise<CategoryRule[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // Check if Rules tab exists in spreadsheet
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) return [];
  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  const rulesTab = sheets.find((s: { properties?: { title?: string } }) => {
    const title = (s.properties?.title || '').toLowerCase().trim();
    return title === 'rules' || title === 'rule' || title === 'tags' || title === 'tag' || title.includes('rule') || title.includes('tag') || title.includes('categor');
  }) || (sheets.length > 1 ? sheets[1] : undefined);

  if (!rulesTab || !rulesTab.properties?.title) {
    return [];
  }

  const effectiveRulesTabName = rulesTab.properties.title;
  const range = `${encodeURIComponent(effectiveRulesTabName)}!A1:C500`;
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return [];
  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length === 0) return [];

  const rules: CategoryRule[] = [];
  const firstRow = rows[0].map(h => (h || '').toString().toLowerCase().trim());
  
  const hasHeader = firstRow.some(h => 
    h.includes('pattern') || h.includes('keyword') || h.includes('text') || 
    h.includes('tag') || h.includes('category') || h.includes('merchant') || h.includes('search') || h.includes('description')
  );

  let patternCol = 0;
  let tagCol = 1;
  let merchantCol = -1;

  if (hasHeader) {
    const pIdx = firstRow.findIndex(h => h.includes('pattern') || h.includes('keyword') || h.includes('text') || h.includes('search') || h.includes('description'));
    const tIdx = firstRow.findIndex(h => h.includes('tag') || h.includes('category') || h.includes('cat'));
    const mIdx = firstRow.findIndex(h => h.includes('merchant') || h.includes('name'));

    if (pIdx !== -1) patternCol = pIdx;
    if (tIdx !== -1) tagCol = tIdx;
    if (mIdx !== -1) merchantCol = mIdx;
  }

  const startRow = hasHeader ? 1 : 0;

  for (let i = startRow; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const pattern = (r[patternCol] || r[0] || '').trim();
    const tag = (r[tagCol] || r[1] || '').trim();
    const merchant = merchantCol !== -1 && r[merchantCol] ? r[merchantCol].trim() : undefined;

    if (!pattern && !tag) continue;

    const finalPattern = pattern || tag;
    const finalTag = tag || pattern;

    rules.push({
      id: `sheet_rule_${i}_${finalPattern.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      pattern: finalPattern,
      category: finalTag,
      merchant_name: merchant
    });
  }

  return rules;
}

/**
 * Saves/Updates categorization rules into the 'Rules' tab of the connected Google Sheet.
 */
export async function syncRulesToSheet(
  spreadsheetId: string,
  rules: CategoryRule[]
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  // Check if Rules tab exists; if not, create it
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) return;
  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  let rulesTab = sheets.find((s: { properties?: { title?: string } }) => {
    const title = (s.properties?.title || '').toLowerCase();
    return title === 'rules' || title === 'rule' || title === 'tags';
  });

  let rulesTabName = RULES_SHEET_NAME;
  if (!rulesTab) {
    // Create 'Rules' tab
    const addSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: RULES_SHEET_NAME,
                gridProperties: { frozenRowCount: 1 }
              }
            }
          }
        ]
      })
    });
    if (addSheetRes.ok) {
      rulesTabName = RULES_SHEET_NAME;
    }
  } else {
    rulesTabName = rulesTab.properties.title;
  }

  // Prepare values
  const values: string[][] = [
    ['Pattern / Keyword', 'Tag / Category', 'Merchant Display Name']
  ];

  rules.forEach(rule => {
    values.push([
      rule.pattern,
      rule.category,
      rule.merchant_name || ''
    ]);
  });

  const range = `${encodeURIComponent(rulesTabName)}!A1:C${values.length}`;
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );
}
