export interface Transaction {
  transaction_id: string;
  date: string; // YYYY-MM-DD
  description: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  card: string;
  statement_id: string;
  statement_month: string; // e.g. 2026-10 or October 2026
  source_file: string;
  reference_id?: string;
  created_date: string;
  updated_date: string;
  notes?: string;
  email_body?: string;
  user_overridden_category?: boolean;
}

export interface CategoryRule {
  id: string;
  pattern: string;
  category: string;
  merchant_name?: string;
}

export interface StatementExtractionResult {
  card_name: string;
  card_last4: string;
  statement_period: string;
  statement_month: string;
  currency: string;
  total_debits: number;
  total_credits: number;
  transactions: Array<{
    date: string;
    description: string;
    merchant: string;
    amount: number;
    type: 'debit' | 'credit';
    category: string;
    reference_id?: string;
    card?: string;
  }>;
  raw_text_summary?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: StatementExtractionResult;
  error?: string;
}

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  sheetName: string;
  url: string;
  lastSyncedAt?: string;
  rowCount?: number;
}
