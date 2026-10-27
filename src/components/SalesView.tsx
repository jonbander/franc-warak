import React, { useState, useId, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Printer, 
  FileText, 
  X,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { SaleRecord, WorkerWageRecord, GrapeVariety, UnitType, PaymentStatus, PaymentMethod } from '../types';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/formatters';
import { exportSalesToCSV } from '../utils/storage';

interface SalesViewProps {
  sales: SaleRecord[];
  workerWages: WorkerWageRecord[];
  currencySymbol: string;
  onAddSale: (sale: Omit<SaleRecord, 'id' | 'createdAt'>) => void;
  onUpdateSale: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
  onViewReceipt: (sale: SaleRecord) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  calculatorPrefill?: { quantity: number; unitPrice: number; laborCost: number } | null;
  onCalculatorPrefillConsumed?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  workerWages,
  currencySymbol,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  onViewReceipt,
  isAddModalOpen,
  setIsAddModalOpen,
  calculatorPrefill,
  onCalculatorPrefillConsumed,
}) => {
  const buyerNameId = useId();
  const buyerPhoneId = useId();
  const dateId = useId();
  const varietyId = useId();
  const quantityId = useId();
  const unitId = useId();
  const weightPerUnitKgId = useId();
  const unitPriceId = useId();
  const laborCostId = useId();
  const laborPaidAmountId = useId();
  const paymentStatusId = useId();
  const paidAmountId = useId();
  const paymentMethodId = useId();
  const workerNotesId = useId();
  const notesId = useId();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariety, setSelectedVariety] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Edit mode state
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    buyerName: '',
    buyerPhone: '',
    grapeVariety: 'ورق عنب فرنسي نخب أول (طري وفاخر)' as GrapeVariety,
    quantity: 100,
    unit: 'كيلوغرام' as UnitType,
    weightPerUnitKg: 0,
    unitPrice: 3.0,
    laborCost: 40,
    laborPaidAmount: 0,
    paidAmount: 300,
    paymentStatus: 'مدفوع بالكامل' as PaymentStatus,
    paymentMethod: 'نقدي (كاش)' as PaymentMethod,
    workerNotes: '',
    notes: '',
  });

  useEffect(() => {
    if (!isAddModalOpen || !calculatorPrefill) return;
    const total = Number((calculatorPrefill.quantity * calculatorPrefill.unitPrice).toFixed(2));
    setEditingSale(null);
    setFormData((current) => ({ ...current, quantity: calculatorPrefill.quantity, unit: 'كيلوغرام', weightPerUnitKg: 0, unitPrice: calculatorPrefill.unitPrice, laborCost: calculatorPrefill.laborCost, laborPaidAmount: 0, paidAmount: total, paymentStatus: 'مدفوع بالكامل' }));
    onCalculatorPrefillConsumed?.();
  }, [isAddModalOpen, calculatorPrefill, onCalculatorPrefillConsumed]);

  // Derived real-time calculations
  const totalAmount = Number((formData.quantity * formData.unitPrice).toFixed(2));
  const netAmount = Number((totalAmount - formData.laborCost).toFixed(2));
  const remainingAmount = Number((totalAmount - formData.paidAmount).toFixed(2));

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingSale(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      buyerName: '',
      buyerPhone: '',
      grapeVariety: 'ورق عنب فرنسي نخب أول (طري وفاخر)',
      quantity: 100,
      unit: 'كيلوغرام',
      weightPerUnitKg: 0,
      unitPrice: 3.2,
      laborCost: 40,
      laborPaidAmount: 0,
      paidAmount: 320,
      paymentStatus: 'مدفوع بالكامل',
      paymentMethod: 'نقدي (كاش)',
      workerNotes: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (sale: SaleRecord) => {
    const linkedWage = workerWages.find((wage) => wage.relatedSaleId === sale.id);
    setEditingSale(sale);
    setFormData({
      date: sale.date,
      buyerName: sale.buyerName,
      buyerPhone: sale.buyerPhone || '',
      grapeVariety: sale.grapeVariety,
      quantity: sale.quantity,
      unit: sale.unit,
      weightPerUnitKg: sale.weightPerUnitKg ?? 0,
      unitPrice: sale.unitPrice,
      laborCost: sale.laborCost,
      laborPaidAmount: sale.laborPaidAmount ?? linkedWage?.paidWage ?? 0,
      paidAmount: sale.paidAmount,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      workerNotes: sale.workerNotes || '',
      notes: sale.notes || '',
    });
    setIsAddModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buyerName.trim()) {
      alert('يرجى إدخال اسم المشتري أو التاجر');
      return;
    }
    if (formData.quantity <= 0 || formData.unitPrice <= 0) {
      alert('يرجى التأكد من إدخال كمية وسعر إفرادي صحيحين');
      return;
    }
    if (formData.unit !== 'كيلوغرام' && (!Number.isFinite(formData.weightPerUnitKg) || formData.weightPerUnitKg <= 0)) {
      alert('يرجى إدخال وزن صحيح بالكيلوغرام لكل وحدة تعبئة');
      return;
    }
    if (!Number.isFinite(formData.paidAmount) || formData.paidAmount < 0 || formData.paidAmount > totalAmount) {
      alert('يجب أن يكون المبلغ المدفوع بين صفر وإجمالي قيمة البيع');
      return;
    }
    if (!Number.isFinite(formData.laborPaidAmount) || formData.laborPaidAmount < 0 || formData.laborPaidAmount > formData.laborCost) {
      alert('يجب أن يكون المدفوع للعمال بين صفر وإجمالي أجرتهم');
      return;
    }
    const computedPaymentStatus: PaymentStatus = formData.paidAmount <= 0 ? 'آجل (غير مدفوع)' : formData.paidAmount >= totalAmount ? 'مدفوع بالكامل' : 'دفعة جزئية';

    const salePayload = {
      date: formData.date,
      buyerName: formData.buyerName.trim(),
      buyerPhone: formData.buyerPhone.trim(),
      grapeVariety: formData.grapeVariety,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      weightPerUnitKg: formData.unit === 'كيلوغرام' ? undefined : Number(formData.weightPerUnitKg),
      unitPrice: Number(formData.unitPrice),
      laborCost: Number(formData.laborCost),
      laborPaidAmount: Number(formData.laborPaidAmount),
      totalAmount,
      netAmount,
      paidAmount: Number(formData.paidAmount),
      paymentStatus: computedPaymentStatus,
      paymentMethod: formData.paymentMethod,
      workerNotes: formData.workerNotes.trim(),
      notes: formData.notes.trim(),
    };

    if (editingSale) {
      onUpdateSale({
        ...salePayload,
        id: editingSale.id,
        createdAt: editingSale.createdAt,
      });
    } else {
      onAddSale(salePayload);
    }

    setIsAddModalOpen(false);
    setEditingSale(null);
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    const matchesSearch = 
      s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.buyerPhone && s.buyerPhone.includes(searchTerm)) ||
      (s.workerNotes && s.workerNotes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVariety = selectedVariety === 'all' || s.grapeVariety === selectedVariety;
    const matchesStatus = selectedStatus === 'all' || s.paymentStatus === selectedStatus;

    return matchesSearch && matchesVariety && matchesStatus;
  });

  // Aggregates
  const totalSalesSum = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalLaborSum = sales.reduce((acc, curr) => acc + curr.laborCost, 0);
  const totalNetSum = sales.reduce((acc, curr) => acc + curr.netAmount, 0);
  const totalQtySum = sales.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Totals */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            سجل مبيعات ورق العنب الفرنسي
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            تسجيل صفقات البيع وحساب السعر الإفرادي وأجر العمال وإجمالي المبيعات وصافي الربح تلقائياً
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportSalesToCSV(sales, currencySymbol)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel/CSV</span>
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة بيع جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">إجمالي المبيعات</span>
          <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
            {formatCurrency(totalSalesSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">أجور عمال القطاف للمبيعات</span>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {formatCurrency(totalLaborSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">صافي أرباح المبيعات</span>
          <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatCurrency(totalNetSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">إجمالي الكمية المباعة</span>
          <div className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {formatNumber(totalQtySum)} كغ
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم التاجر، رقم الهاتف، أو اسم الورشة..."
            className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedVariety}
            aria-label="تصفية حسب نوع الصنف"
            onChange={(e) => setSelectedVariety(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white text-stone-700 cursor-pointer"
          >
            <option value="all">كل أصناف الورق</option>
            <option value="ورق عنب فرنسي نخب أول (طري وفاخر)">نخب أول (طري وفاخر)</option>
            <option value="ورق عنب فرنسي نخب ثاني (متوسط)">نخب ثاني (متوسط)</option>
            <option value="ورق عنب فرنسي مفرّز / معبأ">مفرّز / معبأ</option>
            <option value="ورق عنب فرنسي بلدي مشكّل">بلدي مشكّل</option>
          </select>

          <select
            value={selectedStatus}
            aria-label="تصفية حسب حالة الدفع"
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white text-stone-700 cursor-pointer"
          >
            <option value="all">كل حالات الدفع</option>
            <option value="مدفوع بالكامل">مدفوع بالكامل</option>
            <option value="دفعة جزئية">دفعة جزئية</option>
            <option value="آجل (غير مدفوع)">آجل (غير مدفوع)</option>
          </select>
        </div>
      </div>

      {/* Mobile Card Feed for Smartphone Screen (Visible on sm & down, or in phone frame) */}
      <div className="block md:hidden space-y-3">
        {filteredSales.map((sale) => (
          <div 
            key={sale.id}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3"
          >
            {/* Top row: Merchant & Date */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{sale.buyerName}</h3>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono">{formatDateArabic(sale.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{sale.grapeVariety}</span>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                sale.paymentStatus === 'مدفوع بالكامل'
                  ? 'bg-emerald-50 text-emerald-800'
                  : sale.paymentStatus === 'دفعة جزئية'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-800'
              }`}>
                {sale.paymentStatus}
              </span>
            </div>

            {/* Calculations Grid (The core requested items: Unit Price, Labor, Total, Net) */}
            <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-stone-500 block">الكمية والسعر الإفرادي</span>
                <span className="font-mono font-semibold text-stone-800">
                  {formatNumber(sale.quantity)} {sale.unit} × {formatCurrency(sale.unitPrice, currencySymbol)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-amber-700 block">أجار عمال القطاف</span>
                <span className="font-mono font-semibold text-amber-800">
                  - {formatCurrency(sale.laborCost, currencySymbol)}
                </span>
              </div>

              <div className="pt-1.5 border-t border-stone-200">
                <span className="text-[10px] text-stone-500 block">مجموع البيع</span>
                <span className="font-mono font-bold text-sm text-stone-900">
                  {formatCurrency(sale.totalAmount, currencySymbol)}
                </span>
              </div>

              <div className="pt-1.5 border-t border-stone-200">
                <span className="text-[10px] text-emerald-700 block">صافي الربح</span>
                <span className="font-mono font-extrabold text-sm text-emerald-800">
                  {formatCurrency(sale.netAmount, currencySymbol)}
                </span>
              </div>
            </div>

            {/* Crew or Notes if any */}
            {(sale.workerNotes || sale.notes) && (
              <div className="text-[11px] text-stone-600 bg-stone-100/60 p-2 rounded-lg">
                {sale.workerNotes && <div><strong>الورشة:</strong> {sale.workerNotes}</div>}
                {sale.notes && <div><strong>ملاحظة:</strong> {sale.notes}</div>}
              </div>
            )}

            {/* Action Buttons for Mobile */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
              <button
                onClick={() => onViewReceipt(sale)}
                className="inline-flex items-center gap-1 text-emerald-800 font-semibold py-1.5 px-2 hover:bg-emerald-50 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>سند تسليم / فاتورة</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(sale)}
                  className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف بيع "${sale.buyerName}"؟`)) {
                      onDeleteSale(sale.id);
                    }
                  }}
                  className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-stone-100"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSales.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-xs">لا توجد مبيعات تطابق البحث</p>
          </div>
        )}
      </div>

      {/* Main Sales Table for Larger screens */}
      <div className="hidden md:block bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">المشتري / التاجر</th>
                <th className="py-3 px-4">الكمية</th>
                <th className="py-3 px-4">السعر الإفرادي</th>
                <th className="py-3 px-4">أجار العمال</th>
                <th className="py-3 px-4 font-bold text-stone-900">مجموع البيع</th>
                <th className="py-3 px-4 font-bold text-emerald-800">صافي الربح</th>
                <th className="py-3 px-4">حالة الدفع</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.map((sale) => {
                return (
                  <tr key={sale.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">
                      {formatDateArabic(sale.date)}
                    </td>

                    {/* Buyer & Variety */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{sale.buyerName}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <span>{sale.grapeVariety}</span>
                        {sale.buyerPhone && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-stone-400">{sale.buyerPhone}</span>
                          </>
                        )}
                      </div>
                      {sale.workerNotes && (
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          ورشة: {sale.workerNotes}
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-800 whitespace-nowrap">
                      {formatNumber(sale.quantity)} {sale.unit}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3.5 px-4 font-mono text-stone-700 whitespace-nowrap">
                      {formatCurrency(sale.unitPrice, currencySymbol)}
                    </td>

                    {/* Labor Cost */}
                    <td className="py-3.5 px-4 font-mono text-amber-700 font-medium whitespace-nowrap">
                      {formatCurrency(sale.laborCost, currencySymbol)}
                      <span className="block text-[10px] text-stone-400 font-normal">
                        ({(sale.quantity > 0 ? sale.laborCost / sale.quantity : 0).toFixed(2)}/كغ)
                      </span>
                    </td>

                    {/* Total Sale */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount, currencySymbol)}
                    </td>

                    {/* Net Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {formatCurrency(sale.netAmount, currencySymbol)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          sale.paymentStatus === 'مدفوع بالكامل'
                            ? 'text-emerald-700'
                            : sale.paymentStatus === 'دفعة جزئية'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}>
                          {sale.paymentStatus === 'مدفوع بالكامل' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{sale.paymentStatus}</span>
                        </span>
                        {sale.paymentStatus !== 'مدفوع بالكامل' && (
                          <span className="text-[10px] font-mono text-stone-500">
                            متبقي: {formatCurrency(sale.totalAmount - sale.paidAmount, currencySymbol)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewReceipt(sale)}
                          title="طباعة سند تسليم / فاتورة"
                          className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sale)}
                          title="تعديل"
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف عملية بيع "${sale.buyerName}"؟`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          title="حذف"
                          className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">لا توجد عمليات بيع تطابق شروط البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-600">
          <div>
            إجمالي الصفقات المعروضة: <span className="font-bold text-stone-900 font-mono">{filteredSales.length}</span> من أصل <span className="font-mono">{sales.length}</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>مجموع المبيعات: <strong className="text-stone-900">{formatCurrency(filteredSales.reduce((a, c) => a + c.totalAmount, 0), currencySymbol)}</strong></span>
            <span>صافي الأرباح: <strong className="text-emerald-800">{formatCurrency(filteredSales.reduce((a, c) => a + c.netAmount, 0), currencySymbol)}</strong></span>
          </div>
        </div>
      </div>

      {/* Add / Edit Sale Modal as Bottom Sheet on Mobile */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Grab Handle for touch screen */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto sm:hidden mt-3 mb-1" />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {editingSale ? 'تعديل عملية بيع ورق عنب' : 'إضافة عملية بيع ورق عنب فرنسي'}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  السعر الإفرادي × الكمية = المجموع، مع حسم أجار العمال تلقائياً
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSale(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Buyer & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor={buyerNameId} className="block text-xs font-semibold text-stone-700 mb-1">
                    اسم المشتري / التاجر <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={buyerNameId}
                    type="text"
                    required
                    placeholder="مثال: تاجر سوق الهال - أبو ماهر"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor={buyerPhoneId} className="block text-xs font-semibold text-stone-700 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    id={buyerPhoneId}
                    type="text"
                    placeholder="09xxxxxxxx"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={dateId} className="block text-xs font-semibold text-stone-700 mb-1">
                    تاريخ البيع <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label htmlFor={varietyId} className="block text-xs font-semibold text-stone-700 mb-1">
                    صنف ورق العنب
                  </label>
                  <select
                    id={varietyId}
                    value={formData.grapeVariety}
                    onChange={(e) => setFormData({ ...formData, grapeVariety: e.target.value as GrapeVariety })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white text-stone-800"
                  >
                    <option value="ورق عنب فرنسي نخب أول (طري وفاخر)">ورق عنب فرنسي نخب أول (طري وفاخر)</option>
                    <option value="ورق عنب فرنسي نخب ثاني (متوسط)">ورق عنب فرنسي نخب ثاني (متوسط)</option>
                    <option value="ورق عنب فرنسي مفرّز / معبأ">ورق عنب فرنسي مفرّز / معبأ</option>
                    <option value="ورق عنب فرنسي بلدي مشكّل">ورق عنب فرنسي بلدي مشكّل</option>
                  </select>
                </div>
              </div>

              {/* CORE REQUESTED SECTION: Quantity, Unit Price, Labor Wages, and Total Amount */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
                <div className="text-xs font-bold text-stone-900 flex items-center justify-between">
                  <span>حسابات الكمية والسعر الإفرادي وأجر العمال</span>
                  <span className="text-[11px] text-emerald-700 font-normal">يتم الحساب تلقائياً فوراً</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Quantity */}
                  <div>
                    <label htmlFor={quantityId} className="block text-[11px] font-semibold text-stone-700 mb-1">
                      الكمية المباعة <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id={quantityId}
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={formData.quantity || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          quantity: val,
                          paidAmount: Number((val * formData.unitPrice).toFixed(2)),
                          paymentStatus: 'مدفوع بالكامل'
                        });
                      }}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label htmlFor={unitId} className="block text-[11px] font-semibold text-stone-700 mb-1">
                      الوحدة
                    </label>
                    <select
                      id={unitId}
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-800"
                    >
                      <option value="كيلوغرام">كيلوغرام</option>
                      <option value="صندوق">صندوق</option>
                      <option value="كرتونة">كرتونة</option>
                      <option value="شوال / ربطة">شوال / ربطة</option>
                    </select>
                  </div>

                  {formData.unit !== 'كيلوغرام' && (
                    <div>
                      <label htmlFor={weightPerUnitKgId} className="block text-[11px] font-semibold text-stone-700 mb-1">وزن الوحدة (كغ) *</label>
                      <input id={weightPerUnitKgId} type="number" step="any" min="0.01" required value={formData.weightPerUnitKg || ''} onChange={(e) => setFormData({ ...formData, weightPerUnitKg: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                      <span className="text-[10px] text-stone-500">أدخل الوزن الفعلي لوحدة هذه الصفقة</span>
                    </div>
                  )}

                  {/* Unit Price (السعر الإفرادي) */}
                  <div>
                    <label htmlFor={unitPriceId} className="block text-[11px] font-semibold text-stone-700 mb-1">
                      السعر الإفرادي ({currencySymbol}) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id={unitPriceId}
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={formData.unitPrice || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          unitPrice: val,
                          paidAmount: Number((formData.quantity * val).toFixed(2)),
                          paymentStatus: 'مدفوع بالكامل'
                        });
                      }}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Worker Labor Wages (أجار العمال) */}
                  <div>
                    <label htmlFor={laborCostId} className="block text-[11px] font-semibold text-stone-700 mb-1">
                      أجار العمال ({currencySymbol}) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id={laborCostId}
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={formData.laborCost || ''}
                      onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-amber-300 text-amber-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                  </div>
                  <div>
                    <label htmlFor={laborPaidAmountId} className="block text-[11px] font-semibold text-stone-700 mb-1">
                      المدفوع للعمال ({currencySymbol})
                    </label>
                    <input
                      id={laborPaidAmountId}
                      type="number"
                      step="any"
                      min="0"
                      max={formData.laborCost}
                      value={formData.laborPaidAmount || ''}
                      onChange={(e) => setFormData({ ...formData, laborPaidAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm font-mono bg-white border border-emerald-300 text-emerald-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-stone-500">سيُضاف تلقائياً إلى سجل أجور العمال</span>
                  </div>
                </div>

                {/* Auto-calculated Summary Cards inside form */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-500 block">
                      مجموع البيع (الكمية × السعر)
                    </span>
                    <span className="text-base font-bold font-mono text-stone-900">
                      {formatCurrency(totalAmount, currencySymbol)}
                    </span>
                  </div>

                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-700 block">
                      حسم أجار العمال
                    </span>
                    <span className="text-base font-bold font-mono text-amber-800">
                      - {formatCurrency(formData.laborCost, currencySymbol)}
                    </span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-700 block">
                      صافي ربح البيع
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-800">
                      {formatCurrency(netAmount, currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={paymentStatusId} className="block text-xs font-semibold text-stone-700 mb-1">
                    حالة الدفع
                  </label>
                  <select
                    id={paymentStatusId}
                    value={formData.paymentStatus}
                    onChange={(e) => {
                      const st = e.target.value as PaymentStatus;
                      setFormData({ 
                        ...formData, 
                        paymentStatus: st,
                        paidAmount: st === 'مدفوع بالكامل' ? totalAmount : st === 'آجل (غير مدفوع)' ? 0 : (formData.paidAmount > 0 && formData.paidAmount < totalAmount ? formData.paidAmount : Number((totalAmount / 2).toFixed(2)))
                      });
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-800"
                  >
                    <option value="مدفوع بالكامل">مدفوع بالكامل</option>
                    <option value="دفعة جزئية">دفعة جزئية</option>
                    <option value="آجل (غير مدفوع)">آجل (غير مدفوع)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={paidAmountId} className="block text-xs font-semibold text-stone-700 mb-1">
                    المبلغ المدفوع حالياً ({currencySymbol})
                  </label>
                  <input
                    id={paidAmountId}
                    type="number"
                    min="0"
                    max={totalAmount}
                    step="any"
                    value={formData.paidAmount || ''}
                    onChange={(e) => { const paidAmount = parseFloat(e.target.value) || 0; const paymentStatus: PaymentStatus = paidAmount <= 0 ? 'آجل (غير مدفوع)' : paidAmount >= totalAmount ? 'مدفوع بالكامل' : 'دفعة جزئية'; setFormData({ ...formData, paidAmount, paymentStatus }); }}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {remainingAmount > 0 && (
                    <span className="text-[11px] text-rose-600 block mt-0.5 font-mono">
                      متبقي آجل: {formatCurrency(remainingAmount, currencySymbol)}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor={paymentMethodId} className="block text-xs font-semibold text-stone-700 mb-1">
                    طريقة الدفع
                  </label>
                  <select
                    id={paymentMethodId}
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-800"
                  >
                    <option value="نقدي (كاش)">نقدي (كاش)</option>
                    <option value="حوالة بنكية">حوالة بنكية</option>
                    <option value="شيك">شيك</option>
                    <option value="دفع آجل">دفع آجل</option>
                  </select>
                </div>
              </div>

              {/* Worker & Crew details */}
              <div>
                <label htmlFor={workerNotesId} className="block text-xs font-semibold text-stone-700 mb-1">
                  تفاصيل ورشة العمال والقطاف (اختياري)
                </label>
                <input
                  id={workerNotesId}
                  type="text"
                  placeholder="مثال: ورشة أبو جهاد (8 عمال) - قطاف الصباح الباكر"
                  value={formData.workerNotes}
                  onChange={(e) => setFormData({ ...formData, workerNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Extra notes */}
              <div>
                <label htmlFor={notesId} className="block text-xs font-semibold text-stone-700 mb-1">
                  ملاحظات إضافية (جودة الورق، التوصيل، التغليف...)
                </label>
                <textarea
                  id={notesId}
                  rows={2}
                  placeholder="أي ملاحظات خاصة بهذه الشحنة أو التاجر..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSale(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingSale ? 'حفظ التعديلات' : 'تسجيل البيع الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
