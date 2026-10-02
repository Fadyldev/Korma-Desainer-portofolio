import React, { useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, User, Phone, Building, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { register, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/client/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Nama, email, dan password wajib diisi.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      navigate('/client/dashboard');
    } else {
      setErrorMsg(res.error || 'Registrasi gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white tracking-widest text-xl mx-auto rounded">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase pt-2">
            Registrasi Akun Klien
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Buat akun untuk memantau proses pengerjaan logo dan mengunduh berkas aset.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="budi@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Password (min 6 karakter) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nomor HP / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full pl-10 pr-3 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nama Bisnis / Brand
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="PT / CV / Brand"
                    className="w-full pl-10 pr-3 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {submitting ? 'Memproses Pendaftaran...' : 'Daftar Akun Klien'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-900">
            <p className="text-xs text-zinc-500">
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-white hover:underline font-medium"
              >
                Masuk di Sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
