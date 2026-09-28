import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { AdminSidebar } from './AdminSidebar.js';
import { AdminNavbar } from './AdminNavbar.js';
import { Loader2 } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0E] flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#D1CCC0]">
          Verifying Security Clearance...
        </p>
      </div>
    );
  }

  // If not logged in and not already on /admin/login
  if (!user && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0E] text-[#F6F4EE] flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
