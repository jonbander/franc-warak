import React, { useState } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {/* Discreet Mobile Installation Bar */}
      <div className="bg-emerald-900 text-white px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-xs border-b border-emerald-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-emerald-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <span className="truncate text-emerald-100">
            تثبيت التطبيق على هاتفك للاستخدام السريع في البستان بدون إنترنت
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="px-2.5 py-1 bg-white text-emerald-950 font-bold rounded-md hover:bg-emerald-50 text-[11px] transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>تثبيت</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-2.5 py-1 bg-white text-emerald-950 font-bold rounded-md hover:bg-emerald-50 text-[11px] transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>تثبيت على آيفون</span>
            </button>
          )}

          {!isInstallable && !isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-2 py-0.5 bg-emerald-800 text-white rounded text-[10px] hover:bg-emerald-700 transition-colors"
            >
              طريقة التثبيت
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-emerald-300 hover:text-white rounded"
            title="إخفاء"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Dialog for iOS & Mobile Browsers */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>تثبيت التطبيق على هاتفك</span>
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="flex items-start gap-2.5 p-2 bg-stone-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  في متصفح سفاري (أو كروم)، اضغط على زر <strong>مشاركة (Share)</strong>
                  <div className="inline-flex items-center gap-1 mx-1 text-emerald-700 font-bold">
                    <Share2 className="w-3 h-3 inline" />
                  </div>
                  في أسفل الشاشة.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-stone-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية"</strong>
                  <div className="inline-flex items-center gap-1 mx-1 text-emerald-700 font-bold">
                    <PlusSquare className="w-3 h-3 inline" />
                    (Add to Home Screen)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 bg-stone-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  اضغط <strong>"إضافة" (Add)</strong>، وسيظهر تطبيق ورق العنب بأيقونة مخصصة على شاشة هاتفك مثل تطبيقات App Store و Google Play تماماً.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
