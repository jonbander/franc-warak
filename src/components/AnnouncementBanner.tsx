import React, { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { Megaphone } from 'lucide-react';
import { getFirebaseDatabase, loadFirebaseConfig } from '../services/firebaseClient';

interface Announcement {
  active?: boolean;
  text?: string;
  textColor?: string;
  scroll?: boolean;
  updatedAt?: number;
}

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

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
  if (!text) return null;
  const color = typeof announcement?.textColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(announcement.textColor)
    ? announcement.textColor
    : '#451a03';

  return (
    <aside role="status" aria-live="polite" className="mx-3 mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-amber-950 shadow-xs">
      <style>{`@keyframes fw-announcement-ltr{from{transform:translateX(calc(-100% - 100vw))}to{transform:translateX(calc(100vw + 100%))}}.fw-announcement-marquee{animation:fw-announcement-ltr 20s linear infinite}@media(prefers-reduced-motion:reduce){.fw-announcement-marquee{animation:none;transform:none;white-space:normal;width:auto}}`}</style>
      <div className="flex items-start gap-2">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div className="min-w-0 flex-1 overflow-hidden" dir="ltr">
          {announcement?.scroll === true ? (
            <p dir="rtl" className="fw-announcement-marquee inline-block w-max max-w-none whitespace-nowrap text-sm leading-relaxed" style={{ color }}>{text}</p>
          ) : (
            <p dir="rtl" className="whitespace-pre-wrap break-words text-sm leading-relaxed" style={{ color }}>{text}</p>
          )}
        </div>
      </div>
    </aside>
  );
};
