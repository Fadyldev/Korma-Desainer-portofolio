import React, { useState } from 'react';
import { useRouter } from '../utils/router.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useContent } from '../context/ContentContext.tsx';
import { Menu, X, ArrowUpRight, Shield, FolderKanban, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { getText } = useContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang', href: '/about' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Layanan', href: '/services' },
    { label: 'Kontak', href: '/contact' },
  ];

  const handleNav = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold text-white tracking-widest text-lg group-hover:border-zinc-400 transition-colors">
            K
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider text-white uppercase block leading-none">
              KROMA
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-mono block mt-1">
              Logo & Identity
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = path === link.href;
            return (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`text-sm font-medium transition-colors tracking-wide relative py-1 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'admin' ? (
                <button
                  onClick={() => handleNav('/admin')}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-amber-500/40 text-amber-300 text-xs font-medium rounded hover:bg-zinc-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Admin Portal
                </button>
              ) : (
                <button
                  onClick={() => handleNav('/client/dashboard')}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded hover:bg-zinc-800 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                  Dashboard Klien
                </button>
              )}

              <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                <span className="text-xs text-zinc-300 font-medium max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded hover:bg-zinc-900"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('/login')}
                className="text-xs uppercase tracking-wider font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => handleNav('/contact')}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold bg-white text-black hover:bg-zinc-200 px-4 py-2.5 rounded transition-all"
              >
                Mulai Project
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded border border-zinc-800 bg-zinc-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`text-left text-base font-medium py-2 ${
                  path === link.href ? 'text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-xs text-zinc-400 mb-1">
                  Login sebagai <span className="text-white font-medium">{user.name}</span> ({user.role})
                </div>
                {user.role === 'admin' ? (
                  <button
                    onClick={() => handleNav('/admin')}
                    className="w-full text-center py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium rounded"
                  >
                    Buka Admin Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('/client/dashboard')}
                    className="w-full text-center py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium rounded"
                  >
                    Buka Dashboard Klien
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 border border-zinc-800 text-zinc-400 hover:text-white text-sm rounded"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full text-center py-2.5 border border-zinc-800 text-zinc-300 text-sm font-medium rounded"
                >
                  Masuk
                </button>
                <button
                  onClick={() => handleNav('/contact')}
                  className="w-full text-center py-2.5 bg-white text-black text-sm font-semibold rounded"
                >
                  Mulai Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
