import React from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  FileEdit,
  Briefcase,
  Layers,
  Users,
  FolderKanban,
  Mail,
  Settings,
  Globe,
  LogOut,
  Shield,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Website Content (CMS)', icon: FileEdit, href: '/admin/content' },
    { label: 'Portfolio', icon: Briefcase, href: '/admin/portfolio' },
    { label: 'Services (Layanan)', icon: Layers, href: '/admin/services' },
    { label: 'Clients', icon: Users, href: '/admin/clients' },
    { label: 'Projects', icon: FolderKanban, href: '/admin/projects' },
    { label: 'Messages', icon: Mail, href: '/admin/messages' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 min-h-screen flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 border border-amber-500/40 rounded flex items-center justify-center font-bold text-amber-400 text-sm">
              K
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-white block">
                KROMA ADMIN
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block">
                Control Center
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono">
            Admin
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = path === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-zinc-900 space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <Globe className="w-4 h-4 text-zinc-500" />
          <span>Buka Website Public</span>
        </button>

        <div className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-xs text-white font-medium block truncate">
              {user?.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono block truncate">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
