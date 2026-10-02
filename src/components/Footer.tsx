import React from 'react';
import { useRouter } from '../utils/router.tsx';
import { useContent } from '../context/ContentContext.tsx';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const { getText } = useContent();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Studio Profile */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white tracking-widest text-base">
                K
              </div>
              <span className="font-bold text-lg tracking-wider text-white uppercase">
                KROMA STUDIO
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Studio spesialis desain logo dan sistem identitas visual. Merancang karya bernilai tinggi yang autentik, berdaya tahan jangka panjang, dan memperkuat citra brand modern.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{getText('contact_email', 'designer@kromastudio.id')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                <span>{getText('contact_phone', '+62 812-8888-9999')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{getText('contact_location', 'Jakarta, Indonesia')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition-colors"
                >
                  Tentang Designer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/portfolio')}
                  className="hover:text-white transition-colors"
                >
                  Galeri Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services')}
                  className="hover:text-white transition-colors"
                >
                  Kategori Layanan
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors"
                >
                  Inquiry & Kontak
                </button>
              </li>
            </ul>
          </div>

          {/* Client & Access */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Client Portal & Akses
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Klien dapat login ke dashboard personal untuk memantau tahapan riset, konsep vektor, revisi, hingga download master files logo.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 rounded transition-colors"
              >
                Login Klien
                <ArrowUpRight className="w-3 h-3 text-zinc-400" />
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-800/80 px-3.5 py-2 rounded transition-colors"
              >
                Registrasi Klien Baru
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>
            {getText(
              'footer_text',
              '© 2026 Kroma Studio. All rights reserved. Crafted with precision for forward-thinking brands.'
            )}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-zinc-600 hover:text-zinc-400 text-[11px]"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
