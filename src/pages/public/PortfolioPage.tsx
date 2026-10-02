import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { PortfolioItem } from '../../types/index.ts';
import { ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { navigate } = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  const categories = ['ALL', 'UMKM', 'BUSINESS / CORPORATE', 'PERSONAL / CUSTOM'];

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      try {
        const url = selectedCategory === 'ALL'
          ? '/api/portfolio'
          : `/api/portfolio?category=${encodeURIComponent(selectedCategory)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [selectedCategory]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.client_name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.concept.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Karya Terpilih
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            Galeri Portfolio
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Eksplorasi karya identitas visual, monogram, dan desain logo yang dirancang dengan presisi geometris dan makna konseptual mendalam.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-zinc-900 py-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-semibold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari project / client..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-zinc-950 border border-zinc-900 rounded">
            <p className="text-zinc-500 text-sm font-mono">
              Tidak ada portfolio yang sesuai dengan filter atau kata kunci pencarian.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-zinc-900 text-xs text-white rounded border border-zinc-800 hover:bg-zinc-800"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className="group bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all rounded overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="aspect-[4/3] bg-zinc-900 overflow-hidden relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-zinc-300 border border-white/10">
                      {item.category}
                    </div>
                    {item.is_featured === 1 && (
                      <div className="absolute top-3 left-3 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider text-amber-300 border border-amber-500/30">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>{item.client_name}</span>
                      <span>{item.year}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span className="truncate max-w-[180px]">{item.tools}</span>
                  <span className="text-white flex items-center gap-1 group-hover:underline">
                    Lihat Konsep <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="pt-12 border-t border-zinc-900 text-center space-y-4">
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            Ingin Identitas Visual Seperti Ini Untuk Brand Anda?
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Mari konsultasikan ide dan preferensi logo Anda secara gratis untuk mendapatkan rekomendasi konsep terbaik.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors"
          >
            Mulai Konsultasi Project
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] bg-zinc-900 rounded overflow-hidden mb-6 border border-zinc-800">
              <img
                src={activeModalItem.image_url}
                alt={activeModalItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                  {activeModalItem.category}
                </span>
                <span>•</span>
                <span>Klien: {activeModalItem.client_name}</span>
                <span>•</span>
                <span>Tahun: {activeModalItem.year}</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {activeModalItem.title}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {activeModalItem.description}
                </p>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
                <h4 className="text-xs uppercase font-mono text-zinc-400 font-semibold">
                  Konsep & Filosofi Bentuk
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "{activeModalItem.concept}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-4">
                <div>
                  <span className="text-zinc-500 block mb-1">Software & Eksekusi:</span>
                  <span className="text-white">{activeModalItem.tools}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Status Lisensi:</span>
                  <span className="text-emerald-400">100% Hak Cipta Klien</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded border border-zinc-800 hover:bg-zinc-800"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setActiveModalItem(null);
                    navigate('/contact');
                  }}
                  className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded hover:bg-zinc-200"
                >
                  Pesan Desain Serupa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
