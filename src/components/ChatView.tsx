import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { limitToLast, onChildAdded, onValue, orderByKey, push, query, ref, serverTimestamp, set } from 'firebase/database';
import { AlertCircle, LoaderCircle, MessageCircle, Send, WifiOff } from 'lucide-react';
import { ensureAnonymousUser, getFirebaseDatabase } from '../services/firebaseClient';

interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  createdAt: number;
  pending?: boolean;
  failed?: boolean;
}

interface ChatViewProps {
  suggestedName: string;
  onOpenSettings: () => void;
}

const CHAT_PATH = 'publicChat/messages';
const MAX_MESSAGE_LENGTH = 500;

export const ChatView: React.FC<ChatViewProps> = ({ suggestedName, onOpenSettings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [senderUid, setSenderUid] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const senderName = suggestedName.trim().slice(0, 60);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    let cancelled = false;
    void (async () => {
      try {
        const auth = await ensureAnonymousUser();
        const database = await getFirebaseDatabase();
        if (cancelled) return;
        setSenderUid(auth.currentUser?.uid || '');
        const recentMessages = query(ref(database, CHAT_PATH), orderByKey(), limitToLast(50));
        unsubscribers.push(onChildAdded(recentMessages, (snapshot) => {
          const value = snapshot.val() as Omit<ChatMessage, 'id'>;
          const incoming: ChatMessage = { ...value, id: snapshot.key || '' };
          setMessages((current) => {
            const index = current.findIndex((item) => item.id === incoming.id);
            if (index < 0) return [...current, incoming].slice(-50);
            const copy = [...current];
            copy[index] = { ...copy[index], ...incoming, pending: false, failed: false };
            return copy;
          });
        }, (subscriptionError) => {
          setError(subscriptionError.message || 'تعذر استقبال الرسائل.');
          setConnectionState('offline');
          setLoading(false);
        }));
        unsubscribers.push(onValue(ref(database, '.info/connected'), (snapshot) => {
          setConnectionState(snapshot.val() === true ? 'connected' : 'offline');
        }));
        setError('');
      } catch (connectionError) {
        const message = connectionError instanceof Error ? connectionError.message : 'تعذر الاتصال بخدمة الدردشة.';
        setError(message);
        setConnectionState('offline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = suggestedName.trim().slice(0, 60);
    const cleanText = messageText.trim();
    if (!cleanName || !cleanText || !senderUid || sending) return;
    if (cleanText.length > MAX_MESSAGE_LENGTH) {
      setError(`الحد الأقصى للرسالة ${MAX_MESSAGE_LENGTH} حرفاً.`);
      return;
    }

    setError('');
    setSending(true);
    setMessageText('');

    try {
      const database = await getFirebaseDatabase();
      const newMessage = push(ref(database, CHAT_PATH));
      const id = newMessage.key;
      if (!id) throw new Error('تعذر إنشاء معرّف الرسالة.');
      const optimistic: ChatMessage = {
        id,
        senderUid,
        senderName: cleanName,
        text: cleanText,
        createdAt: Date.now(),
        pending: true,
      };
      setMessages((current) => [...current.filter((item) => item.id !== id), optimistic].slice(-50));
      await set(newMessage, {
        senderUid,
        senderName: cleanName,
        text: cleanText,
        createdAt: serverTimestamp(),
      });
      setMessages((current) => current.map((item) => item.id === id ? { ...item, pending: false, failed: false } : item));
    } catch {
      setError('لم تُرسل الرسالة. تحقّق من الاتصال ثم أعد المحاولة.');
      setMessages((current) => current.map((item) => item.pending ? { ...item, pending: false, failed: true } : item));
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (message: ChatMessage) => {
    if (!message.failed || !senderUid || !senderName) return;
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, failed: false, pending: true } : item));
    try {
      const database = await getFirebaseDatabase();
      await set(ref(database, `${CHAT_PATH}/${message.id}`), {
        senderUid,
        senderName,
        text: message.text,
        createdAt: serverTimestamp(),
      });
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, pending: false, failed: false } : item));
      setError('');
    } catch {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, pending: false, failed: true } : item));
      setError('لم تُرسل الرسالة. تحقّق من الاتصال ثم حاول مجدداً.');
    }
  };

  return (
    <section className="flex min-h-[65vh] flex-col gap-3" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">الدردشة العامة</h2>
          <p className="mt-1 text-xs text-stone-500">تظهر الرسائل الجديدة فور وصولها أثناء فتح هذه الصفحة.</p>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${connectionState === 'connected' ? 'bg-emerald-50 text-emerald-800' : connectionState === 'offline' ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-500'}`}>
          {connectionState === 'connected' ? <MessageCircle className="h-3 w-3" /> : connectionState === 'offline' ? <WifiOff className="h-3 w-3" /> : <LoaderCircle className="h-3 w-3 animate-spin" />}
          {connectionState === 'connected' ? 'متصل' : connectionState === 'offline' ? 'غير متصل' : 'جارٍ الاتصال'}
        </div>
      </div>

      <div ref={listRef} className="flex-1 min-h-72 max-h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
        {loading && <div className="flex justify-center py-8 text-sm text-stone-400"><LoaderCircle className="ml-2 h-4 w-4 animate-spin" />جارٍ تحميل الرسائل…</div>}
        {!loading && messages.length === 0 && connectionState === 'connected' && <p className="py-12 text-center text-sm text-stone-400">لا توجد رسائل بعد. كن أول من يبدأ الحديث.</p>}
        {messages.map((message) => (
          <article key={message.id} className={`max-w-[88%] rounded-2xl px-3 py-2 ${message.senderUid === senderUid ? 'mr-auto bg-emerald-50 text-emerald-950' : 'ml-auto bg-stone-100 text-stone-900'}`}>
            <div className="mb-1 flex items-center justify-between gap-4">
              <strong className="truncate text-xs">{message.senderName || 'مستخدم'}</strong>
              <time className="shrink-0 text-[10px] text-stone-400">
                {message.pending ? 'جارٍ الإرسال…' : message.failed ? 'فشل الإرسال' : new Date(message.createdAt || Date.now()).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>
            {message.failed && (
              <button type="button" onClick={() => void retryMessage(message)} className="mt-2 text-xs font-bold text-rose-700 underline">
                إعادة الإرسال
              </button>
            )}
          </article>
        ))}
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
          </p>
        )}
      </div>

      <form onSubmit={sendMessage} className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2 text-xs">
          <div>
            <span className="text-stone-500">سيظهر اسم المزارع في الرسائل: </span>
            <strong className={senderName ? 'text-stone-800' : 'text-rose-700'}>{senderName || 'لم يُدخل بعد'}</strong>
          </div>
          {!senderName && (
            <button type="button" onClick={onOpenSettings} className="shrink-0 font-bold text-emerald-800 underline">
              إدخال الاسم
            </button>
          )}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={2}
            placeholder="اكتب رسالة…"
            aria-label="نص الرسالة"
            className="min-h-12 flex-1 resize-y rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="submit"
            disabled={sending || connectionState !== 'connected' || !senderName || !messageText.trim()}
            aria-label="إرسال الرسالة"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />إرسال
          </button>
        </div>
        <div className="text-left text-[10px] text-stone-400">{messageText.length}/{MAX_MESSAGE_LENGTH}</div>
      </form>
      <p className="text-[10px] leading-relaxed text-stone-400">الاسم الظاهر غير موثّق وقد يختاره أكثر من مستخدم. لا ترسل معلومات شخصية أو حساسة في الغرفة العامة.</p>
    </section>
  );
};
