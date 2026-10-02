import React, { useEffect, useState } from 'react';
import { useRouter } from '../../utils/router.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Project, ProjectUpdate, ProjectDeliverable } from '../../types/index.ts';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FileCode,
  Calendar,
  Layers,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const ClientProjectDetailPage: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { navigate } = useRouter();
  const { user, token } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const stages = [
    { key: 'Brief', label: '1. Brief' },
    { key: 'Research', label: '2. Research' },
    { key: 'Concept', label: '3. Concept' },
    { key: 'Design', label: '4. Design' },
    { key: 'Revision', label: '5. Revision' },
    { key: 'Final', label: '6. Final' },
    { key: 'Completed', label: '7. Completed' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadProject() {
      setLoading(true);
      setAccessDenied(false);
      setErrorMsg('');

      try {
        const res = await fetch(`/api/client/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 403) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (res.status === 404) {
          setErrorMsg('Project tidak ditemukan.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Gagal memuat data project.');
        }

        const data = await res.json();
        setProject(data.project);
        setUpdates(data.updates || []);
      } catch (err: any) {
        setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setLoading(false);
      }
    }

    if (token && projectId) {
      loadProject();
    }
  }, [projectId, token, user, navigate]);

  const currentStageIndex = project
    ? stages.findIndex((s) => s.key.toLowerCase() === project.status.toLowerCase())
    : 0;

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-red-500/40 rounded p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            Akses Ditolak (403 Forbidden)
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Anda tidak memiliki izin untuk melihat data project ini. Sesuai sistem keamanan otorisasi, klien hanya dapat mengakses berkas dan timeline project milik sendiri.
          </p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 mt-2"
          >
            Kembali ke Dashboard Saya
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 py-16">
        <div className="max-w-5xl mx-auto px-4 space-y-8 animate-pulse">
          <div className="h-8 bg-zinc-900 rounded w-1/4" />
          <div className="h-48 bg-zinc-950 rounded border border-zinc-900" />
          <div className="h-64 bg-zinc-950 rounded border border-zinc-900" />
        </div>
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Project Tidak Ditemukan</h2>
          <p className="text-xs text-zinc-400">{errorMsg || 'Data project tidak tersedia.'}</p>
          <button
            onClick={() => navigate('/client/dashboard')}
            className="px-4 py-2 bg-zinc-900 text-white text-xs rounded border border-zinc-800"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/client/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Klien
        </button>

        {/* Project Header Banner */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">
                  {project.category}
                </span>
                <span>•</span>
                <span>Project ID #{project.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {project.title}
              </h1>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <span className="text-[11px] font-mono uppercase text-zinc-500 block">Status Tahap</span>
              <span className="inline-block px-3 py-1 mt-1 text-xs font-mono font-bold uppercase tracking-wider rounded border bg-emerald-950/40 border-emerald-500/40 text-emerald-300">
                {project.status} ({project.progress}%)
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed border-t border-zinc-900 pt-4">
            {project.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-4">
            <div>
              <span className="text-zinc-600 block mb-0.5">Tanggal Mulai:</span>
              <span className="text-white">{project.start_date}</span>
            </div>
            <div>
              <span className="text-zinc-600 block mb-0.5">Estimasi Selesai:</span>
              <span className="text-white">{project.deadline}</span>
            </div>
            <div>
              <span className="text-zinc-600 block mb-0.5">Klien Terdaftar:</span>
              <span className="text-white">{user?.name}</span>
            </div>
            <div>
              <span className="text-zinc-600 block mb-0.5">Hak Cipta:</span>
              <span className="text-emerald-400">100% Milik Klien</span>
            </div>
          </div>
        </div>

        {/* 7-STEP VISUAL TIMELINE PROGRESS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              Alur Tahapan Desain (7-Stage Pipeline)
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Progress Keseluruhan: {project.progress}%
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${project.progress}%` }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded border text-center transition-all ${
                    isCurrent
                      ? 'bg-white text-black border-white font-bold shadow-lg'
                      : isPast
                      ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                      : 'bg-black border-zinc-900 text-zinc-600'
                  }`}
                >
                  <div className="text-[11px] font-mono tracking-wider">
                    {stage.label}
                  </div>
                  <div className="text-[10px] mt-0.5">
                    {isCurrent ? 'Sedang Berjalan' : isPast ? 'Tuntas' : 'Menunggu'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELIVERABLES FILES SECTION */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
              <FileCode className="w-4 h-4 text-white" />
              Berkas Master & Deliverables
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {Array.isArray(project.deliverables) ? project.deliverables.length : 0} Berkas Siap Diunduh
            </span>
          </div>

          {Array.isArray(project.deliverables) && project.deliverables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.deliverables.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-black border border-zinc-800/80 rounded flex items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">{file.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {file.size} • Diupload {file.date}
                      </div>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    download={file.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-zinc-900 hover:bg-white hover:text-black rounded text-zinc-300 transition-colors shrink-0 ml-3"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-black border border-zinc-900 rounded space-y-2">
              <p className="text-xs font-mono text-zinc-500">
                Belum ada file master yang dirilis. File final (AI, EPS, SVG, Brand Guidelines) akan diunggah oleh designer pada tahap Final/Completed.
              </p>
            </div>
          )}
        </div>

        {/* TIMELINE UPDATES FEED */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              Catatan Timeline & Pembaharuan Project
            </h2>
            <span className="text-xs font-mono text-zinc-500">
              {updates.length} Catatan Masuk
            </span>
          </div>

          {updates.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono">Belum ada catatan pembaharuan.</p>
          ) : (
            <div className="relative pl-6 border-l border-zinc-800 space-y-8">
              {updates.map((update, idx) => (
                <div key={update.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 border-2 border-emerald-400 group-hover:scale-110 transition-transform" />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <span>{update.created_at?.split('T')[0] || update.created_at}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-zinc-900 rounded text-zinc-300">
                        Tahap: {update.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{update.title}</h3>

                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {update.description}
                    </p>

                    {update.file_name && (
                      <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-black border border-zinc-800 rounded text-xs text-zinc-300">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Lampiran: {update.file_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
