import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { Service } from '../../types/index.ts';
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, FileCheck, Layers } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { navigate } = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Katalog Layanan
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            Paket Desain & Identitas Brand
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Pilihan paket terstruktur yang transparan dan terukur, dirancang untuk menjawab kebutuhan spesifik brand Anda dari tahap awal hingga skala korporasi.
          </p>
        </div>

        {/* 3 Categories Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-zinc-950 border border-zinc-800 rounded flex flex-col justify-between overflow-hidden hover:border-zinc-600 transition-all group"
              >
                <div>
                  {service.image_url && (
                    <div className="aspect-[16/9] bg-zinc-900 overflow-hidden relative">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider text-white border border-white/10">
                        {service.category}
                      </div>
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{service.name}</h2>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="p-4 bg-black border border-zinc-900 rounded">
                      <span className="text-[11px] text-zinc-500 uppercase font-mono block">
                        Investasi Mulai
                      </span>
                      <div className="text-2xl font-bold text-white font-mono mt-0.5">
                        {formatIDR(service.starting_price)}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
                        Spesifikasi Layanan:
                      </span>
                      <ul className="space-y-2.5">
                        {Array.isArray(service.features) &&
                          service.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0">
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full py-4 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {service.cta_text || 'Konsultasi Layanan Ini'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deliverables Assurance */}
        <div className="bg-zinc-950 border border-zinc-900 rounded p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
              Standar Output Setiap File Deliverable
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Semua paket layanan mencakup standar penyerahan berkas terlengkap untuk memastikan kemudahan aplikasi logo Anda di berbagai media digital maupun cetak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-zinc-400">
            <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
              <FileCheck className="w-5 h-5 text-white" />
              <span className="font-semibold text-white block">Format Vektor Master</span>
              <p>AI (Adobe Illustrator), EPS, and SVG vektor presisi tanpa pecah ukuran billboard.</p>
            </div>
            <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
              <Layers className="w-5 h-5 text-white" />
              <span className="font-semibold text-white block">Varian Warna Lengkap</span>
              <p>Full color, inverted dark mode, monochrome hitam-putih, dan grayscale resmi.</p>
            </div>
            <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="font-semibold text-white block">Live Timeline Tracking</span>
              <p>Pantau progress pengerjaan langsung di akun Client Portal Anda.</p>
            </div>
            <div className="p-4 bg-black border border-zinc-900 rounded space-y-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-semibold text-white block">Sertifikat Hak Cipta</span>
              <p>Pengalihan hak cipta resmi untuk penggunaan komersial seumur hidup.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
