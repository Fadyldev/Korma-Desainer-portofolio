import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Project, ClientStats } from '../../types/index.ts';
import {
  FolderKanban,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  ShieldAlert,
  Building,
  Mail,
  Phone,
  PlusCircle,
  Settings,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ClientDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { user, token, updateProfile } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    nearestDeadline: null,
  });
  const [loading, setLoading] = useState(true);

  // Edit Profile / Password Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Security guard: redirect if not logged in or if admin wants admin dashboard
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }

    async function loadClientData() {
      try {
        const [projRes, statsRes] = await Promise.all([
          fetch('/api/client/projects', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/client/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Failed to load client projects:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadClientData();
    }
  }, [user, token, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
      case 'Final':
        return 'bg-blue-950/60 border-blue-500/40 text-blue-300';
      case 'Revision':
        return 'bg-amber-950/60 border-amber-500/40 text-amber-300';
      case 'Design':
        return 'bg-purple-950/60 border-purple-500/40 text-purple-300';
      case 'Concept':
        return 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300';
      default:
        return 'bg-zinc-900 border-zinc-700 text-zinc-300';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Banner */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Client Portal Aktif
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Selamat Datang, {user.name}
            </h1>
            <p className="text-xs text-zinc-400 font-mono flex flex-wrap gap-4">
              <span>{user.company ? `Brand: ${user.company}` : 'Client Personal'}</span>
              <span>•</span>
              <span>{user.email}</span>
              {user.phone && (
                <>
                  <span>•</span>
                  <span>{user.phone}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setProfileForm({
                  name: user.name,
                  phone: user.phone || '',
                  company: user.company || '',
                  password: '',
                  confirmPassword: '',
                });
                setProfileError('');
                setProfileSuccess('');
                setIsProfileModalOpen(true);
              }}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 font-medium text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Ganti Password / Profil
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-4 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Request Project Baru
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-mono uppercase">Total Project</span>
              <FolderKanban className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalProjects}</div>
            <div className="text-[11px] text-zinc-500">Terdaftar atas akun Anda</div>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-mono uppercase">Project Berjalan</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">{stats.activeProjects}</div>
            <div className="text-[11px] text-zinc-500">Dalam tahap riset/desain</div>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-mono uppercase">Project Selesai</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 font-mono">{stats.completedProjects}</div>
            <div className="text-[11px] text-zinc-500">Master files telah diserahkan</div>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-1">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-mono uppercase">Target Deadline Terdekat</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono truncate">
              {stats.nearestDeadline || '—'}
            </div>
            <div className="text-[11px] text-zinc-500">Berdasarkan jadwal kerja</div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Daftar Project Anda
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {projects.length} Project Ditemukan
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-4">
              <FolderKanban className="w-12 h-12 text-zinc-700 mx-auto" />
              <h3 className="text-base font-semibold text-white">Belum Ada Project Aktif</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Anda belum memiliki project logo yang sedang berjalan. Hubungi kami untuk memulai brief desain logo baru Anda.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200"
              >
                Mulai Project Baru
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 bg-zinc-950 border border-zinc-900 rounded hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${getStatusBadge(
                          proj.status
                        )}`}
                      >
                        Tahap: {proj.status}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">
                        Kategori: {proj.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex items-center gap-6 text-xs font-mono text-zinc-500 pt-1">
                      <span>Mulai: {proj.start_date}</span>
                      <span>•</span>
                      <span>Deadline: {proj.deadline}</span>
                    </div>
                  </div>

                  {/* Progress & Action */}
                  <div className="md:w-64 space-y-4 shrink-0 border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400">Kemajuan Project</span>
                        <span className="text-white font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/client/projects/${proj.id}`)}
                      className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Buka Timeline & File
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE & PASSWORD MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-md w-full p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                Pengaturan Profil & Password
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Perbarui nama, nomor telepon, nama brand, atau ganti kata sandi akun klien Anda.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!profileForm.name.trim()) {
                  setProfileError('Nama tidak boleh kosong.');
                  return;
                }
                if (profileForm.password && profileForm.password.length < 6) {
                  setProfileError('Password minimal 6 karakter.');
                  return;
                }
                if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
                  setProfileError('Konfirmasi password tidak cocok.');
                  return;
                }

                setSavingProfile(true);
                setProfileError('');
                setProfileSuccess('');

                const res = await updateProfile({
                  name: profileForm.name,
                  phone: profileForm.phone,
                  company: profileForm.company,
                  ...(profileForm.password ? { password: profileForm.password } : {}),
                });

                setSavingProfile(false);
                if (res.success) {
                  setProfileSuccess('Profil dan password berhasil diperbarui!');
                  setProfileForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
                  setTimeout(() => {
                    setIsProfileModalOpen(false);
                  }, 1500);
                } else {
                  setProfileError(res.error || 'Gagal memperbarui profil.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 bg-black border border-zinc-900 rounded text-xs text-zinc-500 font-mono cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    No. HP / WA
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Nama Brand
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-900 space-y-3">
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Ganti Password (Opsional)
                </span>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {profileForm.password && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Ulangi Password Baru
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      placeholder="Konfirmasi password baru"
                      className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase rounded hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-white text-black text-xs font-semibold uppercase rounded hover:bg-zinc-200 disabled:opacity-50"
                >
                  {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
