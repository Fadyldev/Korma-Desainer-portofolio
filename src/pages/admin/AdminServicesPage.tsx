import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Service } from '../../types/index.ts';
import {
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  Upload,
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { token } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form
  const [form, setForm] = useState({
    category: 'UMKM',
    name: '',
    description: '',
    featuresText: '',
    starting_price: 3500000,
    image_url: '',
    is_active: true,
    cta_text: 'Pilih Layanan',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchServices();
  }, [token]);

  const openCreateModal = () => {
    setEditingService(null);
    setForm({
      category: 'UMKM',
      name: '',
      description: '',
      featuresText: '3 Konsep Logo Original\n3 Putaran Revisi\nMaster Vector Files AI, EPS, SVG, PNG\nColor Guide & Mockup',
      starting_price: 3500000,
      image_url: '',
      is_active: true,
      cta_text: 'Pilih Layanan',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    const featStr = Array.isArray(service.features) ? service.features.join('\n') : '';
    setForm({
      category: service.category,
      name: service.name,
      description: service.description,
      featuresText: featStr,
      starting_price: service.starting_price,
      image_url: service.image_url || '',
      is_active: service.is_active === 1,
      cta_text: service.cta_text,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.starting_price) {
      setErrorMsg('Nama dan harga wajib diisi.');
      return;
    }

    const featuresArray = form.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      category: form.category,
      name: form.name,
      description: form.description,
      features: featuresArray,
      starting_price: Number(form.starting_price),
      image_url: form.image_url,
      is_active: form.is_active,
      cta_text: form.cta_text,
    };

    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menyimpan layanan.');
      }

      setIsModalOpen(false);
      setSuccessMsg(
        editingService ? 'Layanan berhasil diperbarui!' : 'Layanan baru berhasil dibuat!'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchServices();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        setSuccessMsg('Layanan berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchServices();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const updated = {
        ...service,
        is_active: service.is_active === 1 ? 0 : 1,
      };
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error('Error toggling service status:', err);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Katalog & Penawaran
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Kelola Kategori Layanan
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Atur paket layanan (UMKM, Corporate, Custom), harga mulai, daftar fitur, dan status penawaran.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Layanan Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-3">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Belum Ada Layanan</h3>
          <p className="text-xs text-zinc-400">Buat paket layanan pertama untuk ditampilkan di website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-zinc-950 border rounded p-6 flex flex-col justify-between transition-colors ${
                service.is_active === 1 ? 'border-zinc-800' : 'border-zinc-900 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-zinc-900 rounded text-[10px] font-mono uppercase tracking-wider text-zinc-300 border border-zinc-800">
                    {service.category}
                  </span>
                  <button
                    onClick={() => toggleActive(service)}
                    className="flex items-center gap-1.5 text-xs font-mono"
                    title="Klik untuk mengaktifkan / menonaktifkan"
                  >
                    {service.is_active === 1 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ToggleRight className="w-5 h-5" /> Aktif
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1">
                        <ToggleLeft className="w-5 h-5" /> Nonaktif
                      </span>
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{service.name}</h3>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {formatIDR(service.starting_price)}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Fitur & Deliverables:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-400">
                    {Array.isArray(service.features) &&
                      service.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    {Array.isArray(service.features) && service.features.length > 4 && (
                      <li className="text-[11px] text-zinc-500 pl-5">
                        +{service.features.length - 4} fitur lainnya
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">CTA: "{service.cta_text}"</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 hover:bg-zinc-800"
                    title="Edit Layanan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(service.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 rounded bg-zinc-900 hover:bg-zinc-800"
                    title="Hapus Layanan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h2>
              <p className="text-xs text-zinc-400">
                Atur kategori, harga mulai, serta cakupan fitur paket.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Kategori Layanan *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="UMKM">UMKM</option>
                    <option value="BUSINESS / CORPORATE">BUSINESS / CORPORATE</option>
                    <option value="PERSONAL / CUSTOM">PERSONAL / CUSTOM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Harga Mulai (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.starting_price}
                    onChange={(e) => setForm({ ...form, starting_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama Paket Layanan *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Brand Identity Starter (UMKM)"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Deskripsi Paket
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Fitur-Fitur (Tulis 1 baris per fitur) *
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="3 Konsep Logo Original&#10;3 Putaran Revisi&#10;Master Files AI, EPS, SVG, PNG&#10;Brand Color Palette"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Label Tombol CTA
                  </label>
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    URL Gambar Sampul (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded bg-black border-zinc-800 text-white"
                  />
                  <span>Tampilkan di halaman publik (Status Aktif)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase rounded hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-xs font-semibold uppercase rounded hover:bg-zinc-200"
                >
                  {editingService ? 'Simpan Perubahan' : 'Buat Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-sm w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase">Hapus Layanan?</h3>
            <p className="text-xs text-zinc-400">
              Apakah Anda yakin ingin menghapus paket layanan ini dari database?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-900 text-xs text-zinc-300 rounded border border-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
