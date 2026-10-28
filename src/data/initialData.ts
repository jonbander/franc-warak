import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings, Currency } from '../types';

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'SYP', symbol: 'ل.س', name: 'ليرة سورية (ل.س)' },
  { code: 'USD', symbol: '$', name: 'دولار أمريكي ($)' },
];

const currentYear = new Date().getFullYear();

export const INITIAL_SETTINGS: SeasonSettings = {
  seasonName: `موسم ورق العنب الفرنسي ${currentYear}`,
  farmName: '',
  farmerName: '',
  location: '',
  currency: 'ل.س',
  targetHarvestKg: 0,
  seasonStartDate: '',
};

// New installations start with no sample transactions.
export const INITIAL_SALES: SaleRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_WORKER_WAGES: WorkerWageRecord[] = [];
