import { Transaction } from '../types/expense';
import { generateTransactionId } from '../utils/idGenerator';
import { categorizeTransaction } from '../utils/categorizer';

export interface SampleStatementPreset {
  id: string;
  name: string;
  cardName: string;
  cardLast4: string;
  statementPeriod: string;
  statementMonth: string;
  fileName: string;
  items: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    reference_id?: string;
  }>;
}

export const SAMPLE_STATEMENTS: SampleStatementPreset[] = [
  {
    id: 'demo_card_sep2026',
    name: 'Sample Rewards Card - September 2026 (Demo)',
    cardName: 'Demo Rewards Platinum',
    cardLast4: '4321',
    statementPeriod: '01 Sep 2026 - 30 Sep 2026',
    statementMonth: '2026-09',
    fileName: 'Demo_Sample_Statement_Sep2026.pdf',
    items: [
      { date: '2026-09-02', description: 'Sample Grocery Supermarket', amount: 1450.00, type: 'debit', reference_id: 'DEMO1001' },
      { date: '2026-09-04', description: 'Metro Transit Transport Card', amount: 500.00, type: 'debit', reference_id: 'DEMO1002' },
      { date: '2026-09-06', description: 'City Coffee Roasters Cafe', amount: 240.00, type: 'debit', reference_id: 'DEMO1003' },
      { date: '2026-09-09', description: 'Online Bookstore & Supplies', amount: 620.00, type: 'debit', reference_id: 'DEMO1004' },
      { date: '2026-09-12', description: 'Pharmacy & Health Wellness', amount: 380.00, type: 'debit', reference_id: 'DEMO1005' },
      { date: '2026-09-15', description: 'Digital Cloud Subscription', amount: 299.00, type: 'debit', reference_id: 'DEMO1006' },
      { date: '2026-09-18', description: 'Local Dining & Pizzeria', amount: 890.00, type: 'debit', reference_id: 'DEMO1007' },
      { date: '2026-09-21', description: 'Electricity Utility Bill Payment', amount: 1650.00, type: 'debit', reference_id: 'DEMO1008' },
      { date: '2026-09-25', description: 'Neighborhood Electronics Store', amount: 2200.00, type: 'debit', reference_id: 'DEMO1009' },
      { date: '2026-09-28', description: 'Promotional Cashback Reward', amount: 300.00, type: 'credit', reference_id: 'DEMO1010' }
    ]
  },
  {
    id: 'icici_oct_2026',
    name: 'ICICI Sapphiro - October 2026',
    cardName: 'ICICI Sapphiro',
    cardLast4: '9812',
    statementPeriod: '01 Oct 2026 - 31 Oct 2026',
    statementMonth: '2026-10',
    fileName: 'ICICI_Sapphiro_Oct2026.pdf',
    items: [
      { date: '2026-10-04', description: 'BOOKMYSHOW BIGTREE ENTERTAINMENT MUMBAI', amount: 940.00, type: 'debit', reference_id: 'REF7391028' },
      { date: '2026-10-08', description: 'SWIGGY RESTAURANT FOOD DELIVERY BLR', amount: 1120.00, type: 'debit', reference_id: 'REF4810293' },
      { date: '2026-10-11', description: 'APPLE SERVICES ITUNES STORE CUPERTINO', amount: 199.00, type: 'debit', reference_id: 'REF9501824' },
      { date: '2026-10-15', description: 'CULT FIT HEALTHCARE BANGALORE', amount: 2999.00, type: 'debit', reference_id: 'REF3819204' },
      { date: '2026-10-19', description: 'SHELL PETROL STATION WHITEFIELD BLR', amount: 2000.00, type: 'debit', reference_id: 'REF6819201' },
      { date: '2026-10-22', description: 'MYNTRA DESIGNS PVT LTD BANGALORE', amount: 3450.00, type: 'debit', reference_id: 'REF2910482' },
      { date: '2026-10-25', description: 'AMAZON REFUND RETURNED ITEM MUMBAI', amount: 1299.00, type: 'credit', reference_id: 'REF8491022' },
      { date: '2026-10-29', description: 'SPOTIFY AB STOCKHOLM SE SUBSCRIPTION', amount: 179.00, type: 'debit', reference_id: 'REF6391028' }
    ]
  },
  {
    id: 'axis_sep_2026',
    name: 'Axis Bank Magnus - September 2026',
    cardName: 'Axis Bank Magnus',
    cardLast4: '1104',
    statementPeriod: '01 Sep 2026 - 30 Sep 2026',
    statementMonth: '2026-09',
    fileName: 'Axis_Magnus_Sep2026_Statement.pdf',
    items: [
      { date: '2026-09-03', description: 'POS 382910 ZOMATO GOLD GURGAON', amount: 620.00, type: 'debit', reference_id: 'REF5819203' },
      { date: '2026-09-06', description: 'CROMA INFINITI RETAIL MUMBAI', amount: 12499.00, type: 'debit', reference_id: 'REF9401824' },
      { date: '2026-09-10', description: 'INDIGO AIRLINES INTERGLOBE GURGAON', amount: 8900.00, type: 'debit', reference_id: 'REF4719201' },
      { date: '2026-09-14', description: 'BLINKIT QUICK COMMERCE NOIDA', amount: 890.00, type: 'debit', reference_id: 'REF3819402' },
      { date: '2026-09-18', description: 'UBER RIDES INDIA PVT LTD BANGALORE', amount: 350.00, type: 'debit', reference_id: 'REF9401820' },
      { date: '2026-09-22', description: 'TATA POWER ELECTRICITY BILL MUMBAI', amount: 2450.00, type: 'debit', reference_id: 'REF2819401' },
      { date: '2026-09-28', description: 'AXIS EDGE REWARD CASH CREDIT', amount: 2000.00, type: 'credit', reference_id: 'REF8492011' }
    ]
  }
];

export function buildTransactionsFromPreset(preset: SampleStatementPreset): Transaction[] {
  const cardIdentifier = `${preset.cardName} - ${preset.cardLast4}`;
  const now = new Date().toISOString();

  return preset.items.map((item, idx) => {
    const { category, merchant } = categorizeTransaction(item.description);
    const txId = generateTransactionId({
      card: cardIdentifier,
      date: item.date,
      amount: item.amount,
      type: item.type,
      description: item.description,
      reference_id: item.reference_id || `sample_${idx}`
    });

    return {
      transaction_id: txId,
      date: item.date,
      description: item.description,
      merchant,
      amount: item.amount,
      type: item.type,
      category,
      card: cardIdentifier,
      statement_id: `STMT_${preset.cardName.replace(/[^a-zA-Z0-9]/g, '')}_${preset.statementMonth.replace('-', '')}`,
      statement_month: preset.statementMonth,
      source_file: preset.fileName,
      reference_id: item.reference_id || '',
      created_date: now,
      updated_date: now
    };
  });
}
