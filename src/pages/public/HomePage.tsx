import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useContent } from '../../context/ContentContext.tsx';
import { PortfolioItem, Service } from '../../types/index.ts';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { getText } = useContent();

  const [featuredWorks, setFeaturedWorks] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [portRes, servRes] = await Promise.all([
          fetch('/api/portfolio?featured=1'),
          fetch('/api/services'),
        ]);

        if (portRes.ok) {
          const portData = await portRes.json();
          setFeaturedWorks(portData.slice(0, 4));
        }

        if (servRes.ok) {
          const servData = await servRes.json();
          setServices(servData);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const processSteps = [
    { num: '01', title: 'Briefing', desc: 'Eksplorasi visi, identitas brand, dan target audiens.' },
    { num: '02', title: 'Research', desc: 'Analisis kompetitor dan pemetaan diferensiasi visual.' },
    { num: '03', title: 'Concept', desc: 'Pembuatan sketsa & eksplorasi arah bentuk dasar geometris.' },
    { num: '04', title: 'Design', desc: 'Digitalisasi vektor presisi matematis dan pengujian skala.' },
    { num: '05', title: 'Revision', desc: 'Penyempurnaan detail tipografi, kurva, dan palet warna.' },
    { num: '06', title: 'Finalization', desc: 'Finalisasi master format dan pedoman penggunaan logo.' },
    { num: '07', title: 'Handover', desc: 'Serah terima file master lengkap dan hak cipta komersial.' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 border-b border-zinc-900 overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl">
            {/* Live CMS Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs font-mono uppercase tracking-wider mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {getText('hero_badge', 'Professional Logo & Identity Designer')}
            </div>

            {/* Live CMS Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] uppercase mb-8">
              {getText(
                'hero_title',
                'Menciptakan Identitas Visual Logo yang Ikonik & Berkarakter'
              )}
            </h1>

            {/* Live CMS Subtitle */}
            <p className="text-lg sm:text-xl text-zinc-400 font-normal leading-relaxed max-w-2xl mb-12">
              {getText(
                'hero_subtitle',
                'Membantu brand, korporasi, dan UMKM tampil menonjol dengan sistem identitas visual yang presisi, timeless, dan bermakna mendalam.'
              )}
            </p>

            {/* Live CMS Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/portfolio')}
                className="px-7 py-4 bg-white text-black font-semibold text-sm rounded hover:bg-zinc-200 transition-all flex items-center gap-2 group cursor-pointer"
              >
                {getText('hero_cta_primary', 'Lihat Portfolio')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="px-7 py-4 bg-zinc-900 border border-zinc-800 text-white font-medium text-sm rounded hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                {getText('hero_cta_secondary', 'Mulai Project')}
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-20 pt-10 border-t border-zinc-900/80 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white font-mono">140+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                Klien Puas & Brand Sukses
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white font-mono">8+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                Tahun Pengalaman Spesialis
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white font-mono">100%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                Original & Hak Cipta Penuh
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white font-mono">Real-time</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                Portal Tracking Klien Aktif
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PORTFOLIO SECTION */}
      <section className="py-24 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                Selected Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
                Featured Projects
              </h2>
            </div>
            <button
              onClick={() => navigate('/portfolio')}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer group"
            >
              Semua Portfolio
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-zinc-900 animate-pulse rounded border border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredWorks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPortfolio(item)}
                  className="group relative bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all rounded overflow-hidden cursor-pointer"
                >
                  <div className="aspect-[16/10] bg-zinc-900 overflow-hidden relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider text-zinc-300 border border-white/10">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-mono">
                      <span>{item.client_name}</span>
                      <span>{item.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                      <span>Tools: {item.tools}</span>
                      <span className="text-white inline-flex items-center gap-1 group-hover:underline">
                        Detail <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. THREE CORE SERVICES SUMMARY */}
      <section className="py-24 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              Layanan Utama
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Paket Desain Logo & Identitas
            </h2>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Tersedia dalam 3 kategori terarah sesuai tahap perkembangan bisnis dan kebutuhan spesifik Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-black border border-zinc-800/90 rounded p-8 flex flex-col justify-between hover:border-zinc-600 transition-all relative group"
              >
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                    {service.category}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="py-4 border-y border-zinc-900 mb-6">
                    <span className="text-xs text-zinc-500 uppercase block mb-1">Mulai Dari</span>
                    <span className="text-2xl font-bold text-white font-mono">
                      {formatIDR(service.starting_price)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                      Apa Yang Anda Dapatkan:
                    </span>
                    {Array.isArray(service.features) &&
                      service.features.slice(0, 5).map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{f}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/services')}
                  className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white text-xs uppercase tracking-wider font-semibold rounded transition-all text-center"
                >
                  {service.cta_text || 'Lihat Detail Paket'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DESIGN PROCESS */}
      <section className="py-24 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
              Metodologi Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
              Alur Kerja Profesional
            </h2>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Setiap tahapan dikerjakan secara transparan dan dapat dipantau langsung oleh Anda melalui Client Dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => (
              <div
                key={step.num}
                className="p-6 bg-zinc-950 border border-zinc-900 rounded relative group hover:border-zinc-800 transition-colors"
              >
                <div className="text-2xl font-mono font-bold text-zinc-700 group-hover:text-white transition-colors mb-3">
                  {step.num}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT PREVIEW & PHILOSOPHY */}
      <section className="py-24 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
                Filosofi Desain
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
                {getText('about_title', 'Lead Identity & Logo Specialist')}
              </h2>
              <blockquote className="text-lg text-zinc-300 italic border-l-2 border-zinc-700 pl-4 py-1 leading-relaxed">
                "{getText(
                  'about_philosophy',
                  'Logo bukan sekadar gambar dekoratif, melainkan janji visual pertama sebuah brand kepada dunianya. Simpel, fungsional, dan berakar pada nilai esensial brand Anda.'
                )}"
              </blockquote>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {getText(
                  'about_bio',
                  'Lebih dari 8 tahun mendedikasikan diri dalam merancang logo berstandar internasional. Berfokus pada kesederhanaan geometris, kekuatan tipografi, dan fleksibilitas identitas brand di era digital.'
                )}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-zinc-300 transition-colors"
                >
                  Pelajari Lebih Lanjut Profil Designer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-black border border-zinc-800 rounded p-8 space-y-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  Alasan Memilih Kroma Studio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <Compass className="w-4 h-4 text-zinc-400" />
                      Presisi Geometris
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Konstruksi vektor dengan grid geometris yang konsisten dan seimbang.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" />
                      Hak Cipta Eksklusif
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sertifikat dan pengalihan 100% hak cipta komersial kepada Anda.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <Sliders className="w-4 h-4 text-zinc-400" />
                      Client Dashboard
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Login kapan saja untuk memantau progress pengerjaan dan download aset.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <Zap className="w-4 h-4 text-zinc-400" />
                      File Master Lengkap
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Vector AI, SVG, EPS, PDF, hingga PNG transparan berbagai resolusi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-24 border-b border-zinc-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Mulai Sekarang
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            {getText('contact_headline', 'Siap Membangun Karakter Brand Anda?')}
          </h2>
          <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {getText(
              'contact_description',
              'Konsultasikan kebutuhan logo dan identitas visual brand Anda. Saya menerima inquiry untuk project baru UMKM, korporasi, maupun custom identity.'
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white text-black font-semibold text-sm rounded hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              Kirim Pesan & Konsultasi
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-medium text-sm rounded hover:bg-zinc-800 transition-all"
            >
              Lihat Galeri Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: Portfolio Detail Preview */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedPortfolio(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white text-lg p-2"
            >
              ✕
            </button>

            <div className="aspect-[16/9] bg-zinc-900 rounded overflow-hidden mb-6 border border-zinc-800">
              <img
                src={selectedPortfolio.image_url}
                alt={selectedPortfolio.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                  {selectedPortfolio.category}
                </span>
                <span>•</span>
                <span>Klien: {selectedPortfolio.client_name}</span>
                <span>•</span>
                <span>Tahun: {selectedPortfolio.year}</span>
              </div>

              <h3 className="text-2xl font-bold text-white">{selectedPortfolio.title}</h3>

              <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
                <div>
                  <h4 className="text-xs uppercase font-mono text-zinc-500 mb-1">Deskripsi Project</h4>
                  <p>{selectedPortfolio.description}</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-mono text-zinc-500 mb-1">Konsep Desain</h4>
                  <p className="text-zinc-400 italic">"{selectedPortfolio.concept}"</p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-mono text-zinc-500 mb-1">Software & Tools</h4>
                  <p className="text-zinc-400 font-mono text-xs">{selectedPortfolio.tools}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => setSelectedPortfolio(null)}
                  className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs uppercase font-semibold rounded hover:bg-zinc-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
