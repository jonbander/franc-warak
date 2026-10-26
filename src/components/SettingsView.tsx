import React from 'react';
import { Archive, Download, RotateCcw, Save, Trash2, Upload, UserRound } from 'lucide-react';
import { SeasonArchive, SeasonSettings } from '../types';

interface SettingsViewProps {
  settings: SeasonSettings;
  archives: SeasonArchive[];
  onFarmerNameChange: (name: string) => void;
  onTargetHarvestChange: (targetKg: number) => void;
  onImportBackup: (file: File) => void;
  onArchiveCurrentSeason: () => void;
  onRestoreArchive: (archive: SeasonArchive) => void;
  onDeleteArchive: (archive: SeasonArchive) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  archives,
  onFarmerNameChange,
  onTargetHarvestChange,
  onImportBackup,
  onArchiveCurrentSeason,
  onRestoreArchive,
  onDeleteArchive,
}) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900">إدارة المزارع</h2>
      <p className="text-xs sm:text-sm text-stone-500 mt-1">بيانات المزارع وهدف القطف والنسخ الاحتياطية للمواسم.</p>
    </div>

    <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-emerald-800">
        <UserRound className="w-5 h-5" />
        <h3 className="font-bold">بيانات المزارع</h3>
      </div>
      <div>
        <label htmlFor="farmer-name-setting" className="block text-sm font-semibold text-stone-700 mb-1.5">
          اسم المزارع / المسؤول
        </label>
        <input
          id="farmer-name-setting"
          type="text"
          value={settings.farmerName || ''}
          onChange={(event) => onFarmerNameChange(event.target.value)}
          placeholder="اكتب اسم المزارع"
          autoComplete="name"
          className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          يُحفظ الاسم تلقائياً على هذا الجهاز، ويظهر على الفواتير والتقارير وفي الدردشة العامة.
        </p>
      </div>
      <div>
        <label htmlFor="farmer-target-setting" className="block text-sm font-semibold text-stone-700 mb-1.5">
          الهدف الذي أطمح للوصول إليه (كغ)
        </label>
        <input
          id="farmer-target-setting"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={settings.targetHarvestKg || ''}
          onChange={(event) => {
            const value = event.target.value;
            const target = value === '' ? 0 : Number(value);
            onTargetHarvestChange(Number.isFinite(target) && target >= 0 ? target : 0);
          }}
          placeholder="مثال: 5000"
          className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          أدخل الكمية التي تطمح لقطافها بالكيلوغرام؛ ستظهر نسبة الإنجاز والكمية المتبقية في الصفحة الرئيسية.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
        <Save className="w-4 h-4 shrink-0" />
        <span>يتم حفظ التغيير فوراً.</span>
      </div>
    </section>

    <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-emerald-800">
        <Archive className="w-5 h-5" />
        <h3 className="font-bold">النسخ الاحتياطية وأرشيف المواسم</h3>
      </div>
      <p className="text-xs leading-relaxed text-stone-600">
        النسخة الاحتياطية ملف يمكنك نقله إلى هاتف آخر أو استيراده بعد إعادة تثبيت التطبيق. أرشيف المواسم محفوظ على هذا الجهاز؛ نزّل نسخة JSON للاحتفاظ بها خارج الجهاز.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50">
          <Upload className="h-4 w-4" /> استيراد نسخة JSON
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportBackup(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
        <button
          type="button"
          onClick={onArchiveCurrentSeason}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          <Archive className="h-4 w-4" /> أرشفة الموسم وبدء موسم جديد
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-amber-800">
        قبل الأرشفة سيطلب التطبيق تأكيدك. تُحفظ بيانات الموسم في الأرشيف ثم تُصفّر سجلات الموسم النشط. الأرشيف المحلي قد يُحذف مع إزالة التطبيق؛ احتفظ بملف JSON خارجي.
      </p>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-stone-800">أرشيف المواسم ({archives.length})</h4>
        {archives.length === 0 && <p className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500">لا توجد مواسم مؤرشفة على هذا الجهاز.</p>}
        {archives.map((archive) => (
          <article key={archive.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h5 className="text-sm font-bold text-stone-900">{archive.seasonName}</h5>
                <p className="mt-1 text-[11px] text-stone-500">
                  أُرشف في {new Date(archive.archivedAt).toLocaleDateString('ar')} · {archive.sales.length} مبيعات · {archive.expenses.length} مصاريف · {archive.workers.length} سجلات أجور
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onRestoreArchive(archive)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                  <RotateCcw className="h-3.5 w-3.5" /> استعادة
                </button>
                <button type="button" onClick={() => onDeleteArchive(archive)} aria-label={`حذف أرشيف ${archive.seasonName}`} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-800">
                  <Trash2 className="h-3.5 w-3.5" /> حذف
                </button>
                <button type="button" onClick={() => {
                  const backup = { format: 'franc-warak-season-backup', formatVersion: 1, settings: archive.settings, sales: archive.sales, expenses: archive.expenses, workers: archive.workers, exportedAt: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `نسخة_${archive.seasonName.replace(/[^\p{L}\p{N}-]+/gu, '_')}.json`;
                  link.click();
                  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                }} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700">
                  <Download className="h-3.5 w-3.5" /> تنزيل
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  </div>
);
