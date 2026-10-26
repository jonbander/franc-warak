/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileTabBar } from './components/MobileTabBar';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { DashboardView } from './components/DashboardView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { WorkersView } from './components/WorkersView';
import { CalculatorView } from './components/CalculatorView';
import { SaleReceiptModal } from './components/SaleReceiptModal';
import { SeasonReportModal } from './components/SeasonReportModal';

import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings } from './types';
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
  resetToInitialData,
} from './utils/storage';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'sales' | 'expenses' | 'workers' | 'calculator'>('dashboard');

  // Core Data States
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [workerWages, setWorkerWages] = useState<WorkerWageRecord[]>([]);
  const [settings, setSettings] = useState<SeasonSettings>(loadSettings());

  // Modal States
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<SaleRecord | null>(null);
  const [isSeasonReportOpen, setIsSeasonReportOpen] = useState(false);

  // Phone Frame Simulator mode toggle (active on desktop to view as authentic phone)
  const [isSimulatorMode, setIsSimulatorMode] = useState(true);

  // Load data on startup
  useEffect(() => {
    setSales(loadSales());
    setExpenses(loadExpenses());
    setWorkerWages(loadWorkerWages());
    setSettings(loadSettings());
  }, []);

  // Handlers for Sales
  const handleAddSale = (newSaleData: Omit<SaleRecord, 'id' | 'createdAt'>) => {
    const newSale: SaleRecord = {
      ...newSaleData,
      id: `sale-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSale, ...sales];
    setSales(updated);
    saveSales(updated);
  };

  const handleUpdateSale = (updatedSale: SaleRecord) => {
    const updated = sales.map((s) => (s.id === updatedSale.id ? updatedSale : s));
    setSales(updated);
    saveSales(updated);
  };

  const handleDeleteSale = (id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    setSales(updated);
    saveSales(updated);
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpData: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
    const newExp: ExpenseRecord = {
      ...newExpData,
      id: `exp-${Date.now().toString().slice(-5)}`,
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
      id: `wage-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newWage, ...workerWages];
    setWorkerWages(updated);
    saveWorkerWages(updated);
  };

  const handleUpdateWorkerWage = (updatedWage: WorkerWageRecord) => {
    const updated = workerWages.map((w) => (w.id === updatedWage.id ? updatedWage : w));
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

  // Reset Data to sample
  const handleResetData = () => {
    if (confirm('هل تريد استعادة البيانات النموذجية الافتراضية لموسم ورق العنب؟')) {
      resetToInitialData();
      setSales(loadSales());
      setExpenses(loadExpenses());
      setWorkerWages(loadWorkerWages());
      setSettings(loadSettings());
    }
  };

  // Apply calculator simulation to a new sale
  const handleApplyCalculatorToSale = (params: { quantity: number; unitPrice: number; laborCost: number }) => {
    setCurrentTab('sales');
    setIsAddSaleOpen(true);
  };

  // Main Mobile App Content Body
  const appContent = (
    <div className="flex flex-col min-h-full bg-stone-50 text-stone-900 pb-24">
      {/* PWA Home Screen Install Banner */}
      <PWAInstallBanner />

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
      />

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
            currencySymbol={settings.currency}
            onAddSale={handleAddSale}
            onUpdateSale={handleUpdateSale}
            onDeleteSale={handleDeleteSale}
            onViewReceipt={setSelectedReceiptSale}
            isAddModalOpen={isAddSaleOpen}
            setIsAddModalOpen={setIsAddSaleOpen}
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
        <div className="w-full sm:max-w-[420px] sm:h-[860px] sm:max-h-[94vh] bg-black sm:rounded-[48px] sm:p-3 sm:shadow-2xl sm:border-4 sm:border-stone-800 relative flex flex-col overflow-hidden">
          {/* Smartphone Bezel & Hardware Buttons Simulation */}
          <div className="hidden sm:block absolute -left-[7px] top-28 w-[3px] h-12 bg-stone-700 rounded-l-md" />
          <div className="hidden sm:block absolute -left-[7px] top-44 w-[3px] h-12 bg-stone-700 rounded-l-md" />
          <div className="hidden sm:block absolute -right-[7px] top-36 w-[3px] h-16 bg-stone-700 rounded-r-md" />

          {/* Smartphone Screen Glass */}
          <div className="w-full h-full bg-stone-50 sm:rounded-[36px] overflow-hidden flex flex-col relative">
            {/* Status Bar (Time, Dynamic Island / Notch, Signal, Battery) */}
            <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 bg-white text-stone-900 text-xs font-mono font-semibold select-none z-30 shrink-0">
              <span>09:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-stone-800">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Scrollable Mobile App Body */}
            <div className="flex-1 overflow-y-auto scrollbar-none relative">
              {appContent}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="hidden sm:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-400 rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg min-h-screen bg-stone-50 shadow-xl overflow-hidden flex flex-col">
          {appContent}
        </div>
      )}
    </div>
  );
}
