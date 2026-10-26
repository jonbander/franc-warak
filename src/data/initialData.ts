import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings, Currency } from '../types';

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'دولار أمريكي ($)' },
  { code: 'SYP', symbol: 'ل.س', name: 'ليرة سورية (ل.س)' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي (ر.س)' },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني (د.أ)' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي (د.إ)' },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري (ج.م)' },
  { code: 'TRY', symbol: 'TL', name: 'ليرة تركية (TL)' },
  { code: 'EUR', symbol: '€', name: 'يورو (€)' },
];

const currentYear = new Date().getFullYear();

export const INITIAL_SETTINGS: SeasonSettings = {
  seasonName: `موسم ورق العنب الفرنسي ${currentYear}`,
  farmName: '',
  farmerName: '',
  location: '',
  currency: '$',
  targetHarvestKg: 0,
  seasonStartDate: '',
};

// New installations start with no sample transactions.
export const INITIAL_SALES: SaleRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_WORKER_WAGES: WorkerWageRecord[] = [];
