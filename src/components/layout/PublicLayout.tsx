import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar.js';
import { PublicFooter } from './PublicFooter.js';
import { contentApi, AnnouncementDto } from '../../api/content.api.js';
import { X, Sparkles } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    contentApi
      .getAnnouncements()
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setAnnouncements(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const activeAnnouncement = announcements[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0E] text-[#F6F4EE] antialiased selection:bg-[#C5A880]/30 selection:text-white">
      {/* Top Announcement Banner if active */}
      {activeAnnouncement && !isDismissed && (
        <aside
          aria-label="Restaurant announcement"
          className="bg-[#181820] border-b border-[#C5A880]/30 text-white text-xs py-2 px-4 relative z-50 flex items-center justify-between max-sm:hidden"
        >
          <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            <span className="font-medium text-[#E0CEB5]">{activeAnnouncement.title}:</span>
            <span className="text-stone-300 truncate hidden sm:inline">{activeAnnouncement.description}</span>
            {activeAnnouncement.ctaUrl && (
              <Link
                to={activeAnnouncement.ctaUrl}
                className="underline underline-offset-4 text-[#C5A880] hover:text-white ml-2 font-medium tracking-wide whitespace-nowrap"
              >
                {activeAnnouncement.ctaLabel || 'Learn More'}
              </Link>
            )}
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-stone-400 hover:text-white p-1 ml-2 shrink-0"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Primary Top Bar */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full pt-0">
        <Outlet />
      </main>

      {/* Luxury Footer */}
      <PublicFooter />
    </div>
  );
};
