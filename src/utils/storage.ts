import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings } from '../types';
import { INITIAL_SALES, INITIAL_EXPENSES, INITIAL_WORKER_WAGES, INITIAL_SETTINGS } from '../data/initialData';

const STORAGE_KEYS = {
  SALES: 'grape_season_sales_v1',
  EXPENSES: 'grape_season_expenses_v1',
  WORKERS: 'grape_season_workers_v1',
  SETTINGS: 'grape_season_settings_v1',
};

const LEGACY_SAMPLE_IDS = {
  sales: new Set(['sale-001', 'sale-002', 'sale-003', 'sale-004', 'sale-005', 'sale-006']),
  expenses: new Set(['exp-001', 'exp-002', 'exp-003', 'exp-004', 'exp-005', 'exp-006', 'exp-007', 'exp-008']),
  workers: new Set(['wage-001', 'wage-002', 'wage-003', 'wage-004', 'wage-005', 'wage-006']),
};

export const loadSales = (): SaleRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) {
      saveSales(INITIAL_SALES);
      return INITIAL_SALES;
    }
    const parsed = JSON.parse(raw) as SaleRecord[];
    const cleaned = Array.isArray(parsed) ? parsed.filter((item) => !LEGACY_SAMPLE_IDS.sales.has(item?.id)) : [];
    if (!Array.isArray(parsed) || cleaned.length !== parsed.length) saveSales(cleaned);
    return cleaned;
  } catch (e) {
    console.error('Error loading sales from storage', e);
    return INITIAL_SALES;
  }
};

export const saveSales = (sales: SaleRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Error saving sales to storage', e);
  }
};

export const loadExpenses = (): ExpenseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      saveExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    const parsed = JSON.parse(raw) as ExpenseRecord[];
    const cleaned = Array.isArray(parsed) ? parsed.filter((item) => !LEGACY_SAMPLE_IDS.expenses.has(item?.id)) : [];
    if (!Array.isArray(parsed) || cleaned.length !== parsed.length) saveExpenses(cleaned);
    return cleaned;
  } catch (e) {
    console.error('Error loading expenses from storage', e);
    return INITIAL_EXPENSES;
  }
};

export const saveExpenses = (expenses: ExpenseRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to storage', e);
  }
};

export const loadWorkerWages = (): WorkerWageRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKERS);
    if (!raw) {
      saveWorkerWages(INITIAL_WORKER_WAGES);
      return INITIAL_WORKER_WAGES;
    }
    const parsed = JSON.parse(raw) as WorkerWageRecord[];
    const cleaned = Array.isArray(parsed) ? parsed.filter((item) => !LEGACY_SAMPLE_IDS.workers.has(item?.id) && !LEGACY_SAMPLE_IDS.sales.has(item?.relatedSaleId || '')) : [];
    if (!Array.isArray(parsed) || cleaned.length !== parsed.length) saveWorkerWages(cleaned);
    return cleaned;
  } catch (e) {
    console.error('Error loading worker wages from storage', e);
    return INITIAL_WORKER_WAGES;
  }
};

export const saveWorkerWages = (wages: WorkerWageRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(wages));
  } catch (e) {
    console.error('Error saving worker wages to storage', e);
  }
};

export const loadSettings = (): SeasonSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    const stored = JSON.parse(raw) as Partial<SeasonSettings>;
    const isDefaultSeasonName = /^موسم(?: قطاف)? ورق العنب الفرنسي \d{4}$/.test(stored.seasonName || '');
    const settings: SeasonSettings = {
      ...INITIAL_SETTINGS,
      ...stored,
      seasonName: isDefaultSeasonName ? INITIAL_SETTINGS.seasonName : (stored.seasonName || INITIAL_SETTINGS.seasonName),
      farmName: stored.farmName === 'كروم الذهب الأخضر' ? '' : (stored.farmName || ''),
      farmerName: stored.farmerName === 'أبو أحمد البستاني' ? '' : (stored.farmerName || ''),
      location: stored.location === 'مزارع السهل الغربي' ? '' : (stored.location || ''),
      targetHarvestKg: stored.targetHarvestKg === 4000 ? 0 : (stored.targetHarvestKg ?? INITIAL_SETTINGS.targetHarvestKg),
      seasonStartDate: stored.seasonStartDate === '2025-05-01' ? '' : (stored.seasonStartDate || ''),
    };
    saveSettings(settings);
    return settings;
  } catch (e) {
    console.error('Error loading settings from storage', e);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: SeasonSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
};

// Export all season data to a JSON backup file
export const exportSeasonDataJSON = (): void => {
  const data = {
    settings: loadSettings(),
    sales: loadSales(),
    expenses: loadExpenses(),
    workers: loadWorkerWages(),
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `بيانات_موسم_ورق_العنب_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export sales to CSV for Excel
export const exportSalesToCSV = (sales: SaleRecord[], currencySymbol: string): void => {
  const headers = [
    'المعرف',
    'التاريخ',
    'اسم المشتري / التاجر',
    'الهاتف',
    'الصنف',
    'الكمية',
    'الوحدة',
    'وزن الوحدة (كغ)',
    'إجمالي الوزن المعروف (كغ)',
    `السعر الإفرادي (${currencySymbol})`,
    `أجار العمال (${currencySymbol})`,
    `مجموع البيع (${currencySymbol})`,
    `صافي الربح (${currencySymbol})`,
    'حالة الدفع',
    'طريقة الدفع',
    'الورشة والعمال',
    'ملاحظات'
  ];

  const rows = sales.map(s => [
    s.id,
    s.date,
    `"${s.buyerName.replace(/"/g, '""')}"`,
    s.buyerPhone || '',
    `"${s.grapeVariety}"`,
    s.quantity,
    s.unit,
    s.weightPerUnitKg ?? (s.unit === 'كيلوغرام' ? 1 : ''),
    s.unit === 'كيلوغرام' ? s.quantity : s.weightPerUnitKg ? s.quantity * s.weightPerUnitKg : '',
    s.unitPrice,
    s.laborCost,
    s.totalAmount,
    s.netAmount,
    s.paymentStatus,
    s.paymentMethod,
    `"${(s.workerNotes || '').replace(/"/g, '""')}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `سجل_مبيعات_ورق_العنب_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export expenses to CSV for Excel
export const exportExpensesToCSV = (expenses: ExpenseRecord[], currencySymbol: string): void => {
  const headers = [
    'المعرف',
    'التاريخ',
    'بيان المصروف',
    'التصنيف',
    `المبلغ (${currencySymbol})`,
    'المدفوع له',
    'طريقة الدفع',
    'ملاحظات'
  ];

  const rows = expenses.map(e => [
    e.id,
    e.date,
    `"${e.title.replace(/"/g, '""')}"`,
    `"${e.category}"`,
    e.amount,
    `"${e.paidTo.replace(/"/g, '""')}"`,
    e.paymentMethod,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `سجل_مصاريف_الموسم_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Clear local season records and restore blank settings.
export const resetToInitialData = (): void => {
  saveSales(INITIAL_SALES);
  saveExpenses(INITIAL_EXPENSES);
  saveWorkerWages(INITIAL_WORKER_WAGES);
  saveSettings(INITIAL_SETTINGS);
};
