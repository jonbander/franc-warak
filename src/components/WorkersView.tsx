import React, { useState, useId } from 'react';
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Users, 
  X,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import { WorkerWageRecord, SaleRecord } from '../types';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/formatters';
import { ModalPortal } from './ModalPortal';

interface WorkersViewProps {
  workerWages: WorkerWageRecord[];
  sales: SaleRecord[];
  currencySymbol: string;
  onAddWorkerWage: (wage: Omit<WorkerWageRecord, 'id' | 'createdAt'>) => void;
  onUpdateWorkerWage: (wage: WorkerWageRecord) => void;
  onDeleteWorkerWage: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workerWages,
  sales,
  currencySymbol,
  onAddWorkerWage,
  onUpdateWorkerWage,
  onDeleteWorkerWage,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const taskTypeId = useId();
  const dateId = useId();
  const totalWageId = useId();
  const paidWageId = useId();
  const notesId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingWage, setEditingWage] = useState<WorkerWageRecord | null>(null);

  // Form
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    taskType: '',
    totalWage: 0,
    paidWage: 0,
    notes: '',
  });

  // The form records the agreed total for a task directly; legacy unit fields remain in storage for old records.
  const calculatedTotalWage = Number(formData.totalWage.toFixed(2));
  const remainingWage = Number(Math.max(0, calculatedTotalWage - formData.paidWage).toFixed(2));

  const handleOpenAdd = () => {
    setEditingWage(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      taskType: '',
      totalWage: 0,
      paidWage: 0,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (wage: WorkerWageRecord) => {
    setEditingWage(wage);
    setFormData({
      date: wage.date,
      taskType: wage.taskType || wage.workerOrLeaderName,
      totalWage: wage.totalWage,
      paidWage: wage.paidWage,
      notes: wage.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskType.trim()) {
      alert('يرجى إدخال نوع المهمة');
      return;
    }
    if (!Number.isFinite(formData.totalWage) || formData.totalWage <= 0) {
      alert('يرجى إدخال مبلغ صحيح لأجور العمال');
      return;
    }
    if (!Number.isFinite(formData.paidWage) || formData.paidWage < 0 || formData.paidWage > calculatedTotalWage) {
      alert('يجب أن يكون الأجر المدفوع بين صفر وإجمالي الأجر المستحق');
      return;
    }

    const payload = {
      date: formData.date,
      taskType: formData.taskType.trim(),
      workerOrLeaderName: formData.taskType.trim(),
      workType: 'أجر مقطوع للورشة' as const,
      workerCount: 1,
      unitsOrHours: 1,
      ratePerUnit: calculatedTotalWage,
      totalWage: calculatedTotalWage,
      paidWage: Number(formData.paidWage),
      remainingWage,
      relatedSaleId: editingWage?.relatedSaleId,
      notes: formData.notes.trim(),
    };

    if (editingWage) {
      onUpdateWorkerWage({
        ...payload,
        id: editingWage.id,
        createdAt: editingWage.createdAt,
      });
    } else {
      onAddWorkerWage(payload);
    }

    setIsAddModalOpen(false);
    setEditingWage(null);
  };

  // Filter
  const filteredWages = workerWages.filter((w) => {
    const matchesSearch = 
      (w.taskType || w.workerOrLeaderName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.notes && w.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // Aggregates
  const totalWagesSum = workerWages.reduce((acc, curr) => acc + curr.totalWage, 0);
  const totalPaidSum = workerWages.reduce((acc, curr) => acc + curr.paidWage, 0);
  const totalRemainingSum = workerWages.reduce((acc, curr) => acc + curr.remainingWage, 0);
  
  // Total labor from sales
  const totalLaborFromSales = sales.reduce((acc, curr) => acc + curr.laborCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            سجل أجور عمال القطاف والورشات
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            تسجيل نوع المهمة وإجمالي أجور العمال ومتابعة المدفوع والمتبقي
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة ورشة</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">إجمالي الأجور المسجلة</span>
          <div className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {formatCurrency(totalWagesSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">المبلغ المدفوع للعمال</span>
          <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
            {formatCurrency(totalPaidSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">المتبقي للعمال (ديون ورش)</span>
          <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {formatCurrency(totalRemainingSum, currencySymbol)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">أجور العمال المربوطة بالمبيعات</span>
          <div className="text-xl font-bold font-mono text-stone-800 tabular-nums">
            {formatCurrency(totalLaborFromSales, currencySymbol)}
          </div>
        </div>
      </div>

      {/* Tip Box */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <Users className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>تسجيل أجور الورشة:</strong> اكتب وصف المهمة مثل تجهيز الأرض أو تجهيز القصب أو أجور الرش، ثم أدخل إجمالي أجور العمال والمبلغ المدفوع. يحسب التطبيق المتبقي تلقائياً.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم العامل، رئيس الورشة، أو التفاصيل..."
            className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
          />
        </div>

        <span className="text-xs text-stone-500">عدد السجلات: {filteredWages.length}</span>
      </div>

      {/* Mobile Wages Cards (Visible on mobile screens) */}
      <div className="block md:hidden space-y-3">
        {filteredWages.map((wage) => (
          <div
            key={wage.id}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="font-bold text-stone-900 text-sm">{wage.taskType || wage.workerOrLeaderName}</h3>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <span className="font-mono">{formatDateArabic(wage.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{wage.taskType ? 'أجور مهمة' : wage.workType}</span>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="font-mono font-bold text-base text-stone-900">
                  {formatCurrency(wage.totalWage, currencySymbol)}
                </span>
                <div className="text-[10px] mt-0.5 font-mono">
                  {wage.remainingWage > 0 ? (
                    <span className="text-amber-700 font-bold">باقي: {formatCurrency(wage.remainingWage, currencySymbol)}</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">خالص</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-stone-600">
                أجور العمال: {formatCurrency(wage.totalWage, currencySymbol)}
              </span>
              <span className="text-emerald-800 font-mono font-semibold">
                المدفوع: {formatCurrency(wage.paidWage, currencySymbol)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
              <span className="text-[11px] text-stone-500">
                {wage.taskType ? 'نوع المهمة' : `عدد العمال: ${wage.workerCount}`}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(wage)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف سجل أجر "${wage.workerOrLeaderName}"؟`)) {
                      onDeleteWorkerWage(wage.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-stone-100"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredWages.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-xs">
            لا توجد سجلات أجور تطابق البحث
          </div>
        )}
      </div>

      {/* Wages Table for Larger Screens */}
      <div className="hidden md:block bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">نوع المهمة / العامل</th>
                <th className="py-3 px-4 font-bold text-stone-900">إجمالي الأجر</th>
                <th className="py-3 px-4 text-emerald-800">المدفوع</th>
                <th className="py-3 px-4 text-amber-700">المتبقي</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredWages.map((wage) => (
                <tr key={wage.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">
                    {formatDateArabic(wage.date)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{wage.taskType || wage.workerOrLeaderName}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {formatCurrency(wage.totalWage, currencySymbol)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold whitespace-nowrap">
                    {formatCurrency(wage.paidWage, currencySymbol)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                    {wage.remainingWage > 0 ? (
                      <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatCurrency(wage.remainingWage, currencySymbol)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 inline-flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        خالص بالكامل
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(wage)}
                        title="تعديل"
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف سجل أجر "${wage.workerOrLeaderName}"؟`)) {
                            onDeleteWorkerWage(wage.id);
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
              ))}

              {filteredWages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">لا توجد سجلات أجور تطابق شروط البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-600">
          <span>سجلات الورش المعروضة: <strong className="text-stone-900 font-mono">{filteredWages.length}</strong></span>
          <span className="font-mono">
            إجمالي الأجور: <strong className="text-stone-900">{formatCurrency(filteredWages.reduce((a, c) => a + c.totalWage, 0), currencySymbol)}</strong>
          </span>
        </div>
      </div>

      {/* Add / Edit Worker Wage Modal as Bottom Sheet */}
      {isAddModalOpen && (
        <ModalPortal>
        <div className="fw-modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-label={editingWage ? 'تعديل أجور ورشة' : 'إضافة أجور ورشة'} className="fw-modal-surface bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto overscroll-contain">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto sm:hidden mt-3 mb-1" />

            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {editingWage ? 'تعديل أجور المهمة' : 'إضافة ورشة'}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  سجّل وصف المهمة ومبلغ أجور العمال مباشرة
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWage(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label htmlFor={taskTypeId} className="block text-xs font-semibold text-stone-700 mb-1">
                  نوع المهمة <span className="text-rose-600">*</span>
                </label>
                <input
                  id={taskTypeId}
                  type="text"
                  required
                  placeholder="تجهيز الارض، تجهيز القصب، اجور رش"
                  value={formData.taskType}
                  onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={dateId} className="block text-xs font-semibold text-stone-700 mb-1">
                    التاريخ <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor={totalWageId} className="block text-xs font-semibold text-stone-700 mb-1">
                    أجور العمال ({currencySymbol}) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={totalWageId}
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    placeholder="أدخل إجمالي الأجور"
                    value={formData.totalWage || ''}
                    onChange={(e) => {
                      const totalWage = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, totalWage, paidWage: Math.min(formData.paidWage, totalWage) });
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Wage summary banner inside modal */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-amber-800 block">إجمالي أجور العمال:</span>
                  <span className="text-base font-bold font-mono text-amber-950">
                    {formatCurrency(calculatedTotalWage, currencySymbol)}
                  </span>
                </div>

                <div className="text-left">
                  <label htmlFor={paidWageId} className="text-amber-800 block text-[11px] font-medium">
                    المدفوع:
                  </label>
                  <input
                    id={paidWageId}
                    type="number"
                    step="any"
                    min="0"
                    max={calculatedTotalWage}
                    value={formData.paidWage || ''}
                    onChange={(e) => setFormData({ ...formData, paidWage: parseFloat(e.target.value) || 0 })}
                    className="w-28 px-2 py-1 text-xs font-mono bg-white border border-amber-300 rounded-md focus:outline-none text-left"
                  />
                </div>
              </div>

              {remainingWage > 0 && (
                <div className="text-xs text-amber-900 bg-amber-100/60 p-2.5 rounded-lg flex items-center justify-between">
                  <span>المبلغ المتبقي دين للعمال:</span>
                  <strong className="font-mono">{formatCurrency(remainingWage, currencySymbol)}</strong>
                </div>
              )}

              <div>
                <label htmlFor={notesId} className="block text-xs font-semibold text-stone-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  id={notesId}
                  rows={2}
                  placeholder="ملاحظات حول الورشة أو ساعات العمل..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingWage(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingWage ? 'حفظ التعديلات' : 'تسجيل الأجر'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};
