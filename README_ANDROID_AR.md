# بناء تطبيق Android / APK

أصبح المشروع مجهزًا بـ Capacitor. واجهة React/Vite تُبنى كأصول محلية داخل التطبيق، وتظل سجلات الموسم على الجهاز في `localStorage`.

الإصدار الحالي: **1.0.7** (`versionCode` 8). الملف الناتج من `assembleDebug` تجريبي للتثبيت المباشر، وليس APK موقّعاً للنشر في متجر Play.

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
