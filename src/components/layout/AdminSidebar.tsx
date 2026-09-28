import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Armchair,
  UtensilsCrossed,
  GlassWater,
  Mail,
  Image as ImageIcon,
  SlidersHorizontal,
  FileText,
  History,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Reservations', icon: CalendarCheck, href: '/admin/reservations' },
    { label: 'Tables & Seating', icon: Armchair, href: '/admin/tables' },
    { label: 'Menu Catalog', icon: UtensilsCrossed, href: '/admin/menu' },
    { label: 'Private Events', icon: GlassWater, href: '/admin/events' },
    { label: 'Guest Messages', icon: Mail, href: '/admin/contact' },
    { label: 'Media Library', icon: ImageIcon, href: '/admin/media' },
    { label: 'Content CMS', icon: FileText, href: '/admin/content' },
    { label: 'Settings & Hours', icon: SlidersHorizontal, href: '/admin/settings' },
    { label: 'Audit Trail', icon: History, href: '/admin/audit-logs' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111115] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Lockup */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <Link to="/admin" className="font-serif text-xl tracking-[0.2em] text-white uppercase block">
                Aurelia
              </Link>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block mt-0.5">
                Operations Engine
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/admin'}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 transition-colors uppercase tracking-wider font-sans text-[11px] ${
                      isActive
                        ? 'bg-[#C5A880]/15 text-[#C5A880] border-l-2 border-[#C5A880] font-semibold'
                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Link to Public Website */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-white border border-white/5 hover:border-white/20 transition-colors uppercase tracking-wider text-[11px]"
          >
            <span>Live Guest Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
};
