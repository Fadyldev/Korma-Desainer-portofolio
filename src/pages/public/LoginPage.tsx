import React, { useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, Shield, User, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client/dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Login gagal.');
    }
  };

  const autofillAdmin = () => {
    setEmail('admin@kroma.id');
    setPassword('admin123password');
    setErrorMsg('');
  };

  const autofillClient = () => {
    setEmail('client@nusantara.id');
    setPassword('client123password');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white tracking-widest text-xl mx-auto rounded">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase pt-2">
            Portal Masuk Studio
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Akses dashboard client untuk tracking project atau portal admin designer.
          </p>
        </div>

        {/* Form Card */}
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
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kroma.id / client@..."
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-800 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting ? 'Memverifikasi...' : 'Masuk ke Akun'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Autofill Buttons */}
          <div className="pt-4 border-t border-zinc-900 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block text-center">
              Akses Cepat Pengujian:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={autofillAdmin}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-[11px] font-mono rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3 h-3 text-amber-400" />
                Login Admin
              </button>
              <button
                type="button"
                onClick={autofillClient}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3 h-3 text-emerald-400" />
                Login Client
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500">
              Belum punya akun client?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-white hover:underline font-medium"
              >
                Daftar Sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
