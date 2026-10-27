# بناء تطبيق Android / APK

أصبح المشروع مجهزًا بـ Capacitor. واجهة React/Vite تُبنى كأصول محلية داخل التطبيق، وتظل سجلات الموسم على الجهاز في `localStorage`.

الإصدار الحالي: **1.0.9** (`versionCode` 10). الملف الناتج من `assembleDebug` تجريبي للتثبيت المباشر، وليس APK موقّعاً للنشر في متجر Play.

يمكن استعادة النسق الفاتح السابق من `src/index.css.backup-light-theme-v1.0.8` عند الحاجة؛ ملف الثيم النشط هو `src/index.css`.

في Android تُكتب ملفات النسخ والتقارير في مساحة مؤقتة آمنة، ثم تظهر قائمة المشاركة لحفظها في «الملفات» أو إرسالها إلى وجهة أخرى. في المتصفح يُنزّل الملف مباشرة.

## متطلبات البناء المحلي

- Node.js 22 أو أحدث.
- Android Studio أو Android SDK مع Android API 36 وBuild Tools 36.
- JDK 21.

## بناء APK تجريبي

```bash
npm ci
npm run android:debug
```

يُنتج APK تجريبيًا في:

`android/app/build/outputs/apk/debug/app-debug.apk`

أو نفذ الخطوات يدويًا:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

على Windows استخدم `gradlew.bat assembleDebug` بدل `./gradlew`.

يمكن فتح مشروع Android في Android Studio عبر `npm run android:open`.

ملف `app-debug.apk` للاختبار والتثبيت المباشر فقط، وليس إصدار متجر Play. النشر التجاري يحتاج إعداد توقيع إصدار Release ومفتاح خاص يحفظ خارج GitHub.

## البناء على GitHub

الـ workflow في `.github/workflows/android-apk.yml` يبني APK عند كل push أو pull request على `main` ويرفعه كـ artifact باسم `franc-warak-debug-apk` لمدة 14 يومًا. لا ينشئ إصدارًا عامًا ولا يوقّع APK للنشر.
