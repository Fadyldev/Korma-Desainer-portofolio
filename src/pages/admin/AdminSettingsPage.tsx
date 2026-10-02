import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  Server,
  Key,
  Download,
  Table,
  RefreshCw,
  Eye,
  FileCode,
} from 'lucide-react';

interface TableMeta {
  name: string;
  count: number;
}

export const AdminSettingsPage: React.FC = () => {
  const { user, token, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Database Explorer State
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [activeTable, setActiveTable] = useState<string>('contact_messages');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const fetchTables = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/admin/database/tables', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        if (data.tables && data.tables.length > 0) {
          // If activeTable not set or not in list, pick first
          const current = data.tables.find((t: TableMeta) => t.name === activeTable)
            ? activeTable
            : data.tables[0].name;
          fetchTableRows(current);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchTableRows = async (tableName: string) => {
    setActiveTable(tableName);
    try {
      const res = await fetch(`/api/admin/database/table/${tableName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTableRows(data.rows || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTables();
    }
  }, [token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama tidak boleh kosong.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await updateProfile({
      name,
      phone,
      company,
      ...(password ? { password } : {}),
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Profil dan kredensial admin berhasil diperbarui!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Konfigurasi & Database Control
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Pengaturan Akun & Database Explorer
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola profil desainer, ganti kata sandi, dan inspeksi seluruh tabel database relasional secara real-time.
          </p>
        </div>

        <a
          href="/api/admin/database/download"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white rounded text-xs font-mono flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Download File .sqlite
        </a>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top 2 Columns: Profile & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile & Security Form */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
            Profil Administrator & Kata Sandi
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Nama Lengkap / Studio
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                Alamat Email Login
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-black border border-zinc-900 rounded text-xs text-zinc-500 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-600 font-mono mt-1 block">
                Email akun admin primer terikat dengan sistem autentikasi.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama Brand Studio
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 space-y-4">
              <span className="text-xs font-mono uppercase text-amber-400 font-semibold block">
                Ubah Password Akses (Opsional)
              </span>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              {password && (
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* System & Architecture Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Status Fisik Database
            </h3>
            <div className="space-y-3 text-xs text-zinc-400">
              <div className="p-3 bg-black border border-zinc-900 rounded">
                <span className="text-white font-medium block mb-1">File Path di Server:</span>
                <span className="text-emerald-400 font-mono break-all text-[11px]">/data/database.sqlite</span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Engine SQL relasional mandiri (*self-hosted*), tidak membutuhkan cloud subscription pihak ketiga.
                </p>
              </div>

              <div className="p-3 bg-black border border-zinc-900 rounded">
                <span className="text-white font-medium block mb-1">Keamanan & Enkripsi:</span>
                <span className="text-emerald-400 font-mono">Bcrypt (Salt 10) + JWT Bearer</span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Password dienkripsi satu arah sebelum tersimpan di tabel <code>users</code>.
                </p>
              </div>

              <div className="p-3 bg-black border border-zinc-900 rounded">
                <span className="text-white font-medium block mb-1">Jumlah Tabel Aktif:</span>
                <span className="text-emerald-400 font-mono">{tables.length} Tabel Relasional</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded p-6 space-y-3 text-xs text-zinc-400">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Kredensial Default Demo
            </h3>
            <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[11px] space-y-2">
              <div>
                <span className="text-amber-300 font-semibold block">Admin Demo:</span>
                <span>admin@kroma.id / admin123password</span>
              </div>
              <div className="pt-2 border-t border-zinc-900">
                <span className="text-emerald-300 font-semibold block">Client Demo:</span>
                <span>client@nusantara.id / client123password</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL LIVE DATABASE EXPLORER (MIRIP SUPABASE TABLE EDITOR) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Live Database Table Inspector
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspeksi langsung isi data mentah di setiap tabel database SQLite.
            </p>
          </div>

          <button
            onClick={fetchTables}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {tables.map((tbl) => (
            <button
              key={tbl.name}
              onClick={() => fetchTableRows(tbl.name)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer ${
                activeTable === tbl.name
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{tbl.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  activeTable === tbl.name ? 'bg-black text-white' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {tbl.count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Table Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>
              Menampilkan data tabel: <strong className="text-emerald-400">{activeTable}</strong> ({tableRows.length} baris)
            </span>
          </div>

          <div className="bg-black border border-zinc-900 rounded overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              {tableRows.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-600 font-mono">
                  Tabel ini belum memiliki data baris.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 sticky top-0 uppercase">
                    <tr>
                      {Object.keys(tableRows[0]).map((col) => (
                        <th key={col} className="px-4 py-2.5 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {tableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40">
                        {Object.entries(row).map(([k, val]: [string, any], cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap max-w-xs truncate">
                            {k === 'password_hash' ? (
                              <span className="text-zinc-600 text-[10px] italic">
                                [Bcrypt Hash: {String(val).substring(0, 15)}...]
                              </span>
                            ) : val === null || val === undefined ? (
                              <span className="text-zinc-600 italic">null</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
