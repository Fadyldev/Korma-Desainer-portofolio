import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, Project } from '../../types/index.ts';
import {
  Users,
  Plus,
  Edit3,
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const AdminClientsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { token } = useAuth();

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Client Detail Modal
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchClients();
  }, [token]);

  const viewClientDetail = async (clientId: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data.client);
        setClientProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openCreateModal = () => {
    setEditingClientId(null);
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      company: '',
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const openEditModal = (client: any) => {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      password: '',
      phone: client.phone || '',
      company: client.company || '',
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || (!editingClientId && (!form.email || !form.password))) {
      setErrorMsg('Nama, email, dan password wajib diisi.');
      return;
    }

    try {
      const url = editingClientId
        ? `/api/admin/clients/${editingClientId}`
        : '/api/admin/clients';
      const method = editingClientId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operasi gagal.');

      setIsFormOpen(false);
      setSuccessMsg(editingClientId ? 'Data client diperbarui.' : 'Client baru berhasil didaftarkan.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchClients();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Client Relationship
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Manajemen Data Klien
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Daftar akun klien yang terdaftar, riwayat project, dan penugasan project baru.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Klien Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Clients Table */}
      {loading ? (
        <div className="h-48 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
      ) : clients.length === 0 ? (
        <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-3">
          <Users className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Belum Ada Klien</h3>
          <p className="text-xs text-zinc-400">Daftarkan akun klien pertama Anda sekarang.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800/80 text-zinc-400 uppercase font-mono">
                <tr>
                  <th className="px-6 py-3.5">Nama & Perusahaan</th>
                  <th className="px-6 py-3.5">Kontak</th>
                  <th className="px-6 py-3.5">Total Project</th>
                  <th className="px-6 py-3.5">Tanggal Registrasi</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono text-zinc-300">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm font-sans">{c.name}</div>
                      <div className="text-[11px] text-zinc-500">
                        {c.company ? `Brand: ${c.company}` : 'Personal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200">
                        {c.project_count} Project
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {c.created_at?.split('T')[0] || c.created_at}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => viewClientDetail(c.id)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[11px]"
                      >
                        Detail & Project
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-900"
                        title="Edit Info"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLIENT DETAIL MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Profil & Riwayat Klien
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedClient.name}</h2>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-400 mt-2">
                <span>Email: {selectedClient.email}</span>
                <span>•</span>
                <span>Perusahaan: {selectedClient.company || '—'}</span>
                <span>•</span>
                <span>HP: {selectedClient.phone || '—'}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-white" />
                  Daftar Project Klien ({clientProjects.length})
                </h3>

                <button
                  onClick={() => {
                    setSelectedClient(null);
                    navigate('/admin/projects');
                  }}
                  className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1"
                >
                  Kelola di Halaman Projects <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {clientProjects.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono py-4">
                  Klien ini belum memiliki project.
                </p>
              ) : (
                <div className="space-y-2">
                  {clientProjects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-black border border-zinc-800/80 rounded flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white text-xs">{p.title}</div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          {p.category} • Progress: {p.progress}% • Deadline: {p.deadline}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold rounded hover:bg-zinc-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-md w-full p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingClientId ? 'Edit Informasi Klien' : 'Daftarkan Klien Baru'}
              </h2>
              <p className="text-xs text-zinc-400">
                Akun ini dapat digunakan klien untuk login ke Client Dashboard.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama Lengkap Klien *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required={!editingClientId}
                  disabled={!!editingClientId}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="client@perusahaan.com"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  {editingClientId ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingClientId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    No. HP / WA
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Perusahaan / Brand
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="PT Nusantara..."
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase rounded hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-xs font-semibold uppercase rounded hover:bg-zinc-200"
                >
                  {editingClientId ? 'Simpan Data' : 'Daftarkan Klien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
