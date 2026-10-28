import React from 'react';
import { Info, Sprout, UserRound } from 'lucide-react';
import packageInfo from '../../package.json';

export const AboutView: React.FC = () => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900">حول التطبيق</h2>
      <p className="text-xs sm:text-sm text-stone-500 mt-1">معلومات الإصدار والجهة المطوّرة.</p>
    </div>

    <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
        <Sprout className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-stone-900">إدارة موسم ورق العنب الفرنسي</h3>
        <p className="text-sm text-stone-500 mt-1">الإصدار {packageInfo.version}</p>
      </div>
      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700">
        <UserRound className="w-4 h-4 text-emerald-700" />
        <span>تم تطوير هذا التطبيق من قبل <strong className="text-stone-900">أحمد</strong></span>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
        <Info className="w-3.5 h-3.5" />
        أداة لإدارة المبيعات والمصاريف وأجور العمال.
      </p>
    </section>
  </div>
);
