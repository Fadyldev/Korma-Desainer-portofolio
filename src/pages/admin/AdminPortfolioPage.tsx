import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PortfolioItem } from '../../types/index.ts';
import {
  Plus,
  Trash2,
  Edit3,
  Star,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminPortfolioPage: React.FC = () => {
  const { token } = useAuth();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    category: 'UMKM',
    description: '',
    concept: '',
    year: String(new Date().getFullYear()),
    tools: 'Adobe Illustrator, Figma',
    image_url: '',
    is_featured: false,
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      title: '',
      client_name: '',
      category: 'UMKM',
      description: '',
      concept: '',
      year: String(new Date().getFullYear()),
      tools: 'Adobe Illustrator, Figma',
      image_url: '',
      is_featured: false,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      client_name: item.client_name,
      category: item.category,
      description: item.description,
      concept: item.concept,
      year: item.year,
      tools: item.tools,
      image_url: item.image_url,
      is_featured: item.is_featured === 1,
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');

      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (err: any) {
      setErrorMsg('Gagal mengunggah file: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.client_name || !form.image_url) {
      setErrorMsg('Nama project, nama client, dan gambar wajib diisi.');
      return;
    }

    try {
      const url = editingItem
        ? `/api/admin/portfolio/${editingItem.id}`
        : '/api/admin/portfolio';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Operasi gagal.');
      }

      setIsModalOpen(false);
      setSuccessMsg(
        editingItem ? 'Portfolio berhasil diperbarui!' : 'Portfolio baru berhasil ditambahkan!'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        setSuccessMsg('Portfolio berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchItems();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    try {
      const updated = {
        ...item,
        is_featured: item.is_featured === 1 ? 0 : 1,
      };
      const res = await fetch(`/api/admin/portfolio/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Manajemen Konten Publik
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Kelola Galeri Portfolio
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tambah, edit, dan atur visual karya logo yang ditampilkan kepada calon klien.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Karya Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of Portfolio Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-3">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Belum Ada Portfolio</h3>
          <p className="text-xs text-zinc-400">Tambahkan karya logo pertama Anda sekarang.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded uppercase"
          >
            Tambah Portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-950 border border-zinc-900 rounded overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] bg-zinc-900 relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFeatured(item)}
                      title={item.is_featured === 1 ? 'Hapus dari Featured' : 'Jadikan Featured'}
                      className={`p-1.5 rounded backdrop-blur-md border text-xs transition-colors ${
                        item.is_featured === 1
                          ? 'bg-amber-500/80 border-amber-400 text-black font-bold'
                          : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono uppercase text-zinc-300 border border-white/10">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>{item.client_name}</span>
                    <span>{item.year}</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-zinc-500 italic line-clamp-1">
                    Konsep: "{item.concept}"
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 pt-3 border-t border-zinc-900/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[120px]">
                  {item.tools}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    title="Edit Portfolio"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    title="Hapus Portfolio"
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
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingItem ? 'Edit Karya Portfolio' : 'Tambah Portfolio Baru'}
              </h2>
              <p className="text-xs text-zinc-400">
                Isi rincian project logo untuk ditampilkan di halaman portfolio publik.
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
                    Nama Project *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Nusantara Coffee Roasters"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Nama Klien / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Contoh: PT Nusantara Roastery"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Kategori *
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
                    Tahun Project
                  </label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Tools / Software
                  </label>
                  <input
                    type="text"
                    value={form.tools}
                    onChange={(e) => setForm({ ...form, tools: e.target.value })}
                    placeholder="Adobe Illustrator, Figma"
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Deskripsi Singkat Project
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Penjelasan latar belakang dan hasil desain logo..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Konsep Desain & Makna Geometri
                </label>
                <textarea
                  rows={2}
                  value={form.concept}
                  onChange={(e) => setForm({ ...form, concept: e.target.value })}
                  placeholder="Filosofi bentuk dasar dan simbolisme..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono italic"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-zinc-400">
                  Gambar Mockup / Logo *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-black border border-zinc-800 hover:border-zinc-700 rounded text-xs text-zinc-300 font-mono transition-colors">
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span>{uploadingImage ? 'Mengunggah...' : 'Upload File Gambar'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="Atau tempel URL gambar..."
                      className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {form.image_url && (
                  <div className="mt-2 aspect-[16/9] w-48 rounded bg-zinc-900 overflow-hidden border border-zinc-800">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded bg-black border-zinc-800 text-white focus:ring-0"
                  />
                  <span>Tampilkan di Section "Featured Projects" Homepage</span>
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-sm w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase">Hapus Portfolio?</h3>
            <p className="text-xs text-zinc-400">
              Apakah Anda yakin ingin menghapus item ini dari galeri portfolio? Tindakan ini tidak dapat dibatalkan.
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
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
