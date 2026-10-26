import React, { useState } from 'react';
import { 
  Sprout, 
  Calculator, 
  Printer, 
  Download, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  Menu, 
  X,
  Settings,
  Info,
  MessageCircle,
  CircleHelp
} from 'lucide-react';
import { AVAILABLE_CURRENCIES } from '../data/initialData';
import { AppTab, SeasonSettings } from '../types';

interface MobileTopBarProps {
  currentTab: string;
  setCurrentTab: (tab: AppTab) => void;
  settings: SeasonSettings;
  onCurrencyChange: (currency: string) => void;
  onOpenReport: () => void;
  onExportData: () => void;
  onResetData: () => void;
  isSimulatorMode: boolean;
  setIsSimulatorMode: (val: boolean) => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentTab,
  setCurrentTab,
  settings,
  onCurrencyChange,
  onOpenReport,
  onExportData,
  onResetData,
  isSimulatorMode,
  setIsSimulatorMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs no-print">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Brand Slot */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sprout className="w-4.5 h-4.5 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-stone-900 truncate leading-tight">
                ورق العنب الفرنسي
              </h1>
              <span className="text-[10px] text-stone-500 block truncate font-mono">
                {settings.farmerName || settings.farmName}
              </span>
            </div>
          </div>

          {/* Action Slot */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Currency Selector */}
            <div className="bg-stone-100 border border-stone-200 rounded-md px-1.5 py-1 text-xs">
              <select
                value={settings.currency}
                aria-label="اختيار عملة التطبيق"
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer text-xs"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.symbol}
                  </option>
                ))}
              </select>
            </div>

            {/* Calculator Tab Trigger */}
            <button
              onClick={() => setCurrentTab('calculator')}
              title="حاسبة التسعير"
              className={`p-2 rounded-lg transition-colors ${
                currentTab === 'calculator' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Toggle Phone Frame Simulator on desktop screens */}
            <button
              onClick={() => setIsSimulatorMode(!isSimulatorMode)}
              title={isSimulatorMode ? "التبديل إلى العرض الكامل" : "التبديل إلى إطار الموبايل الذكي"}
              className={`hidden sm:flex p-2 rounded-lg transition-colors ${
                isSimulatorMode 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {isSimulatorMode ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </button>

            {/* Drawer Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="القائمة الجانبية"
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Grab Handle for mobile */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto sm:hidden mb-1" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900">إعدادات وقوائم الموسم</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setCurrentTab('chat');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">الدردشة العامة</div>
                  <div className="text-[11px] text-stone-500">تواصل مع مستخدمي التطبيق</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">إعدادات المزارع</div>
                  <div className="text-[11px] text-stone-500">إدخال اسم المزارع الذي يظهر في الفواتير</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('about');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">حول التطبيق</div>
                  <div className="text-[11px] text-stone-500">رقم النسخة ومعلومات التطبيق</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('help');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <CircleHelp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">المساعدة</div>
                  <div className="text-[11px] text-stone-500">شرح استخدام صفحات وعمليات التطبيق</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenReport();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">كشف الحساب الختامي للموسم</div>
                  <div className="text-[11px] text-stone-500">طباعة تقرير شامل بكافة المبيعات والمصاريف</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('calculator');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">حاسبة تسعير ورق العنب</div>
                  <div className="text-[11px] text-stone-500">حساب فوري للأرباح المتوقعة قبل الاتفاق مع التاجر</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportData();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">تصدير نسخة احتياطية (JSON)</div>
                  <div className="text-[11px] text-stone-500">حفظ نسخة كاملة من بياناتك خارج المتصفح</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsSimulatorMode(!isSimulatorMode);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-stone-800 hover:bg-stone-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">
                    {isSimulatorMode ? "التبديل إلى وضع ملء الشاشة" : "التبديل إلى محاكي إطار الموبايل"}
                  </div>
                  <div className="text-[11px] text-stone-500">معاينة التطبيق داخل إطار هاتف ذكي</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onResetData();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-rose-700 hover:bg-rose-50 rounded-xl text-right font-medium transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">مسح بيانات الموسم</div>
                  <div className="text-[11px] text-stone-500">حذف المبيعات والأجور والمصاريف من هذا الجهاز</div>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-stone-400">
              {settings.farmName} · {settings.seasonName}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
