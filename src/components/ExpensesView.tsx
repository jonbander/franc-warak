import React, { useState, useId } from 'react';
import { 
  PlusCircle, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Receipt, 
  X,
  Package,
  Droplets,
  Leaf,
  Truck,
  Coffee,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory } from '../types';
import { formatCurrency, formatDateArabic } from '../utils/formatters';
import { exportExpensesToCSV } from '../utils/storage';

interface ExpensesViewProps {
  expenses: ExpenseRecord[];
  currencySymbol: string;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  'مستلزمات وأقفاص القطاف': <Package className="w-4 h-4 text-amber-700" />,
  'محروقات وري ومياه': <Droplets className="w-4 h-4 text-blue-700" />,
  'أسمدة ومبيدات وعناية': <Leaf className="w-4 h-4 text-emerald-700" />,
  'أجور نقل وشحن وتوصيل': <Truck className="w-4 h-4 text-indigo-700" />,
  'طعام وضيافة الورشة': <Coffee className="w-4 h-4 text-orange-700" />,
  'صيانة شبكات وأدوات': <Wrench className="w-4 h-4 text-stone-700" />,
  'مصاريف أخرى ونثريات': <MoreHorizontal className="w-4 h-4 text-purple-700" />,
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  currencySymbol,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const titleId = useId();
  const categoryId = useId();
  const amountId = useId();
  const dateId = useId();
  const paidToId = useId();
  const paymentMethodId = useId();
  const notesId = useId();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'مستلزمات وأقفاص القطاف' as ExpenseCategory,
    amount: 50,
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    paymentMethod: 'نقدي (كاش)' as 'نقدي (كاش)' | 'حوالة' | 'آجل',
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'مستلزمات وأقفاص القطاف',
      amount: 50,
      date: new Date().toISOString().split('T')[0],
      paidTo: '',
      paymentMethod: 'نقدي (كاش)',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      paidTo: exp.paidTo,
      paymentMethod: exp.paymentMethod,
      notes: exp.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('يرجى إدخال بيان المصروف');
      return;
    }
    if (formData.amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paidTo: formData.paidTo.trim() || 'غير محدد',
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
    };

    if (editingExpense) {
      onUpdateExpense({
        ...payload,
        id: editingExpense.id,
        createdAt: editingExpense.createdAt,
      });
    } else {
      onAddExpense(payload);
    }

    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalExpensesSum = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            صفحة مصاريف الموسم
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            حصر وتوثيق كافة المصاريف التشغيلية لبستان ورق العنب الفرنسي (أقفاص، محروقات، ري، أسمدة، ونقل)
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportExpensesToCSV(expenses, currencySymbol)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Category Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs sm:col-span-1 col-span-2">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs">إجمالي كل المصاريف</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">
            {formatCurrency(totalExpensesSum, currencySymbol)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {expenses.length} بنود مصروف مسجلة
          </span>
        </div>

        {Object.entries(categoryTotals).slice(0, 3).map(([cat, amount]) => (
          <div key={cat} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs truncate" title={cat}>{cat}</span>
              {CATEGORY_ICONS[cat as ExpenseCategory] || <Receipt className="w-4 h-4" />}
            </div>
            <div className="text-lg font-bold font-mono text-stone-900 tabular-nums">
              {formatCurrency(amount, currencySymbol)}
            </div>
            <span className="text-[11px] text-stone-400 mt-1 block">
              {totalExpensesSum > 0 ? `${((amount / totalExpensesSum) * 100).toFixed(0)}% من المصاريف` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في بيان المصروف، الجهة المدفوع لها، أو الملاحظات..."
            className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            aria-label="تصفية حسب تصنيف المصروف"
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white text-stone-700 cursor-pointer"
          >
            <option value="all">كل التصنيفات ({expenses.length})</option>
            <option value="مستلزمات وأقفاص القطاف">مستلزمات وأقفاص القطاف</option>
            <option value="محروقات وري ومياه">محروقات وري ومياه</option>
            <option value="أسمدة ومبيدات وعناية">أسمدة ومبيدات وعناية</option>
            <option value="أجور نقل وشحن وتوصيل">أجور نقل وشحن وتوصيل</option>
            <option value="طعام وضيافة الورشة">طعام وضيافة الورشة</option>
            <option value="صيانة شبكات وأدوات">صيانة شبكات وأدوات</option>
            <option value="مصاريف أخرى ونثريات">مصاريف أخرى ونثريات</option>
          </select>
        </div>
      </div>

      {/* Mobile Expenses Cards (Visible on mobile screens) */}
      <div className="block md:hidden space-y-3">
        {filteredExpenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="font-bold text-stone-900 text-sm">{exp.title}</h3>
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                  <span className="font-mono">{formatDateArabic(exp.date)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-700">{exp.paidTo}</span>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="font-mono font-bold text-base text-rose-700">
                  {formatCurrency(exp.amount, currencySymbol)}
                </span>
                <span className="block text-[10px] text-stone-400">{exp.paymentMethod}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <div className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                {CATEGORY_ICONS[exp.category]}
                <span>{exp.category}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف مصروف "${exp.title}"؟`)) {
                      onDeleteExpense(exp.id);
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

        {filteredExpenses.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-400 text-xs">
            لا توجد مصاريف تطابق البحث
          </div>
        )}
      </div>

      {/* Expenses Table for Larger Screens */}
      <div className="hidden md:block bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">بيان المصروف</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">المدفوع له</th>
                <th className="py-3 px-4">طريقة الدفع</th>
                <th className="py-3 px-4">ملاحظات</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 font-mono text-stone-500 whitespace-nowrap">
                    {formatDateArabic(exp.date)}
                  </td>

                  {/* Title */}
                  <td className="py-3.5 px-4 font-medium text-stone-900 max-w-xs">
                    {exp.title}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-xs text-stone-700">
                      {CATEGORY_ICONS[exp.category]}
                      <span>{exp.category}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-700 whitespace-nowrap">
                    {formatCurrency(exp.amount, currencySymbol)}
                  </td>

                  {/* Paid To */}
                  <td className="py-3.5 px-4 text-stone-700 whitespace-nowrap">
                    {exp.paidTo}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                    {exp.paymentMethod}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 text-xs text-stone-500 max-w-xs truncate">
                    {exp.notes || '-'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        title="تعديل المصروف"
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف مصروف "${exp.title}"؟`)) {
                            onDeleteExpense(exp.id);
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

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm">لا توجد مصاريف تطابق شروط البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-600">
          <span>
            عدد المصاريف المعروضة: <strong className="text-stone-900 font-mono">{filteredExpenses.length}</strong>
          </span>
          <span className="font-mono">
            مجموع المعروض: <strong className="text-rose-700">{formatCurrency(filteredExpenses.reduce((a, c) => a + c.amount, 0), currencySymbol)}</strong>
          </span>
        </div>
      </div>

      {/* Add / Edit Expense Modal as Bottom Sheet */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
            {/* Grab handle for touch screens */}
            <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto sm:hidden mt-3 mb-1" />

            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  {editingExpense ? 'تعديل مصروف' : 'تسجيل مصروف جديد للبستان'}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  أقفاص، محروقات، ري، أسمدة، نقل، أو طعام وضيافة
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label htmlFor={titleId} className="block text-xs font-semibold text-stone-700 mb-1">
                  بيان المصروف <span className="text-rose-600">*</span>
                </label>
                <input
                  id={titleId}
                  type="text"
                  required
                  placeholder="مثال: شراء صناديق خشبية أو مازوت لمضخة الري"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={categoryId} className="block text-xs font-semibold text-stone-700 mb-1">
                    تصنيف المصروف <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id={categoryId}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white text-stone-800"
                  >
                    <option value="مستلزمات وأقفاص القطاف">مستلزمات وأقفاص القطاف</option>
                    <option value="محروقات وري ومياه">محروقات وري ومياه</option>
                    <option value="أسمدة ومبيدات وعناية">أسمدة ومبيدات وعناية</option>
                    <option value="أجور نقل وشحن وتوصيل">أجور نقل وشحن وتوصيل</option>
                    <option value="طعام وضيافة الورشة">طعام وضيافة الورشة</option>
                    <option value="صيانة شبكات وأدوات">صيانة شبكات وأدوات</option>
                    <option value="مصاريف أخرى ونثريات">مصاريف أخرى ونثريات</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={amountId} className="block text-xs font-semibold text-stone-700 mb-1">
                    المبلغ ({currencySymbol}) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={amountId}
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={dateId} className="block text-xs font-semibold text-stone-700 mb-1">
                    تاريخ المصروف <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor={paidToId} className="block text-xs font-semibold text-stone-700 mb-1">
                    المدفوع له (المتجر / السائق / الفني)
                  </label>
                  <input
                    id={paidToId}
                    type="text"
                    placeholder="مثال: محطة الوقود / معمل البلاستيك"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={paymentMethodId} className="block text-xs font-semibold text-stone-700 mb-1">
                  طريقة الدفع
                </label>
                <select
                  id={paymentMethodId}
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'نقدي (كاش)' | 'حوالة' | 'آجل' })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white text-stone-800"
                >
                  <option value="نقدي (كاش)">نقدي (كاش)</option>
                  <option value="حوالة">حوالة</option>
                  <option value="آجل">آجل</option>
                </select>
              </div>

              <div>
                <label htmlFor={notesId} className="block text-xs font-semibold text-stone-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  id={notesId}
                  rows={2}
                  placeholder="أي تفاصيل حول هذا المصروف..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingExpense ? 'حفظ التعديلات' : 'تسجيل المصروف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
