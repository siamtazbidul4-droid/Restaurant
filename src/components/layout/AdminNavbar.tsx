import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { adminApi, NotificationDto } from '../../api/admin.api.js';
import { Bell, Menu, LogOut, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = () => {
    adminApi
      .getNotifications()
      .then((res) => {
        if (res.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await adminApi.markAllNotificationsRead();
    fetchNotifications();
  };

  const handleNotificationClick = async (notif: NotificationDto) => {
    if (!notif.isRead) {
      await adminApi.markNotificationRead(notif._id);
      fetchNotifications();
    }
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-[#111115] border-b border-white/10 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-stone-400 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#D1CCC0] font-sans">
          Management Sanctuary
        </span>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 text-stone-300 hover:text-white relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16161D] border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                  Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#C5A880] hover:underline uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5 text-xs py-1">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-stone-500 text-xs">No notifications recorded.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 transition-colors cursor-pointer ${
                        !n.isRead ? 'bg-[#1C1C24]' : 'hover:bg-white/5 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-white text-xs">{n.title}</h4>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">{n.message}</p>
                      {n.link && (
                        <Link
                          to={n.link}
                          className="inline-flex items-center gap-1 text-[10px] text-[#C5A880] hover:underline mt-2 uppercase tracking-wider"
                        >
                          <span>Inspect Record</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white leading-tight">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-[#C5A880] uppercase tracking-wider">{user?.role || 'Staff'}</p>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-stone-400 hover:text-rose-300 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
