import React, { useState, useId } from 'react';
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Scale, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface CalculatorViewProps {
  currencySymbol: string;
  onApplyToNewSale?: (params: { quantity: number; unitPrice: number; laborCost: number }) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  currencySymbol,
  onApplyToNewSale,
}) => {
  const calcQuantityId = useId();
  const calcUnitPriceId = useId();
  const laborMethodId = useId();
  const laborRateId = useId();
  const extraExpensesId = useId();

  const [quantity, setQuantity] = useState<number>(300);
  const [unitPrice, setUnitPrice] = useState<number>(3.30);
  const [laborMethod, setLaborMethod] = useState<'per_kg' | 'fixed'>('per_kg');
  const [laborRate, setLaborRate] = useState<number>(0.40); // per kg or fixed
  const [extraExpenses, setExtraExpenses] = useState<number>(25); // transport / boxes

  // Calculated values
  const totalRevenue = Number((quantity * unitPrice).toFixed(2));
  const totalLaborCost = laborMethod === 'per_kg' 
    ? Number((quantity * laborRate).toFixed(2)) 
    : Number(laborRate.toFixed(2));
  
  const totalCosts = Number((totalLaborCost + extraExpenses).toFixed(2));
  const netProfit = Number((totalRevenue - totalCosts).toFixed(2));
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const netPerKg = quantity > 0 ? netProfit / quantity : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center justify-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-700" />
          <span>حاسبة تسعير ومردود ورق العنب الفرنسي</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          محاكاة سريعة قبل إتمام أي صفقة: احسب مجموع البيع، تكلفة أجور العمال، وصافي الأرباح المتوقعة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Input Parameters Box */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>بيانات المحصول والأسعار</span>
            <span className="text-xs font-normal text-stone-500">القيم قابلة للتعديل المباشر</span>
          </h3>

          {/* Quantity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={calcQuantityId} className="text-xs font-semibold text-stone-700">
                الكمية التقديرية للقطاف والبيع
              </label>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {formatNumber(quantity)} كغ
              </span>
            </div>
            <input
              id={calcQuantityId}
              type="number"
              step="10"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            {/* Quick Quantity Buttons */}
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 200, 350, 500, 1000].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`px-2 py-1 text-[11px] rounded-md font-mono transition-colors ${
                    quantity === q 
                      ? 'bg-emerald-800 text-white font-bold' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {q} كغ
                </button>
              ))}
            </div>
          </div>

          {/* Unit Price */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={calcUnitPriceId} className="text-xs font-semibold text-stone-700">
                السعر الإفرادي المتوقع للكيلو ({currencySymbol})
              </label>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {formatCurrency(unitPrice, currencySymbol)}/كغ
              </span>
            </div>
            <input
              id={calcUnitPriceId}
              type="number"
              step="0.1"
              min="0.1"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <div className="flex gap-1.5 mt-2">
              {[2.0, 2.5, 3.0, 3.2, 3.5, 4.0].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setUnitPrice(p)}
                  className={`px-2 py-1 text-[11px] rounded-md font-mono transition-colors ${
                    unitPrice === p 
                      ? 'bg-emerald-800 text-white font-bold' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {p} {currencySymbol}
                </button>
              ))}
            </div>
          </div>

          {/* Worker Wages calculation */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor={laborMethodId} className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>طريقة احتساب أجر العمال</span>
              </label>
              <div className="flex text-xs bg-white rounded-md border border-amber-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setLaborMethod('per_kg');
                    setLaborRate(0.40);
                  }}
                  className={`px-2.5 py-1 ${laborMethod === 'per_kg' ? 'bg-amber-700 text-white font-semibold' : 'text-stone-600'}`}
                >
                  بالكيلو
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLaborMethod('fixed');
                    setLaborRate(120);
                  }}
                  className={`px-2.5 py-1 ${laborMethod === 'fixed' ? 'bg-amber-700 text-white font-semibold' : 'text-stone-600'}`}
                >
                  مقطوعية ثابتة
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={laborRateId} className="block text-[11px] text-stone-600 mb-1">
                {laborMethod === 'per_kg' 
                  ? `أجر قطاف الكيلو الواحد للعمال (${currencySymbol}/كغ)` 
                  : `إجمالي أجر الورشة المقطوع (${currencySymbol})`}
              </label>
              <input
                id={laborRateId}
                type="number"
                step="any"
                min="0"
                value={laborRate}
                onChange={(e) => setLaborRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-amber-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Other expenses (transport, boxes) */}
          <div>
            <label htmlFor={extraExpensesId} className="block text-xs font-semibold text-stone-700 mb-1">
              مصاريف شحن ونقل وأقفاص للدفعة ({currencySymbol})
            </label>
            <input
              id={extraExpensesId}
              type="number"
              step="any"
              min="0"
              value={extraExpenses}
              onChange={(e) => setExtraExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Real-time Results & Net Profit Breakdown */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-stone-800">
              <span>النتيجة المالية التقديرية</span>
              <span className="text-emerald-400 font-mono font-semibold">محاكاة فورية</span>
            </div>

            {/* Total Sale */}
            <div>
              <span className="text-xs text-stone-400 block">إجمالي قيمة المبيع المتوقعة</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
                {formatCurrency(totalRevenue, currencySymbol)}
              </div>
              <span className="text-[11px] text-stone-400 font-mono block">
                {formatNumber(quantity)} كغ × {formatCurrency(unitPrice, currencySymbol)}
              </span>
            </div>

            {/* Deductions Breakdown */}
            <div className="p-3 bg-stone-800/80 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-amber-300">
                <span>أجر عمال القطاف:</span>
                <span className="font-mono font-semibold">- {formatCurrency(totalLaborCost, currencySymbol)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-300">
                <span>مصاريف إضافية (أقفاص ونقل):</span>
                <span className="font-mono font-semibold">- {formatCurrency(extraExpenses, currencySymbol)}</span>
              </div>
              <div className="pt-2 border-t border-stone-700 flex justify-between items-center text-stone-300 font-bold">
                <span>إجمالي التكاليف:</span>
                <span className="font-mono text-rose-400">{formatCurrency(totalCosts, currencySymbol)}</span>
              </div>
            </div>

            {/* Net Season Profit from batch */}
            <div className="pt-2">
              <span className="text-xs text-emerald-400 block">صافي الربح الفعلي بعد كل المصاريف</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-300 tabular-nums mt-1">
                {formatCurrency(netProfit, currencySymbol)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>هامش الربح: <strong className="text-white">{profitMargin.toFixed(1)}%</strong></span>
                <span>صافي الكيلو: <strong className="text-emerald-300">{formatCurrency(netPerKg, currencySymbol)}</strong></span>
              </div>
            </div>

            {/* Transfer to new sale button */}
            {onApplyToNewSale && (
              <button
                type="button"
                onClick={() => onApplyToNewSale({
                  quantity,
                  unitPrice,
                  laborCost: totalLaborCost
                })}
                className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>اعتماد هذه الأرقام وإضافة بيع جديد</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>نصيحة لتسعير ورق العنب الفرنسي:</span>
            </h4>
            <p className="leading-relaxed">
              تصل أسعار ورق العنب الفرنسي في ذروة بداية الموسم (أول قطفة) إلى أعلى مستوياتها لندرته وطراوته الفائقة، بينما تنخفض تدريجياً في منتصف الموسم مع وفرة العرض. احرص على حسم أجر القطاف المباشر لضمان معرفة هامش ربحك قبل الاتفاق مع التاجر.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
