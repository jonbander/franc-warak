import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings, SeasonBackup, SeasonArchive } from '../types';
import { INITIAL_SALES, INITIAL_EXPENSES, INITIAL_WORKER_WAGES, INITIAL_SETTINGS } from '../data/initialData';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const STORAGE_KEYS = {
  SALES: 'grape_season_sales_v1',
  EXPENSES: 'grape_season_expenses_v1',
  WORKERS: 'grape_season_workers_v1',
  SETTINGS: 'grape_season_settings_v1',
  ARCHIVES: 'grape_season_archives_v1',
};

const normalizeCurrency = (currency: unknown): string => currency === '$' ? '$' : 'ل.س';

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
    const defaultSeasonMatch = (stored.seasonName || '').match(/^موسم(?: قطاف)? ورق العنب الفرنسي (\d{4})$/);
    const hasSeasonRecords = [STORAGE_KEYS.SALES, STORAGE_KEYS.EXPENSES, STORAGE_KEYS.WORKERS].some((key) => {
      try {
        const records = JSON.parse(localStorage.getItem(key) || '[]') as unknown;
        return Array.isArray(records) && records.length > 0;
      } catch {
        return false;
      }
    });
    const keepPreviousSeasonForArchive = Boolean(defaultSeasonMatch && Number(defaultSeasonMatch[1]) < new Date().getFullYear() && hasSeasonRecords);
    const settings: SeasonSettings = {
      ...INITIAL_SETTINGS,
      ...stored,
      currency: normalizeCurrency(stored.currency),
      seasonName: defaultSeasonMatch && !keepPreviousSeasonForArchive ? INITIAL_SETTINGS.seasonName : (stored.seasonName || INITIAL_SETTINGS.seasonName),
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
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, currency: normalizeCurrency(settings.currency) }));
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
};

