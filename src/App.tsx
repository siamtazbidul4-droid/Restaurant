import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';

// Public Layout & Pages
import { PublicLayout } from './components/layout/PublicLayout.js';
import { HomePage } from './pages/public/HomePage.js';
import { StoryPage } from './pages/public/StoryPage.js';
import { MenuPage } from './pages/public/MenuPage.js';
import { ExperiencePage } from './pages/public/ExperiencePage.js';
import { ChefPage } from './pages/public/ChefPage.js';
import { GalleryPage } from './pages/public/GalleryPage.js';
import { PrivateDiningPage } from './pages/public/PrivateDiningPage.js';
import { ReservationsPage } from './pages/public/ReservationsPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { LegalPage } from './pages/public/LegalPage.js';
import { NotFoundPage } from './pages/public/NotFoundPage.js';

// Admin Layout & Pages
import { AdminLayout } from './components/layout/AdminLayout.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage.js';
import { AdminTablesPage } from './pages/admin/AdminTablesPage.js';
import { AdminMenuPage } from './pages/admin/AdminMenuPage.js';
import { AdminEventsPage } from './pages/admin/AdminEventsPage.js';
import { AdminContactPage } from './pages/admin/AdminContactPage.js';
import { AdminMediaPage } from './pages/admin/AdminMediaPage.js';
import { AdminContentPage } from './pages/admin/AdminContentPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="our-story" element={<StoryPage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="chef" element={<ChefPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="private-dining" element={<PrivateDiningPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="legal/:tab" element={<LegalPage />} />
                <Route path="legal" element={<LegalPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="reservations" element={<AdminReservationsPage />} />
                <Route path="tables" element={<AdminTablesPage />} />
                <Route path="menu" element={<AdminMenuPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="contact" element={<AdminContactPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
