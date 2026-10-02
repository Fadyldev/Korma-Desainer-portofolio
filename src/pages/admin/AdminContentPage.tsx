import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useContent } from '../../context/ContentContext.tsx';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const { token } = useAuth();
  const { refreshContent } = useContent();

  const [formData, setFormData] = useState<Record<string, string>>({
    hero_badge: '',
    hero_title: '',
    hero_subtitle: '',
    hero_cta_primary: '',
    hero_cta_secondary: '',
    about_name: '',
    about_title: '',
    about_bio: '',
    about_philosophy: '',
    about_experience: '',
    about_skills: '',
    about_tools: '',
    contact_headline: '',
    contact_description: '',
    contact_email: '',
    contact_phone: '',
    contact_location: '',
    footer_text: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadCMSData() {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load CMS content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCMSData();
  }, []);

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setSuccessMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menyimpan konten.');
      }

      await refreshContent();
      setSuccessMsg('Konten website berhasil disimpan! Perubahan langsung tampil di halaman publik.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-zinc-500 font-mono text-xs">
        Memuat data CMS dari database...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Content Management System
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Manajemen Konten Website
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Ubah seluruh tulisan, headline, dan informasi kontak website public tanpa menyentuh kode program.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Hero Section */}
        <div className="bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
            1. Hero Section (Halaman Utama)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Badge Headline Hero
              </label>
              <input
                type="text"
                value={formData.hero_badge || ''}
                onChange={(e) => handleChange('hero_badge', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Judul Utama Hero (Headline) *
              </label>
              <input
                type="text"
                required
                value={formData.hero_title || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                placeholder="Menciptakan Identitas Visual Logo yang Ikonik..."
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-500 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Deskripsi Subtitle Hero *
              </label>
              <textarea
                rows={3}
                required
                value={formData.hero_subtitle || ''}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-500 font-mono leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Label Tombol Primer (CTA 1)
                </label>
                <input
                  type="text"
                  value={formData.hero_cta_primary || ''}
                  onChange={(e) => handleChange('hero_cta_primary', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Label Tombol Sekunder (CTA 2)
                </label>
                <input
                  type="text"
                  value={formData.hero_cta_secondary || ''}
                  onChange={(e) => handleChange('hero_cta_secondary', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: About & Philosophy */}
        <div className="bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
            2. Tentang Designer & Filosofi
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Nama Designer
                </label>
                <input
                  type="text"
                  value={formData.about_name || ''}
                  onChange={(e) => handleChange('about_name', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Gelar / Spesialisasi
                </label>
                <input
                  type="text"
                  value={formData.about_title || ''}
                  onChange={(e) => handleChange('about_title', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Filosofi Desain
              </label>
              <textarea
                rows={2}
                value={formData.about_philosophy || ''}
                onChange={(e) => handleChange('about_philosophy', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono italic"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Biografi & Profil Singkat
              </label>
              <textarea
                rows={3}
                value={formData.about_bio || ''}
                onChange={(e) => handleChange('about_bio', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Pengalaman & Jam Terbang
              </label>
              <textarea
                rows={2}
                value={formData.about_experience || ''}
                onChange={(e) => handleChange('about_experience', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Skills (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.about_skills || ''}
                  onChange={(e) => handleChange('about_skills', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Software & Tools (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.about_tools || ''}
                  onChange={(e) => handleChange('about_tools', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Studio Info */}
        <div className="bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
            3. Informasi Kontak & Footer
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Headline Section Kontak
              </label>
              <input
                type="text"
                value={formData.contact_headline || ''}
                onChange={(e) => handleChange('contact_headline', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Deskripsi Section Kontak
              </label>
              <textarea
                rows={2}
                value={formData.contact_description || ''}
                onChange={(e) => handleChange('contact_description', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Email Kontak Publik
                </label>
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={formData.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Lokasi Studio
                </label>
                <input
                  type="text"
                  value={formData.contact_location || ''}
                  onChange={(e) => handleChange('contact_location', e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                Teks Hak Cipta Footer
              </label>
              <input
                type="text"
                value={formData.footer_text || ''}
                onChange={(e) => handleChange('footer_text', e.target.value)}
                className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Menyimpan...' : 'Simpan Seluruh Perubahan CMS'}
          </button>
        </div>
      </form>
    </div>
  );
};
