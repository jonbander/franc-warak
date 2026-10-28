import React from 'react';
import { X, Printer, Sprout, CheckCircle2 } from 'lucide-react';
import { SaleRecord, SeasonSettings } from '../types';
import { formatCurrency, formatNumber, formatDateArabic } from '../utils/formatters';
import { ModalPortal } from './ModalPortal';

interface SaleReceiptModalProps {
  sale: SaleRecord | null;
  settings: SeasonSettings;
  onClose: () => void;
}

export const SaleReceiptModal: React.FC<SaleReceiptModalProps> = ({
  sale,
  settings,
  onClose,
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const remaining = Number((sale.totalAmount - sale.paidAmount).toFixed(2));

  return (
    <ModalPortal>
    <div className="fw-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="معاينة سند تسليم أو فاتورة بيع" className="fw-modal-surface bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full my-6 overflow-hidden">
        {/* Modal Controls (Not printed) */}
        <div className="p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between no-print">
          <span className="text-xs font-semibold text-stone-700">معاينة سند تسليم / فاتورة بيع</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors print-allow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة السند</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 space-y-6 text-stone-900 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-800">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-lg">{settings.farmName}</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">{settings.seasonName}</p>
              {settings.farmerName.trim() && (
                <p className="text-xs text-stone-500">المزارع المسؤول: {settings.farmerName}</p>
              )}
            </div>

            <div className="text-left font-mono">
              <span className="text-xs text-stone-400 block">رقم السند:</span>
              <span className="text-sm font-bold text-stone-800">#{sale.id.toUpperCase()}</span>
              <span className="text-xs text-stone-500 block mt-1">التاريخ: {formatDateArabic(sale.date)}</span>
            </div>
          </div>

          {/* Merchant Info */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-xs space-y-1">
            <span className="text-stone-400 block text-[11px]">الجهة المشترية / التاجر:</span>
            <div className="text-sm font-bold text-stone-900">{sale.buyerName}</div>
            {sale.buyerPhone && (
              <div className="text-stone-600 font-mono">رقم التواصل: {sale.buyerPhone}</div>
            )}
          </div>

          {/* Details Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">البيان / الصنف</th>
                  <th className="py-2.5 px-3">الكمية</th>
                  <th className="py-2.5 px-3">السعر الإفرادي</th>
                  <th className="py-2.5 px-3 text-left">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-semibold block">{sale.grapeVariety}</span>
                    <span className="text-[11px] text-stone-500">مقطوف طازج - قطفة مختارة</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    {formatNumber(sale.quantity)} {sale.unit}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {formatCurrency(sale.unitPrice, settings.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-900 text-left">
                    {formatCurrency(sale.totalAmount, settings.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-stone-700">
              <span>مجموع قيمة البيع:</span>
              <span className="font-mono font-bold text-sm text-stone-900">
                {formatCurrency(sale.totalAmount, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center text-amber-800">
              <span>أجور عمال القطاف والورشة (محسومة للعمال):</span>
              <span className="font-mono font-medium">
                - {formatCurrency(sale.laborCost, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-800 pt-2 border-t border-stone-200">
              <span className="font-bold">صافي المردود بعد أجور العمال:</span>
              <span className="font-mono font-extrabold text-sm text-emerald-800">
                {formatCurrency(sale.netAmount, settings.currency)}
              </span>
            </div>

            <div className="flex justify-between items-center text-stone-600 pt-2 border-t border-dashed border-stone-200">
              <span>حالة السداد:</span>
              <span className="font-semibold">{sale.paymentStatus} ({sale.paymentMethod})</span>
            </div>

            <div className="flex justify-between items-center text-stone-600">
              <span>المبلغ المدفوع:</span>
              <span className="font-mono text-stone-900 font-bold">
                {formatCurrency(sale.paidAmount, settings.currency)}
              </span>
            </div>

            {remaining > 0 && (
              <div className="flex justify-between items-center text-rose-700 font-bold">
                <span>المتبقي آجل بذمة التاجر:</span>
                <span className="font-mono">
                  {formatCurrency(remaining, settings.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Notes and crew */}
          {(sale.workerNotes || sale.notes) && (
            <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200">
              {sale.workerNotes && (
                <div><strong>ورشة القطاف:</strong> {sale.workerNotes}</div>
              )}
              {sale.notes && (
                <div><strong>ملاحظات:</strong> {sale.notes}</div>
              )}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-stone-500 border-t border-stone-200">
            <div>
              <p className="mb-8 font-medium">توقيع المستلم / المشتري</p>
              <div className="border-t border-dashed border-stone-300 w-32 mx-auto" />
            </div>
            <div>
              <p className="mb-8 font-medium">توقيع المزارع / إدارة الكرم</p>
              <div className="border-t border-dashed border-stone-300 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};
