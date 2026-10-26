import React from 'react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Scale, 
  ArrowUpRight, 
  PlusCircle, 
  Receipt, 
  DollarSign,
  ChevronLeft,
  Calendar,
  Sparkles,
  MessageCircle,
  CircleHelp
} from 'lucide-react';
import { AppTab, SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings } from '../types';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/formatters';
import { getSaleKgEquivalent } from '../utils/units';
import vineyardImage from '../assets/images/vineyard_grape_leaves_1792997175000.jpg';

interface DashboardViewProps {
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  workerWages: WorkerWageRecord[];
  settings: SeasonSettings;
  onNavigate: (tab: AppTab) => void;
  onOpenAddSale: () => void;
  onOpenAddExpense: () => void;
  onOpenAddWorker: () => void;
  onViewReceipt: (sale: SaleRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sales,
  expenses,
  workerWages,
  settings,
  onNavigate,
  onOpenAddSale,
  onOpenAddExpense,
  onOpenAddWorker,
  onViewReceipt,
}) => {
  // Calculations
  const totalSalesRevenue = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalSalesLaborCost = sales.reduce((acc, curr) => acc + curr.laborCost, 0);
  
  // Independent worker wages not tied to sales (or total recorded worker wages)
  const totalRecordedWorkerWages = workerWages.reduce((acc, curr) => acc + curr.totalWage, 0);
  
  // To avoid double counting labor that is already part of sales, check relatedSaleId
  const extraWorkerWages = workerWages
    .filter(w => !w.relatedSaleId)
    .reduce((acc, curr) => acc + curr.totalWage, 0);
  
  const totalLaborCostAll = totalSalesLaborCost + extraWorkerWages;
  const totalOperatingExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAllCosts = totalLaborCostAll + totalOperatingExpenses;
  const netSeasonProfit = totalSalesRevenue - totalAllCosts;
  
  const profitMargin = totalSalesRevenue > 0 ? (netSeasonProfit / totalSalesRevenue) * 100 : 0;
  
  // Total quantity
  const totalKgSold = sales.reduce((acc, curr) => acc + getSaleKgEquivalent(curr), 0);
  const salesWithKnownWeight = sales.filter((sale) => getSaleKgEquivalent(sale) > 0);
  const packageSalesWithoutWeight = sales.filter((sale) => sale.unit !== 'كيلوغرام' && getSaleKgEquivalent(sale) === 0).length;
  const knownWeightRevenue = salesWithKnownWeight.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const knownWeightLabor = salesWithKnownWeight.reduce((acc, sale) => acc + sale.laborCost, 0) + extraWorkerWages;

  const averagePricePerUnit = totalKgSold > 0 ? knownWeightRevenue / totalKgSold : 0;
  const averageLaborPerUnit = totalKgSold > 0 ? knownWeightLabor / totalKgSold : 0;

  // Unpaid sales receivables
  const totalReceivables = sales.reduce((acc, curr) => {
    const diff = curr.totalAmount - curr.paidAmount;
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  // Target progress
  const targetProgress = settings.targetHarvestKg > 0 
    ? Math.min(100, Math.round((totalKgSold / settings.targetHarvestKg) * 100))
    : 0;

  // Category breakdown
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with High-Res Vineyard Photo */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={vineyardImage}
            alt="كروم ورق العنب الفرنسي"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{settings.seasonName}</span>
              <span aria-hidden="true">·</span>
              <span>{settings.farmName}</span>
              {settings.farmerName.trim() && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>المزارع: {settings.farmerName}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              إدارة موسم ورق العنب الفرنسي
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              متابعة دقيقة لمبيعات أوراق العنب الفاخرة، حساب السعر الإفرادي وأجور ورشات القطاف، وحصر جميع مصاريف البستان لحساب صافي الأرباح الفعلية.
            </p>
          </div>

          {/* Quick Target Progress */}
          <div className="bg-stone-900/80 backdrop-blur-xs p-4 rounded-xl border border-stone-700/60 w-full md:w-72 shrink-0">
            <div className="flex justify-between items-center text-xs text-stone-300 mb-1.5">
              <span>هدف القطف ({formatNumber(settings.targetHarvestKg)} كغ)</span>
              <span className="font-mono font-bold text-emerald-400">{targetProgress}%</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-stone-400 flex justify-between font-mono">
              <span>تم قطف وبيع: {formatNumber(totalKgSold)} كغ</span>
              <span>المتبقي: {formatNumber(Math.max(0, settings.targetHarvestKg - totalKgSold))} كغ</span>
            </div>
          </div>
        </div>
      </div>

      {packageSalesWithoutWeight > 0 && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          لا يشمل إجمالي الكيلوغرامات {packageSalesWithoutWeight} عملية بيع قديمة بوحدة تعبئة لم يُسجل وزنها. عدّل كل عملية وأدخل وزن الوحدة لاحتسابها.
        </p>
      )}
      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
            {formatCurrency(totalSalesRevenue, settings.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>عدد الصفقات: {sales.length}</span>
            <span className="font-mono">{formatNumber(totalKgSold)} كغ مباع</span>
          </div>
        </div>

        {/* Total Labor Wages */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">أجور العمال والقطاف</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {formatCurrency(totalLaborCostAll, settings.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>معدل أجر الكيلو:</span>
            <span className="font-mono font-medium text-stone-700">
              {formatCurrency(averageLaborPerUnit, settings.currency)}/كغ
            </span>
          </div>
        </div>

        {/* Operational Expenses */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">المصاريف التشغيلية</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {formatCurrency(totalOperatingExpenses, settings.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>{expenses.length} بنود مصروف</span>
            <span>ري، أقفاص، نقل، أسمدة</span>
          </div>
        </div>

        {/* Net Season Profit */}
        <div className="bg-emerald-900 text-white p-5 rounded-xl border border-emerald-950 shadow-xs">
          <div className="flex items-center justify-between text-emerald-200 mb-2">
            <span className="text-xs font-medium">صافي أرباح الموسم</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatCurrency(netSeasonProfit, settings.currency)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-200">
            <span>هامش الربح:</span>
            <span className="font-mono font-bold text-white">{profitMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Financial Indicators Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs">
        <div>
          <span className="text-stone-500 block mb-0.5">متوسط سعر البيع للكيلو</span>
          <span className="text-sm font-bold font-mono text-stone-900">
            {formatCurrency(averagePricePerUnit, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block mb-0.5">إجمالي تكاليف الموسم (عمال + مصاريف)</span>
          <span className="text-sm font-bold font-mono text-rose-700">
            {formatCurrency(totalAllCosts, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block mb-0.5">مستحقات آجلة لدى التجار</span>
          <span className="text-sm font-bold font-mono text-amber-700">
            {formatCurrency(totalReceivables, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-stone-500 block mb-0.5">عائد الكيلو الصافي بعد التكاليف</span>
          <span className="text-sm font-bold font-mono text-emerald-700">
            {packageSalesWithoutWeight > 0 ? 'غير متاح حتى إدخال أوزان السجلات القديمة' : formatCurrency(totalKgSold > 0 ? netSeasonProfit / totalKgSold : 0, settings.currency)}
          </span>
        </div>
      </div>

      {/* Financial Health Balance Bar */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h3 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <span>توزيع الإيراد الكلي للموسم</span>
          <span className="text-xs font-normal text-stone-500">
            (صافي الربح مقابل أجور العمال والمصاريف)
          </span>
        </h3>
        
        {totalSalesRevenue > 0 ? (
          <div>
            <div className="h-6 w-full rounded-lg overflow-hidden flex bg-stone-100">
              {/* Net Profit */}
              <div 
                style={{ width: `${Math.max(0, (netSeasonProfit / totalSalesRevenue) * 100)}%` }}
                className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                title={`صافي الربح: ${formatCurrency(netSeasonProfit, settings.currency)}`}
              >
                {((netSeasonProfit / totalSalesRevenue) * 100) > 12 && `${((netSeasonProfit / totalSalesRevenue) * 100).toFixed(0)}% صافي ربح`}
              </div>
              {/* Labor Wages */}
              <div 
                style={{ width: `${(totalLaborCostAll / totalSalesRevenue) * 100}%` }}
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                title={`أجور العمال: ${formatCurrency(totalLaborCostAll, settings.currency)}`}
              >
                {((totalLaborCostAll / totalSalesRevenue) * 100) > 12 && `${((totalLaborCostAll / totalSalesRevenue) * 100).toFixed(0)}% أجور عمال`}
              </div>
              {/* Operating Expenses */}
              <div 
                style={{ width: `${(totalOperatingExpenses / totalSalesRevenue) * 100}%` }}
                className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                title={`المصاريف التشغيلية: ${formatCurrency(totalOperatingExpenses, settings.currency)}`}
              >
                {((totalOperatingExpenses / totalSalesRevenue) * 100) > 12 && `${((totalOperatingExpenses / totalSalesRevenue) * 100).toFixed(0)}% مصاريف`}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>صافي الأرباح ({formatCurrency(netSeasonProfit, settings.currency)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" />
                <span>أجور العمال والقطاف ({formatCurrency(totalLaborCostAll, settings.currency)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span>المصاريف والتشغيل ({formatCurrency(totalOperatingExpenses, settings.currency)})</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-500">لا توجد مبيعات مسجلة حتى الآن لحساب النسب المالية.</p>
        )}
      </div>

      {/* Two Column Layout: Recent Sales & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Column */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-stone-900">آخر صفقات المبيعات</h3>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
            >
              <span>عرض كل المبيعات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-stone-100">
            {sales.slice(0, 4).map((sale) => (
              <div key={sale.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900 truncate">
                      {sale.buyerName}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formatDateArabic(sale.date)}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <span className="font-mono font-medium text-stone-700">
                      {formatNumber(sale.quantity)} {sale.unit}{sale.unit !== 'كيلوغرام' && sale.weightPerUnitKg ? ` (${formatNumber(sale.weightPerUnitKg)} كغ/وحدة)` : ''}
                    </span>
                    <span aria-hidden="true">×</span>
                    <span className="font-mono">
                      {formatCurrency(sale.unitPrice, settings.currency)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-mono">
                      أجر عمال: {formatCurrency(sale.laborCost, settings.currency)}
                    </span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-sm font-bold font-mono text-emerald-800">
                    {formatCurrency(sale.totalAmount, settings.currency)}
                  </div>
                  <button
                    onClick={() => onViewReceipt(sale)}
                    className="text-[11px] text-stone-500 hover:text-emerald-700 underline mt-0.5 block"
                  >
                    سند البيع
                  </button>
                </div>
              </div>
            ))}

            {sales.length === 0 && (
              <div className="py-8 text-center text-stone-400 text-xs">
                لم يتم تسجيل أي عملية بيع حتى الآن
              </div>
            )}
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-100 rounded-b-xl flex justify-between items-center text-xs">
            <span className="text-stone-500">إجمالي المبيعات المعروضة</span>
            <button
              onClick={onOpenAddSale}
              className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>إضافة بيع جديد</span>
            </button>
          </div>
        </div>

        {/* Recent Expenses Column */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-stone-900">آخر بنود المصاريف</h3>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-0.5"
            >
              <span>عرض كل المصاريف</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-stone-100">
            {expenses.slice(0, 4).map((exp) => (
              <div key={exp.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate">
                    {exp.title}
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <span className="text-stone-600">{exp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-stone-400">{formatDateArabic(exp.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exp.paidTo}</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-sm font-bold font-mono text-rose-700">
                    {formatCurrency(exp.amount, settings.currency)}
                  </div>
                  <span className="text-[11px] text-stone-400">{exp.paymentMethod}</span>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="py-8 text-center text-stone-400 text-xs">
                لم يتم تسجيل أي مصاريف حتى الآن
              </div>
            )}
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-100 rounded-b-xl flex justify-between items-center text-xs">
            <span className="text-stone-500">مجموع المصاريف: {formatCurrency(totalOperatingExpenses, settings.currency)}</span>
            <button
              onClick={onOpenAddExpense}
              className="font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        <button
          onClick={onOpenAddSale}
          className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-right transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800">
              تسجيل عملية بيع جديدة
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              إدخال الكمية بالكيلو، السعر الإفرادي، أجر العمال واحتساب الإجمالي تلقائياً
            </p>
          </div>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-right transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-rose-700 text-white shrink-0 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-rose-800">
              تسجيل مصروف للبستان
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              أقفاص، مازوت، ري، أسمدة، نقل، أو طعام وضيافة لورشة القطاف
            </p>
          </div>
        </button>

        <button
          onClick={onOpenAddWorker}
          className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-right transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-amber-700 text-white shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-800">
              إدارة أجور ورشات العمال
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              حساب اليوميات وأجور القطاف بالكيلو ومتابعة المدفوع والمتبقي للورش
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-right transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-sky-700 text-white shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-sky-800">الدردشة العامة</h4>
            <p className="text-xs text-stone-600 mt-0.5">انتقل إلى غرفة مستخدمي التطبيق</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('help')}
          className="p-4 rounded-xl border border-violet-200 bg-violet-50/50 hover:bg-violet-50 text-right transition-colors group flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-violet-700 text-white shrink-0 group-hover:scale-105 transition-transform">
            <CircleHelp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-violet-800">المساعدة</h4>
            <p className="text-xs text-stone-600 mt-0.5">شرح استخدام التطبيق وعملياته</p>
          </div>
        </button>
      </div>
    </div>
  );
};
