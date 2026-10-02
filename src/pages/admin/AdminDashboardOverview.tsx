import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminStats, Project, ContactMessage } from '../../types/index.ts';
import {
  Users,
  FolderKanban,
  CheckCircle,
  Briefcase,
  Mail,
  ArrowRight,
  PlusCircle,
  FileEdit,
  Clock,
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  const { navigate } = useRouter();
  const { token } = useAuth();

  const [stats, setStats] = useState<AdminStats>({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalPortfolio: 0,
    unreadMessages: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsRes, projRes, msgRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (projRes.ok) {
          const projs = await projRes.json();
          setRecentProjects(projs.slice(0, 5));
        }
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          setRecentMessages(msgs.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchAdminData();
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Ikhtisar Sistem
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/admin/projects')}
            className="px-4 py-2 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Project Baru
          </button>
          <button
            onClick={() => navigate('/admin/content')}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-medium text-xs uppercase tracking-wider rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <FileEdit className="w-3.5 h-3.5" />
            Kelola Konten CMS
          </button>
        </div>
      </div>

      {/* 5 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Total Clients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.totalClients}</div>
          <div className="text-[11px] text-zinc-500">Akun terdaftar</div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Project Aktif</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{stats.activeProjects}</div>
          <div className="text-[11px] text-zinc-500">Sedang dikerjakan</div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Project Selesai</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">{stats.completedProjects}</div>
          <div className="text-[11px] text-zinc-500">Master diserahkan</div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Portfolio Item</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{stats.totalPortfolio}</div>
          <div className="text-[11px] text-zinc-500">Tayang di website</div>
        </div>

        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Pesan Baru</span>
            <Mail className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400 font-mono">{stats.unreadMessages}</div>
          <div className="text-[11px] text-zinc-500">Inquiry belum dibaca</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Projects & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-zinc-400" />
              Project Terkini
            </h2>
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1"
            >
              Semua Project <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono py-8 text-center">Belum ada project.</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-black border border-zinc-800/80 rounded flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{p.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Klien: {p.client_name} • Progress: {p.progress}%
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/admin/projects')}
                    className="p-1.5 bg-zinc-900 hover:bg-white hover:text-black rounded text-zinc-400 transition-colors text-xs font-mono shrink-0"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />
              Inquiry Formulir Kontak
            </h2>
            <button
              onClick={() => navigate('/admin/messages')}
              className="text-xs font-mono text-zinc-400 hover:text-white inline-flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono py-8 text-center">Belum ada pesan masuk.</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-black border border-zinc-800/80 rounded space-y-1 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate">{m.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {m.created_at?.split('T')[0] || m.created_at}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 truncate">{m.email}</div>
                  <p className="text-xs text-zinc-400 line-clamp-2 pt-1">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
