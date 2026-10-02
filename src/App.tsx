import React from 'react';
import { RouterProvider, useRouter } from './utils/router.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ContentProvider } from './context/ContentContext.tsx';

// Components
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminSidebar } from './components/admin/AdminSidebar.tsx';

// Public Pages
import { HomePage } from './pages/public/HomePage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { PortfolioPage } from './pages/public/PortfolioPage.tsx';
import { ServicesPage } from './pages/public/ServicesPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';
import { LoginPage } from './pages/public/LoginPage.tsx';
import { RegisterPage } from './pages/public/RegisterPage.tsx';

// Client Pages
import { ClientDashboardPage } from './pages/client/ClientDashboardPage.tsx';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage.tsx';

// Admin Pages
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview.tsx';
import { AdminContentPage } from './pages/admin/AdminContentPage.tsx';
import { AdminPortfolioPage } from './pages/admin/AdminPortfolioPage.tsx';
import { AdminServicesPage } from './pages/admin/AdminServicesPage.tsx';
import { AdminClientsPage } from './pages/admin/AdminClientsPage.tsx';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage.tsx';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';

import { ShieldAlert, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, isLoading } = useAuth();

  // Admin route check
  const isAdminRoute = path.startsWith('/admin');

  // Client route check
  const isClientRoute = path.startsWith('/client');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span>Memuat Sistem Kroma Studio...</span>
        </div>
      </div>
    );
  }

  // --- ADMIN PORTAL LAYOUT ---
  if (isAdminRoute) {
    if (!user) {
      return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded p-8 text-center space-y-4">
            <Lock className="w-8 h-8 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Autentikasi Diperlukan
            </h2>
            <p className="text-xs text-zinc-400">
              Silakan login terlebih dahulu dengan akun Administrator untuk mengakses panel ini.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200"
            >
              Menuju Halaman Login
            </button>
          </div>
        </div>
      );
    }

    if (user.role !== 'admin') {
      return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-red-500/40 rounded p-8 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Akses Ditolak (403 Forbidden)
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Akun Anda berstatus <strong>Client</strong> ({user.email}). Client tidak diizinkan membuka portal Admin.
            </p>
            <button
              onClick={() => navigate('/client/dashboard')}
              className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 mt-2"
            >
              Kembali ke Dashboard Klien
            </button>
          </div>
        </div>
      );
    }

    let AdminViewComponent = AdminDashboardOverview;
    if (path === '/admin/content') AdminViewComponent = AdminContentPage;
    else if (path === '/admin/portfolio') AdminViewComponent = AdminPortfolioPage;
    else if (path === '/admin/services') AdminViewComponent = AdminServicesPage;
    else if (path === '/admin/clients') AdminViewComponent = AdminClientsPage;
    else if (path === '/admin/projects') AdminViewComponent = AdminProjectsPage;
    else if (path === '/admin/messages') AdminViewComponent = AdminMessagesPage;
    else if (path === '/admin/settings') AdminViewComponent = AdminSettingsPage;

    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-screen">
          <AdminViewComponent />
        </main>
      </div>
    );
  }

  // --- CLIENT ROUTES ---
  if (isClientRoute) {
    if (!user) {
      return (
        <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded p-8 text-center space-y-4">
            <Lock className="w-8 h-8 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Sesi Login Diperlukan
            </h2>
            <p className="text-xs text-zinc-400">
              Silakan login ke akun klien Anda untuk memantau progress pengerjaan desain logo.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200"
            >
              Login Klien
            </button>
          </div>
        </div>
      );
    }

    // Detail project check
    if (path.startsWith('/client/projects/')) {
      const projectId = path.replace('/client/projects/', '').split('?')[0].split('/')[0];
      return (
        <div className="min-h-screen bg-black flex flex-col justify-between">
          <Navbar />
          <div className="flex-1">
            <ClientProjectDetailPage projectId={projectId} />
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <Navbar />
        <div className="flex-1">
          <ClientDashboardPage />
        </div>
        <Footer />
      </div>
    );
  }

  // --- PUBLIC ROUTES ---
  let PublicComponent = HomePage;
  if (path === '/about') PublicComponent = AboutPage;
  else if (path === '/portfolio') PublicComponent = PortfolioPage;
  else if (path === '/services') PublicComponent = ServicesPage;
  else if (path === '/contact') PublicComponent = ContactPage;
  else if (path === '/login') PublicComponent = LoginPage;
  else if (path === '/register') PublicComponent = RegisterPage;

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between text-zinc-100">
      <Navbar />
      <div className="flex-1">
        <PublicComponent />
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ContentProvider>
          <AppContent />
        </ContentProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
