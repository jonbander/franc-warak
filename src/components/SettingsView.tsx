import React from 'react';
import { Save, UserRound } from 'lucide-react';
import { SeasonSettings } from '../types';

interface SettingsViewProps {
  settings: SeasonSettings;
  onFarmerNameChange: (name: string) => void;
  onTargetHarvestChange: (targetKg: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onFarmerNameChange, onTargetHarvestChange }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900">إعدادات التطبيق</h2>
      <p className="text-xs sm:text-sm text-stone-500 mt-1">بيانات المزارع وهدف القطف الذي يظهر في الصفحة الرئيسية.</p>
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
          يُحفظ الاسم تلقائياً على هذا الجهاز، ويظهر على فواتير البيع وتقارير الموسم ولوحة الرئيسية. اتركه فارغاً لإخفائه.
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
          أدخل كمية القطف التي تطمح للوصول إليها بالكيلوغرام؛ ستظهر نسبة الإنجاز والكمية المتبقية في الصفحة الرئيسية. اتركه فارغاً إذا لم تحدد هدفاً.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
        <Save className="w-4 h-4 shrink-0" />
        <span>يتم حفظ التغيير فوراً.</span>
      </div>
    </section>
  </div>
);
