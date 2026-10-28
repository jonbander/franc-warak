/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileTabBar } from './components/MobileTabBar';
import { DashboardView } from './components/DashboardView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { WorkersView } from './components/WorkersView';
import { CalculatorView } from './components/CalculatorView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { ChatView } from './components/ChatView';
import { HelpView } from './components/HelpView';
import { SaleReceiptModal } from './components/SaleReceiptModal';
import { SeasonReportModal } from './components/SeasonReportModal';

import { AppTab, SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings, SeasonArchive } from './types';
import { upsertSaleWorkerWage } from './utils/saleWorkerWage';
import {
  loadSales,
  saveSales,
  loadExpenses,
  saveExpenses,
  loadWorkerWages,
  saveWorkerWages,
  loadSettings,
  saveSettings,
  exportSeasonDataJSON,
  parseSeasonBackupJSON,
  importSeasonBackup,
  archiveCurrentSeason,
  loadSeasonArchives,
  restoreSeasonArchive,
  deleteSeasonArchive,
  resetToInitialData,
} from './utils/storage';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

type AppTheme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'franc-warak-theme';

const loadAppTheme = (): AppTheme => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');

  // Core Data States
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [workerWages, setWorkerWages] = useState<WorkerWageRecord[]>([]);
  const [settings, setSettings] = useState<SeasonSettings>(loadSettings());
  const [seasonArchives, setSeasonArchives] = useState<SeasonArchive[]>(loadSeasonArchives());
  const [theme, setTheme] = useState<AppTheme>(loadAppTheme);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Modal States
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [calculatorPrefill, setCalculatorPrefill] = useState<{ quantity: number; unitPrice: number; laborCost: number } | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<SaleRecord | null>(null);
  const [isSeasonReportOpen, setIsSeasonReportOpen] = useState(false);

  // Phone Frame Simulator mode toggle (active on desktop to view as authentic phone)
  const [isSimulatorMode, setIsSimulatorMode] = useState(true);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => {
      const nextTheme: AppTheme = currentTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // The current session still switches themes if browser storage is unavailable.
      }
      return nextTheme;
    });
  };

  // Load data on startup
  useEffect(() => {
    setSales(loadSales());
    setExpenses(loadExpenses());
    setWorkerWages(loadWorkerWages());
    setSettings(loadSettings());
    setSeasonArchives(loadSeasonArchives());
    setDataLoaded(true);
  }, []);

  // Handlers for Sales
  const handleAddSale = (newSaleData: Omit<SaleRecord, 'id' | 'createdAt'>) => {
    const newSale: SaleRecord = {
      ...newSaleData,
      id: `sale-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSale, ...sales];
    const updatedWages = upsertSaleWorkerWage(workerWages, newSale);
    setSales(updated);
    setWorkerWages(updatedWages);
    saveSales(updated);
    saveWorkerWages(updatedWages);
  };

  const handleUpdateSale = (updatedSale: SaleRecord) => {
    const updated = sales.map((s) => (s.id === updatedSale.id ? updatedSale : s));
    const updatedWages = upsertSaleWorkerWage(workerWages, updatedSale);
    setSales(updated);
    setWorkerWages(updatedWages);
    saveSales(updated);
    saveWorkerWages(updatedWages);
  };

  const handleDeleteSale = (id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    const updatedWages = workerWages.filter((wage) => wage.relatedSaleId !== id);
    setSales(updated);
    setWorkerWages(updatedWages);
    saveSales(updated);
    saveWorkerWages(updatedWages);
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpData: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newExp: ExpenseRecord = {
      ...newExpData,
      id: `exp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleUpdateExpense = (updatedExp: ExpenseRecord) => {
    const updated = expenses.map((e) => (e.id === updatedExp.id ? updatedExp : e));
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  // Handlers for Worker Wages
  const handleAddWorkerWage = (newWageData: Omit<WorkerWageRecord, 'id' | 'createdAt'>) => {
    const newWage: WorkerWageRecord = {
      ...newWageData,
      id: `wage-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newWage, ...workerWages];
    setWorkerWages(updated);
    saveWorkerWages(updated);
  };

  const handleUpdateWorkerWage = (updatedWage: WorkerWageRecord) => {
    const updated = workerWages.map((w) => (w.id === updatedWage.id ? updatedWage : w));
    if (updatedWage.relatedSaleId) {
      const updatedSales = sales.map((sale) => sale.id === updatedWage.relatedSaleId
        ? {
            ...sale,
            laborCost: updatedWage.totalWage,
            laborPaidAmount: updatedWage.paidWage,
            netAmount: Number((sale.totalAmount - updatedWage.totalWage).toFixed(2)),
          }
        : sale);
      setSales(updatedSales);
      saveSales(updatedSales);
    }
    setWorkerWages(updated);
    saveWorkerWages(updated);
  };

  const handleDeleteWorkerWage = (id: string) => {
    const updated = workerWages.filter((w) => w.id !== id);
    setWorkerWages(updated);
    saveWorkerWages(updated);
  };

  // Change Currency
  const handleCurrencyChange = (newCurrency: string) => {
    const updated = { ...settings, currency: newCurrency };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleFarmerNameChange = (farmerName: string) => {
    const updated = { ...settings, farmerName };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleTargetHarvestChange = (targetHarvestKg: number) => {
    const updated = { ...settings, targetHarvestKg };
    setSettings(updated);
    saveSettings(updated);
  };

  const refreshSeasonData = () => {
    setSales(loadSales());
    setExpenses(loadExpenses());
    setWorkerWages(loadWorkerWages());
    setSettings(loadSettings());
    setSeasonArchives(loadSeasonArchives());
  };

  const createSeasonArchive = () => {
    archiveCurrentSeason();
    refreshSeasonData();
  };

  const handleArchiveCurrentSeason = () => {
    if (!sales.length && !expenses.length && !workerWages.length) {
      alert('لا توجد سجلات موسم لأرشفتها.');
      return;
    }
    if (!confirm(`سيتم حفظ «${settings.seasonName}» في الأرشيف ثم تصفير سجلات الموسم النشط. يمكنك استعادة الأرشيف لاحقاً. هل تريد المتابعة؟`)) return;
    try {
      createSeasonArchive();
      alert('تمت أرشفة الموسم وبدء موسم جديد. نزّل نسخة JSON للاحتفاظ بنسخة خارج هذا الجهاز.');
    } catch {
      alert('تعذر حفظ الأرشيف. نزّل نسخة احتياطية وحاول مجدداً.');
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      const backup = parseSeasonBackupJSON(await file.text());
      if (!confirm('سيستبدل الاستيراد سجلات الموسم الحالية وإعداداته ببيانات الملف. صدّر نسخة من بياناتك الحالية أولاً. هل تريد المتابعة؟')) return;
      importSeasonBackup(backup);
      refreshSeasonData();
      alert('تم استيراد النسخة الاحتياطية بنجاح.');
    } catch (error) {
      alert(error instanceof Error ? `تعذر استيراد النسخة: ${error.message}` : 'تعذر قراءة ملف النسخة الاحتياطية.');
    }
  };

  const handleRestoreArchive = (archive: SeasonArchive) => {
    if (!confirm(`ستُستبدل بيانات الموسم الحالي ببيانات «${archive.seasonName}». ستبقى الأرشيفات محفوظة. هل تريد المتابعة؟`)) return;
    try {
      restoreSeasonArchive(archive);
      refreshSeasonData();
      alert(`تمت استعادة ${archive.seasonName}.`);
    } catch {
      alert('تعذرت استعادة الأرشيف.');
    }
  };

  const handleDeleteArchive = (archive: SeasonArchive) => {
    if (!confirm(`سيُحذف أرشيف «${archive.seasonName}» نهائياً من هذا الجهاز. هل تريد المتابعة؟`)) return;
    try {
      deleteSeasonArchive(archive.id);
      setSeasonArchives(loadSeasonArchives());
    } catch {
      alert('تعذر حذف الأرشيف.');
    }
  };

  useEffect(() => {
    if (!dataLoaded || (!sales.length && !expenses.length && !workerWages.length)) return;
    const match = settings.seasonName.match(/(\d{4})$/);
    const seasonYear = match ? Number(match[1]) : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    if (seasonYear >= currentYear || seasonArchives.some((archive) => archive.seasonName === settings.seasonName)) return;
    const promptKey = `franc-warak-archive-prompt:${settings.seasonName}`;
    if (sessionStorage.getItem(promptKey)) return;
    sessionStorage.setItem(promptKey, 'shown');
    if (confirm(`يبدو أن بيانات «${settings.seasonName}» تعود إلى سنة سابقة. هل ترغب بأرشفتها الآن وبدء موسم ${currentYear}؟`)) {
      try {
        createSeasonArchive();
        alert('تم حفظ الموسم السابق في الأرشيف وبدء موسم جديد.');
      } catch {
        alert('تعذر حفظ الأرشيف. نزّل نسخة JSON قبل أي تصفير للبيانات.');
      }
    }
  }, [dataLoaded, sales.length, expenses.length, workerWages.length, settings.seasonName, seasonArchives]);

  // Clear local season data
  const handleResetData = () => {
    if (confirm('سيتم حذف جميع المبيعات والمصاريف والأجور المحفوظة على هذا الجهاز نهائياً. صدّر نسخة احتياطية أولاً إذا كنت تحتاجها. هل تريد المتابعة؟')) {
      resetToInitialData();
      setSales(loadSales());
      setExpenses(loadExpenses());
      setWorkerWages(loadWorkerWages());
      setSettings(loadSettings());
    }
  };

  // Apply calculator simulation to a new sale
  const handleApplyCalculatorToSale = (params: { quantity: number; unitPrice: number; laborCost: number }) => {
    setCalculatorPrefill(params);
    setCurrentTab('sales');
    setIsAddSaleOpen(true);
  };

  // Main Mobile App Content Body
  const appContent = (
    <div className={`${theme === 'dark' ? 'fw-theme-dark' : 'fw-theme-light'} flex flex-col min-h-full bg-stone-50 text-stone-900 pb-24`}>
      {/* Mobile Top App Bar */}
      <MobileTopBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        settings={settings}
        onCurrencyChange={handleCurrencyChange}
        onOpenReport={() => setIsSeasonReportOpen(true)}
        onExportData={exportSeasonDataJSON}
        onResetData={handleResetData}
        isSimulatorMode={isSimulatorMode}
        setIsSimulatorMode={setIsSimulatorMode}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <AnnouncementBanner />

      {/* Main Tab View Container */}
      <main className="flex-1 px-3 sm:px-4 py-4 max-w-lg mx-auto w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            sales={sales}
            expenses={expenses}
            workerWages={workerWages}
            settings={settings}
            onNavigate={setCurrentTab}
            onOpenAddSale={() => {
              setCurrentTab('sales');
              setIsAddSaleOpen(true);
            }}
            onOpenAddExpense={() => {
              setCurrentTab('expenses');
              setIsAddExpenseOpen(true);
            }}
            onOpenAddWorker={() => {
              setCurrentTab('workers');
              setIsAddWorkerOpen(true);
            }}
            onViewReceipt={setSelectedReceiptSale}
          />
        )}

        {currentTab === 'sales' && (
          <SalesView
            sales={sales}
            workerWages={workerWages}
            currencySymbol={settings.currency}
            onAddSale={handleAddSale}
            onUpdateSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
            onViewReceipt={setSelectedReceiptSale}
            isAddModalOpen={isAddSaleOpen}
            setIsAddModalOpen={setIsAddSaleOpen}
            calculatorPrefill={calculatorPrefill}
            onCalculatorPrefillConsumed={() => setCalculatorPrefill(null)}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            currencySymbol={settings.currency}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            isAddModalOpen={isAddExpenseOpen}
            setIsAddModalOpen={setIsAddExpenseOpen}
          />
        )}

        {currentTab === 'workers' && (
          <WorkersView
            workerWages={workerWages}
            sales={sales}
            currencySymbol={settings.currency}
            onAddWorkerWage={handleAddWorkerWage}
            onUpdateWorkerWage={handleUpdateWorkerWage}
            onDeleteWorkerWage={handleDeleteWorkerWage}
            isAddModalOpen={isAddWorkerOpen}
            setIsAddModalOpen={setIsAddWorkerOpen}
          />
        )}

        {currentTab === 'calculator' && (
          <CalculatorView
            currencySymbol={settings.currency}
            onApplyToNewSale={handleApplyCalculatorToSale}
          />
        )}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            archives={seasonArchives}
            onFarmerNameChange={handleFarmerNameChange}
            onTargetHarvestChange={handleTargetHarvestChange}
            onImportBackup={handleImportBackup}
            onArchiveCurrentSeason={handleArchiveCurrentSeason}
            onRestoreArchive={handleRestoreArchive}
            onDeleteArchive={handleDeleteArchive}
          />
        )}
        {currentTab === 'about' && <AboutView />}
        {currentTab === 'chat' && <ChatView suggestedName={settings.farmerName} onOpenSettings={() => setCurrentTab('settings')} />}
        {currentTab === 'help' && <HelpView />}
      </main>

      {/* Fixed Native Mobile Bottom Tab Bar */}
      <MobileTabBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddSale={() => {
          setCurrentTab('sales');
          setIsAddSaleOpen(true);
        }}
        salesCount={sales.length}
        expensesCount={expenses.length}
      />

      {/* Modals */}
      {selectedReceiptSale && (
        <SaleReceiptModal
          sale={selectedReceiptSale}
          settings={settings}
          onClose={() => setSelectedReceiptSale(null)}
        />
      )}

      {isSeasonReportOpen && (
        <SeasonReportModal
          sales={sales}
          expenses={expenses}
          workerWages={workerWages}
          settings={settings}
          onClose={() => setIsSeasonReportOpen(false)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-start sm:py-6 sm:px-4 font-sans select-none antialiased">
      {/* Desktop Controls Bar when viewing inside simulator */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-3 px-2 text-xs text-stone-300">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">تطبيق الموبايل</span>
          <span className="text-[11px] text-stone-400 font-mono">(عرض الهاتف)</span>
        </div>

        <button
          onClick={() => setIsSimulatorMode(!isSimulatorMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
        >
          {isSimulatorMode ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>ملء الشاشة</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>إطار الموبايل</span>
            </>
          )}
        </button>
      </div>

      {/* Smartphone Device Frame Simulator (on desktop) or Native Full View */}
      {isSimulatorMode ? (
        <div className="w-full h-dvh sm:max-w-[420px] sm:h-[860px] sm:max-h-[94vh] bg-black sm:rounded-[48px] sm:p-3 sm:shadow-2xl sm:border-4 sm:border-stone-800 relative flex flex-col overflow-hidden">
          {/* Smartphone Bezel & Hardware Buttons Simulation */}
          <div className="hidden sm:block absolute -left-[7px] top-28 w-[3px] h-12 bg-stone-700 rounded-l-md" />
          <div className="hidden sm:block absolute -left-[7px] top-44 w-[3px] h-12 bg-stone-700 rounded-l-md" />
          <div className="hidden sm:block absolute -right-[7px] top-36 w-[3px] h-16 bg-stone-700 rounded-r-md" />

          {/* Smartphone Screen Glass */}
          <div className="w-full h-full bg-stone-50 sm:rounded-[36px] overflow-hidden flex flex-col relative">
            {/* Status Bar (Time, Dynamic Island / Notch, Signal, Battery) */}
            <div className={`hidden sm:flex items-center justify-between px-6 pt-3 pb-1 ${theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-900'} text-xs font-mono font-semibold select-none z-30 shrink-0`}>
              <span>09:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-stone-200' : 'text-stone-800'}`}>
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Mobile App Body */}
            <div className="flex-1 overflow-y-auto scrollbar-none relative">
              {appContent}
            </div>
            <div
              id="fw-modal-root"
              className={`fw-modal-root fw-modal-root--simulator ${theme === 'dark' ? 'fw-theme-dark' : ''}`}
            />

            {/* iOS Home Indicator Bar */}
            <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-400 rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg min-h-screen bg-stone-50 shadow-xl overflow-hidden flex flex-col relative">
          {appContent}
          <div
            id="fw-modal-root"
            className={`fw-modal-root fw-modal-root--fullscreen ${theme === 'dark' ? 'fw-theme-dark' : ''}`}
          />
        </div>
      )}
    </div>
  );
}