const deliverFile = async (filename: string, contents: string, mimeType: string): Promise<void> => {
  const blob = new Blob([contents], { type: mimeType });
  if (Capacitor.isNativePlatform()) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return reject(new Error('تعذر تجهيز الملف للمشاركة.'));
        resolve(reader.result.slice(reader.result.indexOf(',') + 1));
      };
      reader.onerror = () => reject(reader.error || new Error('تعذر قراءة الملف.'));
      reader.readAsDataURL(blob);
    });
    const { uri } = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    await Share.share({
      title: filename,
      text: 'اختر «الملفات» أو وجهة مناسبة لحفظ أو نقل النسخة.',
      url: uri,
      dialogTitle: 'حفظ أو مشاركة الملف',
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

const alertExportFailure = (error: unknown) => {
  console.error('Failed to export file', error);
  window.alert('تعذر إنشاء الملف أو فتح قائمة المشاركة. تحقق من مساحة الجهاز وحاول مجدداً.');
};

// Export all season data to a JSON backup file
export const exportSeasonDataJSON = async (): Promise<void> => {
  const data = {
    format: 'franc-warak-season-backup',
    formatVersion: 1,
    settings: loadSettings(),
    sales: loadSales(),
    expenses: loadExpenses(),
    workers: loadWorkerWages(),
    exportedAt: new Date().toISOString(),
  };

  try {
    await deliverFile(`نسخة_احتياطية_ورق_العنب_${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(data, null, 2), 'application/json');
  } catch (error) {
    alertExportFailure(error);
  }
};

export const exportSeasonArchiveJSON = async (archive: SeasonArchive): Promise<void> => {
  const backup = {
    format: 'franc-warak-season-backup',
    formatVersion: 1,
    settings: archive.settings,
    sales: archive.sales,
    expenses: archive.expenses,
    workers: archive.workers,
    exportedAt: new Date().toISOString(),
  };
  const safeSeasonName = archive.seasonName.replace(/[^\p{L}\p{N}-]+/gu, '_');
  try {
    await deliverFile(`نسخة_${safeSeasonName}.json`, JSON.stringify(backup, null, 2), 'application/json');
  } catch (error) {
    alertExportFailure(error);
  }
};

const isRecordArray = (value: unknown): value is Array<Record<string, unknown>> =>
  Array.isArray(value) && value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item) && typeof item.id === 'string' && item.id.length > 0);

const hasStringFields = (records: Array<Record<string, unknown>>, fields: string[]): boolean =>
  records.every((record) => fields.every((field) => typeof record[field] === 'string'));

const hasNumberFields = (records: Array<Record<string, unknown>>, fields: string[]): boolean =>
  records.every((record) => fields.every((field) => typeof record[field] === 'number' && Number.isFinite(record[field])));

export const parseSeasonBackupJSON = (text: string): SeasonBackup => {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  if (!parsed || typeof parsed !== 'object' || !parsed.settings || typeof parsed.settings !== 'object' ||
      !isRecordArray(parsed.sales) || !isRecordArray(parsed.expenses) || !isRecordArray(parsed.workers)) {
    throw new Error('الملف ليس نسخة احتياطية صالحة لبيانات الموسم.');
  }
  if ((parsed.format !== undefined && parsed.format !== 'franc-warak-season-backup') ||
      (parsed.formatVersion !== undefined && parsed.formatVersion !== 1)) {
    throw new Error('صيغة النسخة الاحتياطية غير مدعومة.');
  }
  const sales = parsed.sales;
  const expenses = parsed.expenses;
  const workers = parsed.workers;
  if (!hasStringFields(sales, ['date', 'buyerName', 'grapeVariety', 'unit', 'paymentStatus', 'paymentMethod', 'createdAt']) ||
      !hasNumberFields(sales, ['quantity', 'unitPrice', 'laborCost', 'totalAmount', 'netAmount', 'paidAmount']) ||
      !hasStringFields(expenses, ['date', 'title', 'category', 'paidTo', 'paymentMethod', 'createdAt']) ||
      !hasNumberFields(expenses, ['amount']) ||
      !hasStringFields(workers, ['date', 'workerOrLeaderName', 'workType', 'createdAt']) ||
      !hasNumberFields(workers, ['workerCount', 'unitsOrHours', 'ratePerUnit', 'totalWage', 'paidWage', 'remainingWage'])) {
    throw new Error('تحتوي النسخة على سجل ناقص أو غير صالح. لم تتغير بيانات التطبيق.');
  }
  const settings = { ...INITIAL_SETTINGS, ...(parsed.settings as Partial<SeasonSettings>) };
  if (typeof settings.seasonName !== 'string' || typeof settings.farmerName !== 'string' ||
      typeof settings.farmName !== 'string' || typeof settings.location !== 'string' ||
      typeof settings.seasonStartDate !== 'string' || typeof settings.targetHarvestKg !== 'number' || !Number.isFinite(settings.targetHarvestKg)) {
    throw new Error('بيانات إعدادات المزارع في الملف غير مكتملة.');
  }
  return {
    settings: { ...settings, currency: normalizeCurrency(settings.currency) },
    sales: sales as unknown as SaleRecord[],
    expenses: expenses as unknown as ExpenseRecord[],
    workers: workers as unknown as WorkerWageRecord[],
  };
};

export const importSeasonBackup = (backup: SeasonBackup): void => {
  const normalized = { ...backup.settings, currency: normalizeCurrency(backup.settings.currency) };
  const entries: Array<[string, string]> = [
    [STORAGE_KEYS.SALES, JSON.stringify(backup.sales)],
    [STORAGE_KEYS.EXPENSES, JSON.stringify(backup.expenses)],
    [STORAGE_KEYS.WORKERS, JSON.stringify(backup.workers)],
    [STORAGE_KEYS.SETTINGS, JSON.stringify(normalized)],
  ];
  const previous = entries.map(([key]) => [key, localStorage.getItem(key)] as const);
  try {
    entries.forEach(([key, value]) => localStorage.setItem(key, value));
  } catch (error) {
    previous.forEach(([key, value]) => value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value));
    throw error;
  }
};

export const loadSeasonArchives = (): SeasonArchive[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARCHIVES) || '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is SeasonArchive =>
      item !== null && typeof item === 'object' && typeof item.id === 'string' &&
      typeof item.archivedAt === 'string' && Array.isArray(item.sales) &&
      Array.isArray(item.expenses) && Array.isArray(item.workers) && item.settings !== null && typeof item.settings === 'object') : [];
  } catch (error) {
    console.error('Error loading season archives', error);
    return [];
  }
};

export const archiveCurrentSeason = (): SeasonArchive => {
  const settings = loadSettings();
  const archive: SeasonArchive = {
    id: `archive-${crypto.randomUUID()}`,
    seasonName: settings.seasonName,
    archivedAt: new Date().toISOString(),
    settings,
    sales: loadSales(),
    expenses: loadExpenses(),
    workers: loadWorkerWages(),
  };
  const archiveKeyBefore = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
  const archives = [archive, ...loadSeasonArchives()];
  // Commit the recoverable snapshot before resetting the active season.
  localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
  try {
    importSeasonBackup({
      settings: {
        ...INITIAL_SETTINGS,
        seasonName: `موسم ورق العنب الفرنسي ${new Date().getFullYear()}`,
        farmName: settings.farmName,
        farmerName: settings.farmerName,
        location: settings.location,
        currency: settings.currency,
      },
      sales: [],
      expenses: [],
      workers: [],
    });
  } catch (error) {
    if (archiveKeyBefore === null) localStorage.removeItem(STORAGE_KEYS.ARCHIVES);
    else localStorage.setItem(STORAGE_KEYS.ARCHIVES, archiveKeyBefore);
    throw error;
  }
  return archive;
};

export const restoreSeasonArchive = (archive: SeasonArchive): void => {
  importSeasonBackup(archive);
};

export const deleteSeasonArchive = (archiveId: string): void => {
  const remaining = loadSeasonArchives().filter((archive) => archive.id !== archiveId);
  localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(remaining));
};

// Export sales to CSV for Excel
export const exportSalesToCSV = async (sales: SaleRecord[], currencySymbol: string): Promise<void> => {
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
  try {
    await deliverFile(`سجل_مبيعات_ورق_العنب_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'text/csv;charset=utf-8;');
  } catch (error) {
    alertExportFailure(error);
  }
};

// Export expenses to CSV for Excel
export const exportExpensesToCSV = async (expenses: ExpenseRecord[], currencySymbol: string): Promise<void> => {
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
  try {
    await deliverFile(`سجل_مصاريف_الموسم_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'text/csv;charset=utf-8;');
  } catch (error) {
    alertExportFailure(error);
  }
};

// Clear local season records and restore blank settings.
export const resetToInitialData = (): void => {
  saveSales(INITIAL_SALES);
  saveExpenses(INITIAL_EXPENSES);
  saveWorkerWages(INITIAL_WORKER_WAGES);
  saveSettings(INITIAL_SETTINGS);
};
