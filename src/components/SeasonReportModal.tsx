import React from 'react';
import { X, Printer, Sprout, Download } from 'lucide-react';
import { SaleRecord, ExpenseRecord, WorkerWageRecord, SeasonSettings } from '../types';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/formatters';
import { getSaleKgEquivalent } from '../utils/units';
import { exportSalesToCSV, exportExpensesToCSV } from '../utils/storage';

interface SeasonReportModalProps {
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  workerWages: WorkerWageRecord[];
  settings: SeasonSettings;
  onClose: () => void;
}

export const SeasonReportModal: React.FC<SeasonReportModalProps> = ({
  sales,
  expenses,
  workerWages,
  settings,
  onClose,
}) => {
  const totalSalesRevenue = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalSalesLabor = sales.reduce((acc, curr) => acc + curr.laborCost, 0);
  
  const extraLabor = workerWages
    .filter(w => !w.relatedSaleId)
    .reduce((acc, curr) => acc + curr.totalWage, 0);

  const totalAllLabor = totalSalesLabor + extraLabor;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCosts = totalAllLabor + totalExpenses;
  const netSeasonProfit = totalSalesRevenue - totalCosts;
  const profitMargin = totalSalesRevenue > 0 ? (netSeasonProfit / totalSalesRevenue) * 100 : 0;

  const totalKgSold = sales.reduce((acc, curr) => acc + getSaleKgEquivalent(curr), 0);
  const salesWithKnownWeight = sales.filter((sale) => getSaleKgEquivalent(sale) > 0);
  const packageSalesWithoutWeight = sales.filter((sale) => sale.unit !== 'كيلوغرام' && getSaleKgEquivalent(sale) === 0).length;
  const knownWeightRevenue = salesWithKnownWeight.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const knownWeightLabor = salesWithKnownWeight.reduce((acc, sale) => acc + sale.laborCost, 0) + extraLabor;
  const avgPrice = totalKgSold > 0 ? knownWeightRevenue / totalKgSold : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-4xl w-full my-6 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between no-print shrink-0">
          <div>
            <h3 className="text-sm font-bold text-stone-900">كشف الحساب الختامي لموسم ورق العنب</h3>
            <p className="text-xs text-stone-500">تقرير شامل للمبيعات، المصاريف، أجور العمال، وصافي الأرباح</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors print-allow"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>
            <button
              onClick={() => {
                exportSalesToCSV(sales, settings.currency);
                exportExpensesToCSV(expenses, settings.currency);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-medium shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 text-stone-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-emerald-800 pb-5 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-emerald-800">
                <Sprout className="w-6 h-6 text-emerald-700" />
                <h1 className="text-xl font-bold">{settings.farmName}</h1>
              </div>
              <h2 className="text-base font-semibold text-stone-800 mt-1">
                التقرير المالي لموسم ورق العنب الفرنسي ({settings.seasonName})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                المزارع المسؤول: {settings.farmerName} · الموقع: {settings.location}
              </p>
            </div>

            <div className="text-left font-mono text-xs text-stone-500">
              <div>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</div>
              <div className="font-bold text-stone-800 mt-0.5">العملة: {settings.currency}</div>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block">إجمالي المبيعات</span>
              <strong className="text-base font-mono text-emerald-800">
                {formatCurrency(totalSalesRevenue, settings.currency)}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block">إجمالي أجور العمال</span>
              <strong className="text-base font-mono text-amber-700">
                {formatCurrency(totalAllLabor, settings.currency)}
              </strong>
            </div>

            <div>
              <span className="text-stone-500 block">المصاريف التشغيلية</span>
              <strong className="text-base font-mono text-rose-700">
                {formatCurrency(totalExpenses, settings.currency)}
              </strong>
            </div>

            <div className="bg-emerald-900 text-white p-2.5 rounded-lg">
              <span className="text-emerald-200 block text-[11px]">صافي أرباح الموسم</span>
              <strong className="text-base font-mono text-emerald-300">
                {formatCurrency(netSeasonProfit, settings.currency)}
              </strong>
              <span className="text-[10px] text-emerald-200 block mt-0.5">
                هامش الربح: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Production Key Figures */}
          <div className="flex justify-between items-center bg-stone-100/70 p-3 rounded-lg text-xs font-mono text-stone-700">
            <span>إجمالي الكمية المقطوفة والمباعة: <strong>{formatNumber(totalKgSold)} كغ</strong></span>
            <span>متوسط سعر البيع للكيلو: <strong>{formatCurrency(avgPrice, settings.currency)}</strong></span>
            <span>متوسط تكلفة قطاف الكيلو: <strong>{formatCurrency(totalKgSold > 0 ? knownWeightLabor / totalKgSold : 0, settings.currency)}</strong></span>
          </div>

          {packageSalesWithoutWeight > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              لم يُحتسب وزن {packageSalesWithoutWeight} عملية بيع قديمة بوحدة تعبئة لعدم توفر وزن الوحدة.
            </p>
          )}
          {/* Sales Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-1">
              أولاً: كشف مبيعات ورق العنب الفرنسي ({sales.length} عمليات بيع)
            </h3>
            <table className="w-full text-right text-xs border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="py-2 px-3">التاريخ</th>
                  <th className="py-2 px-3">المشتري</th>
                  <th className="py-2 px-3">الكمية</th>
                  <th className="py-2 px-3">السعر الإفرادي</th>
                  <th className="py-2 px-3">أجر العمال</th>
                  <th className="py-2 px-3">مجموع البيع</th>
                  <th className="py-2 px-3">الصافي</th>
                  <th className="py-2 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 text-stone-500">{formatDateArabic(s.date)}</td>
                    <td className="py-2 px-3 font-sans font-medium text-stone-900">{s.buyerName}</td>
                    <td className="py-2 px-3">{formatNumber(s.quantity)} {s.unit}{s.unit !== 'كيلوغرام' && s.weightPerUnitKg ? ` (${formatNumber(s.weightPerUnitKg)} كغ/وحدة)` : ''}</td>
                    <td className="py-2 px-3">{formatCurrency(s.unitPrice, settings.currency)}</td>
                    <td className="py-2 px-3 text-amber-700">{formatCurrency(s.laborCost, settings.currency)}</td>
                    <td className="py-2 px-3 font-bold">{formatCurrency(s.totalAmount, settings.currency)}</td>
                    <td className="py-2 px-3 font-bold text-emerald-800">{formatCurrency(s.netAmount, settings.currency)}</td>
                    <td className="py-2 px-3 font-sans text-[11px]">{s.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expenses Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-1">
              ثانياً: كشف المصاريف التشغيلية للموسم ({expenses.length} بنود)
            </h3>
            <table className="w-full text-right text-xs border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="py-2 px-3">التاريخ</th>
                  <th className="py-2 px-3">بيان المصروف</th>
                  <th className="py-2 px-3">التصنيف</th>
                  <th className="py-2 px-3">المدفوع له</th>
                  <th className="py-2 px-3">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 px-3 text-stone-500">{formatDateArabic(e.date)}</td>
                    <td className="py-2 px-3 font-sans font-medium text-stone-900">{e.title}</td>
                    <td className="py-2 px-3 font-sans text-stone-600">{e.category}</td>
                    <td className="py-2 px-3 font-sans text-stone-600">{e.paidTo}</td>
                    <td className="py-2 px-3 font-bold text-rose-700">{formatCurrency(e.amount, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Report Footer / Signature */}
          <div className="pt-8 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
            <div>
              تم استخراج هذا التقرير تلقائياً بواسطة نظام إدارة موسم ورق العنب الفرنسي
            </div>
            <div>
              اعتماد صاحب الكرم / المزارع: _____________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
