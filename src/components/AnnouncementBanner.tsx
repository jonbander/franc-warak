import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { Megaphone, X } from 'lucide-react';
import { getFirebaseDatabase, loadFirebaseConfig } from '../services/firebaseClient';

interface Announcement {
  active?: boolean;
  text?: string;
  updatedAt?: number;
}

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissedKey, setDismissedKey] = useState('');

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;
    const refreshAnnouncement = async () => {
      if (requestInFlight || document.visibilityState === 'hidden') return;
      requestInFlight = true;
      try {
        await loadFirebaseConfig();
        const database = await getFirebaseDatabase();
        if (cancelled) return;
        const snapshot = await get(ref(database, 'announcement/current'));
        if (!cancelled) setAnnouncement(snapshot.exists() ? snapshot.val() as Announcement : null);
      } catch {
        // Firebase can remain unconfigured while the rest of the app works offline.
      } finally {
        requestInFlight = false;
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshAnnouncement();
    };
    void refreshAnnouncement();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const text = announcement?.active && typeof announcement.text === 'string'
    ? announcement.text.trim()
    : '';
  const key = `${announcement?.updatedAt ?? ''}:${text}`;
  if (!text || dismissedKey === key) return null;

  return (
    <aside role="status" aria-live="polite" className="mx-3 mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-amber-950 shadow-xs">
      <div className="flex items-start gap-2">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p>
        <button
          type="button"
          onClick={() => setDismissedKey(key)}
          aria-label="إخفاء الإعلان"
          className="rounded-md p-1 text-amber-800 hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
