import React from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useContent } from '../../context/ContentContext.tsx';
import { ArrowRight, Check, Award, Compass, PenTool, LayoutGrid, Terminal } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useRouter();
  const { getText } = useContent();

  const skillsList = getText(
    'about_skills',
    'Logo Marks, Geometric Typography, Monogram, Visual Identity System, Brand Guidelines Book, Vector Precision Engineering'
  )
    .split(',')
    .map((s) => s.trim());

  const toolsList = getText(
    'about_tools',
    'Adobe Illustrator, Glyphs, Figma, Affinity Designer, Adobe Photoshop'
  )
    .split(',')
    .map((t) => t.trim());

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Profile Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono uppercase tracking-wider">
            Profil Designer & Studio
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight uppercase">
            {getText('about_name', 'Fikri Maulana')}
          </h1>
          <p className="text-xl text-zinc-400 font-mono">
            {getText('about_title', 'Lead Identity & Logo Specialist')}
          </p>
        </div>

        {/* Bio and Philosophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-zinc-900 pt-12">
          <div className="md:col-span-5 space-y-6">
            <div className="aspect-[4/5] bg-zinc-900 border border-zinc-800 rounded overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80"
                alt="Designer Portrait"
                className="w-full h-full object-cover grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-xs font-mono text-zinc-300">
                  Jakarta, Indonesia • Est. 2018
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Pencapaian & Jam Terbang
              </h4>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>140+ Proyek Logo & Brand Identity Selesai</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Dipercaya UMKM, Korporasi & Personal Creator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>Spesialisasi Tipografi & Grid Presisi Geometris</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Perjalanan & Dedikasi
              </h2>
              <p className="text-base text-zinc-300 leading-relaxed">
                {getText(
                  'about_bio',
                  'Lebih dari 8 tahun mendedikasikan diri dalam merancang logo berstandar internasional. Berfokus pada kesederhanaan geometris, kekuatan tipografi, dan fleksibilitas identitas brand di era digital.'
                )}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {getText(
                  'about_experience',
                  'Telah dipercaya oleh 140+ klien dari sektor teknologi, retail, F&B, dan institusi terkemuka di Asia Tenggara dan global. Setiap logo dibangun dengan riset mendalam agar tidak hanya indah saat dilihat, tapi juga relevan hingga puluhan tahun mendatang.'
                )}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Filosofi Desain
              </h2>
              <blockquote className="text-lg text-white font-serif italic border-l-2 border-white pl-4 py-1 leading-relaxed">
                "{getText(
                  'about_philosophy',
                  'Logo bukan sekadar gambar dekoratif, melainkan janji visual pertama sebuah brand kepada dunianya. Simpel, fungsional, dan berakar pada nilai esensial brand Anda.'
                )}"
              </blockquote>
            </div>

            {/* Skills & Tools Section */}
            <div className="space-y-6 pt-6 border-t border-zinc-900">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5" />
                  Spesialisasi & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Software & Tools Standar Industri
                </h3>
                <div className="flex flex-wrap gap-2">
                  {toolsList.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-black border border-zinc-800 text-zinc-400 text-xs rounded font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Professional Standard */}
            <div className="space-y-4 pt-6 border-t border-zinc-900">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                Cara Kerja Profesional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400">
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                  <span className="font-semibold text-white block mb-1">
                    1. Transparansi Penuh
                  </span>
                  Klien mendapatkan akses langsung ke Client Portal untuk memantau status riset, konsep, dan timeline.
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                  <span className="font-semibold text-white block mb-1">
                    2. Hak Cipta Komersial 100%
                  </span>
                  Surat pengalihan hak kekayaan intelektual (HAKI) diserahkan secara resmi setelah proyek tuntas.
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                  <span className="font-semibold text-white block mb-1">
                    3. Berkas Vektor Standar Industri
                  </span>
                  Format lengkap siap cetak dan siap tayang digital (AI, EPS, SVG, PNG, PDF, Brand Manual).
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                  <span className="font-semibold text-white block mb-1">
                    4. Revisi Konstruktif
                  </span>
                  Fokus pada perbaikan terarah sesuai kesepakatan brief awal hingga hasil optimal tercapai.
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8">
              <button
                onClick={() => navigate('/contact')}
                className="px-6 py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
              >
                Diskusikan Brand Anda
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
