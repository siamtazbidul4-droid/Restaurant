import React, { useEffect, useState } from 'react';
import { adminApi, DashboardStatsDto } from '../../api/admin.api.js';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  Calendar,
  GlassWater,
  Mail,
  UtensilsCrossed,
  ArrowRight,
  Plus,
  Loader2,
  Activity,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        <p className="text-xs uppercase tracking-widest">Aggregating Operational Telemetry...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Seatings",
      value: stats?.todayReservationsCount ?? 0,
      icon: CalendarCheck,
      link: '/admin/reservations',
      desc: 'Active tables for current dinner service',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReservationsCount ?? 0,
      icon: Clock,
      link: '/admin/reservations?status=Pending',
      desc: 'Bookings requiring host confirmation',
    },
    {
      label: '7-Day Upcoming',
      value: stats?.upcomingReservationsCount ?? 0,
      icon: Calendar,
      link: '/admin/reservations',
      desc: 'Confirmed covers through next week',
    },
    {
      label: 'Event Inquiries',
      value: stats?.newEventInquiriesCount ?? 0,
      icon: GlassWater,
      link: '/admin/events',
      desc: 'New private cellar requests',
    },
    {
      label: 'Guest Messages',
      value: stats?.unreadContactMessagesCount ?? 0,
      icon: Mail,
      link: '/admin/contact',
      desc: 'Unread front-of-house inquiries',
    },
    {
      label: 'Active Menu Items',
      value: stats?.totalMenuItemsCount ?? 0,
      icon: UtensilsCrossed,
      link: '/admin/menu',
      desc: 'Published dishes across all courses',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-wide mt-1">
            Operations & Floor Overview
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/reservations"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans uppercase tracking-[0.18em] bg-[#C5A880] text-[#0D0D0E] font-medium hover:bg-[#E0CEB5] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Seatings</span>
          </Link>
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans uppercase tracking-[0.18em] bg-[#16161D] border border-white/15 text-white hover:border-[#C5A880] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="p-6 bg-[#141419] border border-white/10 hover:border-[#C5A880]/50 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-wider text-[#D1CCC0] font-sans">
                  {card.label}
                </span>
                <div className="p-2 bg-[#1B1B24] border border-white/5 text-[#C5A880] group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="font-mono text-3xl sm:text-4xl font-semibold text-white tracking-tight tabular-nums">
                  {card.value}
                </span>
                <p className="text-[11px] text-stone-400 mt-1 leading-snug">{card.desc}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400 group-hover:text-[#C5A880] transition-colors">
                <span className="uppercase tracking-wider">Inspect Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity / Audit Logs */}
      <div className="bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C5A880]" />
            <h3 className="font-serif text-xl text-white">Recent Operational Activity</h3>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs text-[#C5A880] hover:underline uppercase tracking-wider"
          >
            View Complete Audit Log →
          </Link>
        </div>

        {stats?.recentActivity?.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">No recent activity recorded.</p>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {stats?.recentActivity?.map((act) => (
              <div key={act._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#C5A880] uppercase tracking-wider bg-[#1B1B24] px-2 py-0.5 border border-white/5">
                    {act.action}
                  </span>
                  <span className="text-white font-medium">{act.resource}</span>
                  <span className="text-stone-400 text-[11px]">by {act.actor}</span>
                </div>
                <span className="text-stone-500 text-[11px] font-mono">
                  {new Date(act.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
