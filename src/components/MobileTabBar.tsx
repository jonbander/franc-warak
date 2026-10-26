import React from 'react';
import { AppTab } from '../types';
import { 
  Home, 
  Coins, 
  Plus, 
  Receipt, 
  Users 
} from 'lucide-react';

interface MobileTabBarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onOpenAddSale: () => void;
  salesCount: number;
  expensesCount: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddSale,
  salesCount,
  expensesCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl no-print">
      <div className="max-w-lg mx-auto px-2">
        <div className="grid grid-cols-5 items-center h-16 relative">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              currentTab === 'dashboard'
                ? 'text-emerald-800 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">الرئيسية</span>
            {currentTab === 'dashboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 absolute bottom-1" />
            )}
          </button>

          {/* Tab 2: Sales */}
          <button
            onClick={() => setCurrentTab('sales')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              currentTab === 'sales'
                ? 'text-emerald-800 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Coins className="w-5 h-5" />
              {salesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-mono px-1 rounded-full min-w-4 text-center">
                  {salesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">المبيعات</span>
            {currentTab === 'sales' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 absolute bottom-1" />
            )}
          </button>

          {/* Tab 3: Center Elevated Action Button (+ بيع) */}
          <div className="flex flex-col items-center justify-center -mt-6">
            <button
              onClick={onOpenAddSale}
              title="إضافة بيع فوري"
              className="w-13 h-13 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30 border-4 border-white transition-transform cursor-pointer"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-bold text-emerald-800 mt-1">
              + بيع جديد
            </span>
          </div>

          {/* Tab 4: Expenses */}
          <button
            onClick={() => setCurrentTab('expenses')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              currentTab === 'expenses'
                ? 'text-rose-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {expensesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-mono px-1 rounded-full min-w-4 text-center">
                  {expensesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">المصاريف</span>
            {currentTab === 'expenses' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 absolute bottom-1" />
            )}
          </button>

          {/* Tab 5: Workers */}
          <button
            onClick={() => setCurrentTab('workers')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              currentTab === 'workers'
                ? 'text-amber-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">العمال</span>
            {currentTab === 'workers' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 absolute bottom-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
