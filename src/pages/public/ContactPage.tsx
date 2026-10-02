import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext.tsx';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { getText } = useContent();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Semua kolom formulir wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan.');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Konsultasi & Inquiry
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            Hubungi Studio
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            {getText(
              'contact_description',
              'Konsultasikan kebutuhan logo dan identitas visual brand Anda. Saya menerima inquiry untuk project baru UMKM, korporasi, maupun custom identity.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-zinc-900 pt-12">
          {/* Direct Info */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Informasi Studio
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Anda juga dapat menghubungi secara langsung melalui kontak resmi di bawah ini untuk konsultasi cepat.
              </p>
            </div>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-900 rounded">
                <Mail className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block mb-0.5 font-mono">Email Resmi</span>
                  <a
                    href={`mailto:${getText('contact_email', 'designer@kromastudio.id')}`}
                    className="hover:text-white transition-colors"
                  >
                    {getText('contact_email', 'designer@kromastudio.id')}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-900 rounded">
                <Phone className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block mb-0.5 font-mono">WhatsApp / Telepon</span>
                  <span>{getText('contact_phone', '+62 812-8888-9999')}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-900 rounded">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block mb-0.5 font-mono">Lokasi Studio</span>
                  <span>{getText('contact_location', 'Jakarta, Indonesia')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded text-xs text-zinc-400 space-y-1">
              <span className="text-white font-medium block">Jam Operasional:</span>
              <p>Senin – Jumat: 09:00 – 18:00 WIB</p>
              <p className="text-zinc-500">Respon dalam waktu maksimal 1x24 jam kerja.</p>
            </div>
          </div>

          {/* Real Contact Form */}
          <div className="md:col-span-7">
            <div className="bg-zinc-950 border border-zinc-800 rounded p-8 sm:p-10">
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                Kirim Pesan
              </h2>
              <p className="text-xs text-zinc-400 mb-6">
                Data formulir akan langsung tersimpan di sistem backend dan ditindaklanjuti oleh designer.
              </p>

              {success && (
                <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-start gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold block text-emerald-200">Pesan Berhasil Terkirim!</span>
                    Terima kasih telah menghubungi kami. Pesan Anda telah tersimpan di database dan kami akan segera membalas ke email Anda.
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/40 rounded flex items-start gap-3 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <span className="font-semibold block text-red-200">Gagal Mengirim</span>
                    {errorMsg}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nama Lengkap / Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Santoso (PT Maju Bersama)"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Alamat Email Aktif *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Detail Kebutuhan Logo & Pesan *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ceritakan tentang bidang bisnis Anda, visi brand, dan ekspektasi desain logo yang diinginkan..."
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    'Mengirim...'
                  ) : (
                    <>
                      Kirim Pesan Sekarang
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
