import React from 'react';
import { 
  Sprout, 
  PlusCircle, 
  Printer, 
  Download, 
  RotateCcw
} from 'lucide-react';
import { AVAILABLE_CURRENCIES } from '../data/initialData';
import { SeasonSettings } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'sales' | 'expenses' | 'workers' | 'calculator';
  setCurrentTab: (tab: 'dashboard' | 'sales' | 'expenses' | 'workers' | 'calculator') => void;
  onOpenAddSale: () => void;
  onOpenReport: () => void;
  onExportData: () => void;
  onResetData: () => void;
  settings: SeasonSettings;
  onCurrencyChange: (currency: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddSale,
  onOpenReport,
  onExportData,
  onResetData,
  settings,
  onCurrencyChange,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <button 
              onClick={() => setCurrentTab('dashboard')} 
              className="text-right group focus:outline-none"
            >
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                ورق العنب الفرنسي
              </h1>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                currentTab === 'dashboard'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              لوحة الموسم
            </button>
            <button
              onClick={() => setCurrentTab('sales')}
              className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                currentTab === 'sales'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              سجل المبيعات
            </button>
            <button
              onClick={() => setCurrentTab('expenses')}
              className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                currentTab === 'expenses'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              صفحة المصاريف
            </button>
            <button
              onClick={() => setCurrentTab('workers')}
              className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                currentTab === 'workers'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              أجور العمال
            </button>
            <button
              onClick={() => setCurrentTab('calculator')}
              className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                currentTab === 'calculator'
                  ? 'border-emerald-600 text-emerald-800 font-semibold'
                  : 'border-transparent hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              حاسبة التسعير
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-stone-100 rounded-md px-2 py-1 text-xs border border-stone-200">
              <span className="text-stone-500 ml-1 hidden sm:inline">العملة:</span>
              <select
                value={settings.currency}
                aria-label="اختيار عملة التطبيق"
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.symbol} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Season Report */}
            <button
              onClick={onOpenReport}
              title="طباعة كشف حساب الموسم"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>كشف الموسم</span>
            </button>

            {/* Backup export */}
            <button
              onClick={onExportData}
              title="تصدير نسخة احتياطية من البيانات"
              className="hidden sm:inline-flex items-center p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Reset to sample data */}
            <button
              onClick={onResetData}
              title="استعادة البيانات الافتراضية"
              className="hidden lg:inline-flex items-center p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenAddSale}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة بيع جديد</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-stone-100 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            لوحة الموسم
          </button>
          <button
            onClick={() => setCurrentTab('sales')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'sales'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            سجل المبيعات
          </button>
          <button
            onClick={() => setCurrentTab('expenses')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'expenses'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            المصاريف
          </button>
          <button
            onClick={() => setCurrentTab('workers')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'workers'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            أجور العمال
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              currentTab === 'calculator'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            حاسبة التسعير
          </button>
          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 rounded-md whitespace-nowrap bg-stone-100 text-stone-700 hover:bg-stone-200 flex items-center gap-1"
          >
            <Printer className="w-3 h-3" />
            <span>كشف الموسم</span>
          </button>
        </div>
      </div>
    </header>
  );
};
