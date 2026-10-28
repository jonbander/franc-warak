<?php
/**
 * Plugin Name: Franc Warak Announcement Admin
 * Description: Firebase-secured announcement and public chat admin page shortcode for Franc Warak.
 * Version: 1.1.0
 * Author: Ahmed
 */

if (!defined('ABSPATH')) { exit; }

add_shortcode('franc_warak_announcement_admin', function () {
    $uid = 'nLQ00ZiJqnP7unDvPeAiDbtBsuX2';
    $config = [
        'apiKey' => 'AIzaSyBwOCy24qLlkCdnWhHBu722MrVM_v7e_RE',
        'authDomain' => 'first22-7464f.firebaseapp.com',
        'projectId' => 'first22-7464f',
        'appId' => '1:1017587333323:web:e503a882b446f3450a834e',
        'messagingSenderId' => '1017587333323',
        'storageBucket' => 'first22-7464f.firebasestorage.app',
        'databaseURL' => 'https://first22-7464f-default-rtdb.firebaseio.com',
    ];
    $config_json = wp_json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $uid_json = wp_json_encode($uid, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

    ob_start(); ?>
    <div class="fw-admin" dir="rtl" lang="ar">
      <style>
        .fw-admin{--fw-green:#14532d;--fw-ink:#1c1917;--fw-muted:#57534e;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--fw-ink);max-width:720px;margin:28px auto;padding:0 14px;line-height:1.7}
        .fw-admin *{box-sizing:border-box}.fw-admin .fw-card{background:#fff;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 10px 30px #0000000d}
        .fw-admin h1{margin:0 0 8px;font-size:1.55rem}.fw-admin p{color:var(--fw-muted)}.fw-admin label{display:block;font-weight:700;margin:16px 0 6px}
        .fw-admin input[type=email],.fw-admin input[type=password],.fw-admin textarea{width:100%;padding:12px;border:1px solid #d6d3d1;border-radius:10px;font:inherit;background:#fff}
        .fw-admin textarea{min-height:130px;resize:vertical}.fw-admin .fw-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.fw-admin .fw-inline{display:flex;align-items:center;gap:9px}.fw-admin .fw-inline label{margin:0}.fw-admin .fw-check{width:18px;height:18px}
        .fw-admin input[type=color]{width:56px;height:42px;padding:3px;border:1px solid #d6d3d1;border-radius:8px;background:white;cursor:pointer}.fw-admin button{border:0;border-radius:10px;padding:11px 17px;font:inherit;font-weight:750;cursor:pointer}
        .fw-admin .fw-primary{background:#14532d;color:#fff}.fw-admin .fw-secondary{background:#f5f5f4;color:#292524}.fw-admin .fw-danger{color:#991b1b}.fw-admin .fw-status{padding:10px 12px;border-radius:10px;background:#f5f5f4;white-space:pre-wrap;min-height:44px}.fw-admin .fw-error{color:#b91c1c}.fw-admin .fw-hidden{display:none!important}
        .fw-admin .fw-preview{margin-top:18px;padding:12px 14px;border:1px solid #fcd34d;border-radius:12px;background:#fffbeb;overflow:hidden;color:#451a03}.fw-admin .fw-preview-text{display:block;white-space:pre-wrap;overflow-wrap:anywhere}.fw-admin .fw-preview.is-scroll .fw-preview-text{direction:rtl;white-space:nowrap;overflow-wrap:normal;animation:fw-admin-ltr 12s linear infinite}@keyframes fw-admin-ltr{from{transform:translateX(calc(-100% - 100vw))}to{transform:translateX(calc(100vw + 100%))}}
        .fw-admin .fw-divider{border:0;border-top:1px solid #e7e5e4;margin:26px 0}.fw-admin .fw-admin-section{padding:16px 0 4px}.fw-admin .fw-danger-button{background:#991b1b;color:#fff}.fw-admin .fw-switch-row{display:flex;gap:18px;flex-wrap:wrap;margin:14px 0}.fw-admin .fw-switch-row label{display:flex;align-items:center;gap:8px;margin:0}.fw-admin .fw-notice-text{min-height:90px}
        @media(prefers-reduced-motion:reduce){.fw-admin .fw-preview.is-scroll .fw-preview-text{animation:none;white-space:normal;transform:none}}
      </style>
      <div class="fw-card">
        <h1>إدارة إعلان التطبيق</h1>
        <p>سجّل الدخول بحساب الإدارة. لا تشارك كلمة المرور؛ الكتابة في Firebase مقيدة أيضاً بقواعد قاعدة البيانات إلى UID المدير.</p>
        <section class="fw-login">
          <label>البريد الإلكتروني</label><input class="fw-email" type="email" autocomplete="username" required>
          <label>كلمة المرور</label><input class="fw-password" type="password" autocomplete="current-password" required>
          <div class="fw-row" style="margin-top:16px"><button class="fw-primary fw-login-button" type="button">تسجيل الدخول</button></div>
        </section>
        <section class="fw-editor fw-hidden">
          <label>نص الإعلان (حتى 1000 حرف)</label><textarea class="fw-text" maxlength="1000" placeholder="اكتب الإعلان هنا..."></textarea>
          <div class="fw-row">
            <div><label for="fw-color">لون الخط</label><input id="fw-color" class="fw-color" type="color" value="#451a03"></div>
            <label class="fw-inline" style="margin-top:38px"><input class="fw-scroll fw-check" type="checkbox"><span>تمرير النص من اليسار إلى اليمين</span></label>
            <label class="fw-inline" style="margin-top:38px"><input class="fw-active fw-check" type="checkbox"><span>إظهار الإعلان في التطبيق</span></label>
          </div>
          <div class="fw-preview"><span class="fw-preview-text">معاينة الإعلان</span></div>
          <div class="fw-row" style="margin-top:18px">
            <button class="fw-primary fw-save" type="button">حفظ ونشر</button>
            <button class="fw-secondary fw-hide-ad" type="button">إخفاء الإعلان</button>
          </div>

          <hr class="fw-divider">
          <section class="fw-admin-section" aria-labelledby="fw-chat-admin-title">
            <h2 id="fw-chat-admin-title">إدارة غرفة الدردشة</h2>
            <p>تُطبّق حالة الغرفة على الإرسال من خلال قواعد Firebase، ويمكن للمستخدمين مواصلة قراءة الرسائل عند الإيقاف.</p>
            <div class="fw-switch-row">
              <label><input class="fw-chat-enabled" type="checkbox" checked><span>السماح بالدردشة</span></label>
              <label><input class="fw-chat-readonly" type="checkbox"><span>وضع القراءة فقط</span></label>
            </div>
            <button class="fw-primary fw-save-chat" type="button">حفظ حالة الدردشة</button>

            <label for="fw-chat-notice">تنبيه يظهر أعلى غرفة الدردشة (حتى 500 حرف)</label>
            <textarea id="fw-chat-notice" class="fw-chat-notice" maxlength="500" placeholder="اكتب التنبيه الإداري…"></textarea>
            <div class="fw-switch-row">
              <label><input class="fw-notice-active" type="checkbox"><span>إظهار التنبيه</span></label>
            </div>
            <div class="fw-row">
              <button class="fw-primary fw-save-chat-notice" type="button">حفظ التنبيه</button>
              <button class="fw-danger-button fw-clear-chat" type="button">مسح سجل الدردشة</button>
            </div>
          </section>
          <div class="fw-row" style="margin-top:22px"><button class="fw-secondary fw-logout" type="button">تسجيل الخروج</button></div>
        </section>
        <p class="fw-status" role="status" aria-live="polite">جارٍ الاتصال...</p>
      </div>
      <script type="module">
      (() => {
        const root = document.currentScript?.previousElementSibling?.previousElementSibling;
        // WordPress may move inline module scripts; use the nearest wrapper by a unique marker.
        const host = document.querySelectorAll('.fw-admin');
        const panel = host[host.length - 1];
        if (!panel) return;
        const firebaseConfig = <?php echo $config_json; ?>;
        const ADMIN_UID = <?php echo $uid_json; ?>;
        const statusEl = panel.querySelector('.fw-status');
        const setStatus = (text, isError = false) => { statusEl.textContent = text; statusEl.classList.toggle('fw-error', isError); };
        const textEl = panel.querySelector('.fw-text');
        const colorEl = panel.querySelector('.fw-color');
        const scrollEl = panel.querySelector('.fw-scroll');
        const activeEl = panel.querySelector('.fw-active');
        const preview = panel.querySelector('.fw-preview');
        const previewText = panel.querySelector('.fw-preview-text');
        const updatePreview = () => {
          previewText.textContent = textEl.value.trim() || 'معاينة الإعلان';
          previewText.style.color = /^#[0-9a-fA-F]{6}$/.test(colorEl.value) ? colorEl.value : '#451a03';
          preview.classList.toggle('is-scroll', scrollEl.checked);
        };
        textEl.addEventListener('input', updatePreview);
        colorEl.addEventListener('input', updatePreview);
        scrollEl.addEventListener('change', updatePreview);

        (async () => {
          try {
            const [{ initializeApp }, { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut }, { getDatabase, ref, get, set, serverTimestamp }] = await Promise.all([
              import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
              import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
              import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js')
            ]);
            const app = initializeApp(firebaseConfig, 'fw-wp-admin-' + Math.random().toString(36).slice(2));
            const auth = getAuth(app);
            const database = getDatabase(app, firebaseConfig.databaseURL);
            const announcementRef = ref(database, 'announcement/current');
            const chatConfigRef = ref(database, 'publicChat/config');
            const chatNoticeRef = ref(database, 'publicChat/notice');
            const chatMessagesRef = ref(database, 'publicChat/messages');
            const loginSection = panel.querySelector('.fw-login');
            const editorSection = panel.querySelector('.fw-editor');

            onAuthStateChanged(auth, async user => {
              if (!user) { loginSection.classList.remove('fw-hidden'); editorSection.classList.add('fw-hidden'); setStatus('سجّل الدخول بحساب الإدارة.'); return; }
              if (user.uid !== ADMIN_UID) { await signOut(auth); setStatus('هذا الحساب غير مخوّل لإدارة الإعلانات.', true); return; }
              loginSection.classList.add('fw-hidden'); editorSection.classList.remove('fw-hidden');
              try {
                const snapshot = await get(announcementRef);
                const value = snapshot.val() || {};
                textEl.value = value.text || '';
                colorEl.value = /^#[0-9a-fA-F]{6}$/.test(value.textColor || '') ? value.textColor : '#451a03';
                scrollEl.checked = value.scroll === true;
                activeEl.checked = value.active === true;
                const chatConfigSnapshot = await get(chatConfigRef);
                const chatConfig = chatConfigSnapshot.val() || {};
                panel.querySelector('.fw-chat-enabled').checked = chatConfig.enabled !== false;
                panel.querySelector('.fw-chat-readonly').checked = chatConfig.readOnly === true;
                const noticeSnapshot = await get(chatNoticeRef);
                const notice = noticeSnapshot.val() || {};
                panel.querySelector('.fw-chat-notice').value = typeof notice.text === 'string' ? notice.text : '';
                panel.querySelector('.fw-notice-active').checked = notice.active === true;
                updatePreview(); setStatus('تم تسجيل الدخول.');
              } catch (error) { setStatus('تعذر تحميل الإعدادات: ' + error.message, true); }
            });

            panel.querySelector('.fw-login-button').addEventListener('click', async () => {
              try { await signInWithEmailAndPassword(auth, panel.querySelector('.fw-email').value.trim(), panel.querySelector('.fw-password').value); }
              catch (error) { setStatus('فشل تسجيل الدخول: ' + error.message, true); }
            });
            const publish = async active => {
              const text = textEl.value.trim();
              if (active && !text) { setStatus('اكتب نص الإعلان قبل نشره.', true); return; }
              try {
                await set(announcementRef, { active, text, textColor: colorEl.value, scroll: scrollEl.checked, updatedAt: serverTimestamp() });
                activeEl.checked = active;
                setStatus(active ? 'تم حفظ الإعلان. سيظهر عند فتح التطبيق أو العودة إليه.' : 'تم إخفاء الإعلان؛ يحدّث في التطبيق عند الفتح/العودة.');
              } catch (error) { setStatus('تعذر الحفظ: ' + error.message, true); }
            };
            panel.querySelector('.fw-save').addEventListener('click', () => publish(activeEl.checked));
            panel.querySelector('.fw-hide-ad').addEventListener('click', () => publish(false));
            panel.querySelector('.fw-save-chat').addEventListener('click', async () => {
              const enabled = panel.querySelector('.fw-chat-enabled').checked;
              const readOnly = panel.querySelector('.fw-chat-readonly').checked;
              try {
                await set(chatConfigRef, { enabled, readOnly, updatedAt: serverTimestamp() });
                setStatus(!enabled ? 'تم إيقاف الدردشة؛ ما زالت الرسائل قابلة للقراءة.' : readOnly ? 'تم تفعيل وضع القراءة فقط.' : 'تم تفعيل الدردشة والسماح بالإرسال.');
              } catch (error) { setStatus('تعذر حفظ حالة الدردشة: ' + error.message, true); }
            });
            panel.querySelector('.fw-save-chat-notice').addEventListener('click', async () => {
              const text = panel.querySelector('.fw-chat-notice').value.trim();
              const active = panel.querySelector('.fw-notice-active').checked;
              if (active && !text) { setStatus('اكتب نص التنبيه أو أوقف خيار إظهاره.', true); return; }
              try {
                await set(chatNoticeRef, { active, text, updatedAt: serverTimestamp() });
                setStatus(active ? 'تم نشر التنبيه في أعلى غرفة الدردشة.' : 'تم إخفاء التنبيه الإداري.');
              } catch (error) { setStatus('تعذر حفظ التنبيه: ' + error.message, true); }
            });
            panel.querySelector('.fw-clear-chat').addEventListener('click', async () => {
              if (!window.confirm('تحذير: سيُحذف سجل الدردشة العام لجميع المستخدمين نهائياً. هل تريد المتابعة؟')) return;
              try {
                await set(chatMessagesRef, null);
                setStatus('تم مسح سجل الدردشة.');
              } catch (error) { setStatus('تعذر مسح السجل: ' + error.message, true); }
            });
            panel.querySelector('.fw-logout').addEventListener('click', () => signOut(auth));
          } catch (error) { setStatus('تعذر تحميل Firebase. تحقق من الاتصال وإعداد الصفحة: ' + error.message, true); }
        })();
      })();
      </script>
    </div>
    <?php
    return ob_get_clean();
});

// The landing page can show a .fw-download-count span without embedding JS
// in a WordPress Custom HTML block (which some roles/hosts sanitize).
add_action('wp_footer', function () { ?>
<script type="module">
(() => {
  const counters = document.querySelectorAll('.fw-download-count');
  if (!counters.length) return;
  const config = {
    apiKey: 'AIzaSyBwOCy24qLlkCdnWhHBu722MrVM_v7e_RE',
    authDomain: 'first22-7464f.firebaseapp.com',
    projectId: 'first22-7464f',
    appId: '1:1017587333323:web:e503a882b446f3450a834e',
    messagingSenderId: '1017587333323',
    storageBucket: 'first22-7464f.firebasestorage.app',
    databaseURL: 'https://first22-7464f-default-rtdb.firebaseio.com'
  };
  const links = document.querySelectorAll('a.fw-download-cta');
  const counterReady = Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js')
  ]).then(([appModule, authModule, dbModule]) => {
    const app = appModule.initializeApp(config, 'fw-download-counter');
    const auth = authModule.getAuth(app);
    const db = dbModule.getDatabase(app, config.databaseURL);
    const countRef = dbModule.ref(db, 'siteStats/downloads');
    dbModule.onValue(countRef, snapshot => {
      const count = Math.max(500, Number(snapshot.val()) || 500);
      counters.forEach(el => { el.textContent = count.toLocaleString('ar'); });
    });
    return { auth, signInAnonymously: authModule.signInAnonymously, countRef, runTransaction: dbModule.runTransaction };
  });
  counterReady.catch(error => console.warn('Download counter unavailable', error));
  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      void counterReady.then(async ({ auth, signInAnonymously, countRef, runTransaction }) => {
        if (!auth.currentUser) await signInAnonymously(auth);
        const result = await runTransaction(countRef, value => Math.max(500, Number(value) || 500) + 1, { applyLocally: false });
        if (result.committed) counters.forEach(el => { el.textContent = Number(result.snapshot.val()).toLocaleString('ar'); });
      }).catch(error => {
        console.warn('Download counter could not update', error);
      });
    });
  });
})();
</script>
<?php }, 100);
