import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Project, ProjectUpdate, ProjectDeliverable } from '../../types/index.ts';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  AlertCircle,
  Upload,
  Layers,
  FileCode,
  FileText,
  Calendar,
  User,
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Project Detail / Timeline Modal
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);

  // Create / Edit Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    client_id: '',
    title: '',
    description: '',
    category: 'UMKM',
    status: 'Brief',
    progress: 15,
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
  });

  // Timeline Update Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    status: 'Design',
    file_name: '',
    file_url: '',
  });

  // Deliverable Add Modal
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState({
    name: '',
    url: '',
    size: '1.2 MB',
  });
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const statuses = ['Brief', 'Research', 'Concept', 'Design', 'Revision', 'Final', 'Completed'];

  const fetchProjects = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        fetch('/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/clients', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const openProjectDetail = async (project: Project) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data.project);
        setProjectUpdates(data.updates || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjectForm({
      client_id: clients[0]?.id ? String(clients[0].id) : '',
      title: '',
      description: '',
      category: 'UMKM',
      status: 'Brief',
      progress: 15,
      start_date: new Date().toISOString().split('T')[0],
      deadline: '',
    });
    setErrorMsg('');
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      client_id: String(proj.client_id),
      title: proj.title,
      description: proj.description,
      category: proj.category,
      status: proj.status,
      progress: proj.progress,
      start_date: proj.start_date,
      deadline: proj.deadline,
    });
    setErrorMsg('');
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.client_id || !projectForm.title) {
      setErrorMsg('Client dan nama project wajib diisi.');
      return;
    }

    try {
      const url = editingProject
        ? `/api/admin/projects/${editingProject.id}`
        : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal menyimpan project.');

      setIsProjectModalOpen(false);
      setSuccessMsg(editingProject ? 'Project berhasil diperbarui.' : 'Project baru berhasil dibuat!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProjects();

      if (activeProject && editingProject && activeProject.id === editingProject.id) {
        openProjectDetail({ ...activeProject, ...projectForm, progress: Number(projectForm.progress) } as any);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        if (activeProject?.id === id) setActiveProject(null);
        setSuccessMsg('Project berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Timeline Update
  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !updateForm.title) return;

    try {
      const res = await fetch(`/api/admin/projects/${activeProject.id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setIsUpdateModalOpen(false);
      setUpdateForm({
        title: '',
        description: '',
        status: activeProject.status,
        file_name: '',
        file_url: '',
      });
      openProjectDetail(activeProject);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteUpdate = async (updateId: number) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/admin/projects/updates/${updateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        openProjectDetail(activeProject);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deliverables upload
  const handleDeliverableFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDeliverable(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDeliverableForm({
        name: file.name,
        url: data.url,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDeliverable(false);
    }
  };

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !deliverableForm.name || !deliverableForm.url) return;

    try {
      const res = await fetch(`/api/admin/projects/${activeProject.id}/deliverables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deliverableForm),
      });

      if (res.ok) {
        setIsDeliverableModalOpen(false);
        setDeliverableForm({ name: '', url: '', size: '1.2 MB' });
        openProjectDetail(activeProject);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDeliverable = async (delId: string) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/admin/projects/${activeProject.id}/deliverables/${delId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        openProjectDetail(activeProject);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Client Progress & Tracking
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Manajemen Project Desain
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pantau status 7 tahapan, sesuaikan progress, tambahkan timeline update, dan lampirkan deliverable files.
          </p>
        </div>

        <button
          onClick={openCreateProjectModal}
          className="px-5 py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Project Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-3">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Belum Ada Project</h3>
          <p className="text-xs text-zinc-400">Buat project pertama untuk klien Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all rounded p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {p.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      p.status === 'Completed'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {p.status} ({p.progress}%)
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{p.client_name}</span>
                    <span className="text-zinc-600">({p.client_company || 'Personal'})</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>Progress: {p.progress}%</span>
                    <span>Deadline: {p.deadline}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between">
                <button
                  onClick={() => openProjectDetail(p)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-white hover:text-black rounded text-xs font-mono text-zinc-300 transition-colors"
                >
                  Buka Timeline & File
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditProjectModal(p)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900"
                    title="Edit Data Project"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-900"
                    title="Hapus Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED PROJECT & TIMELINE MODAL */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-8 relative">
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title & Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="px-2 py-0.5 bg-zinc-900 rounded text-zinc-300">
                  {activeProject.category}
                </span>
                <span>•</span>
                <span>Klien: {activeProject.client_name}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  Status: {activeProject.status} ({activeProject.progress}%)
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{activeProject.title}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                {activeProject.description}
              </p>
            </div>

            {/* Deliverables Section */}
            <div className="bg-black border border-zinc-900 rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Deliverables & File Master ({activeProject.deliverables?.length || 0})
                </h3>
                <button
                  onClick={() => setIsDeliverableModalOpen(true)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-white rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>

              {activeProject.deliverables && activeProject.deliverables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeProject.deliverables.map((del) => (
                    <div
                      key={del.id}
                      className="p-3 bg-zinc-950 border border-zinc-800/80 rounded flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="text-white font-medium block truncate">{del.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {del.size} • {del.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={del.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-zinc-400 hover:text-white"
                          title="Lihat / Download"
                        >
                          Lihat
                        </a>
                        <button
                          onClick={() => handleDeleteDeliverable(del.id)}
                          className="p-1 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 font-mono">Belum ada file deliverable yang diunggah.</p>
              )}
            </div>

            {/* Timeline Updates Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white" />
                  Catatan Timeline & Update Progress ({projectUpdates.length})
                </h3>
                <button
                  onClick={() => {
                    setUpdateForm({
                      title: '',
                      description: '',
                      status: activeProject.status,
                      file_name: '',
                      file_url: '',
                    });
                    setIsUpdateModalOpen(true);
                  }}
                  className="px-3 py-1 bg-white text-black font-semibold text-xs font-mono rounded hover:bg-zinc-200 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Catatan Timeline
                </button>
              </div>

              {projectUpdates.length === 0 ? (
                <p className="text-xs text-zinc-600 font-mono">Belum ada catatan timeline.</p>
              ) : (
                <div className="space-y-3">
                  {projectUpdates.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 bg-black border border-zinc-900 rounded space-y-1.5 relative group"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{u.created_at?.split('T')[0] || u.created_at}</span>
                          <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300">
                            {u.status}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteUpdate(u.id)}
                          className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white">{u.title}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{u.description}</p>
                      {u.file_name && (
                        <div className="text-[11px] font-mono text-zinc-500 pt-1">
                          Lampiran: {u.file_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => setActiveProject(null)}
                className="px-5 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold rounded hover:bg-zinc-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingProject ? 'Edit Data Project' : 'Buat Project Baru'}
              </h2>
              <p className="text-xs text-zinc-400">
                Pilih klien terdaftar, tentukan alur status, dan target penyelesaian.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Pilih Klien *
                </label>
                <select
                  required
                  disabled={!!editingProject}
                  value={projectForm.client_id}
                  onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono disabled:opacity-50"
                >
                  <option value="">-- Pilih Klien --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama Project *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="Contoh: Rebranding Identitas Kopi Nusantara"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Deskripsi / Catatan Brief
                </label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Ringkasan kebutuhan, arah visual yang disepakati..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Kategori
                  </label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="UMKM">UMKM</option>
                    <option value="BUSINESS / CORPORATE">BUSINESS / CORPORATE</option>
                    <option value="PERSONAL / CUSTOM">PERSONAL / CUSTOM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Tahapan Status (Pipeline) *
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono font-bold"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 p-3 bg-black border border-zinc-900 rounded">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 uppercase">Progress Pengerjaan:</span>
                  <span className="text-emerald-400 font-bold">{projectForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Estimasi Selesai (Deadline)
                  </label>
                  <input
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase rounded hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-xs font-semibold uppercase rounded hover:bg-zinc-200"
                >
                  {editingProject ? 'Simpan Perubahan' : 'Buat Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD UPDATE MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                Tambah Catatan Timeline
              </h3>
              <p className="text-xs text-zinc-400">
                Update ini akan langsung muncul di halaman Client Dashboard.
              </p>
            </div>

            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Judul Pembaharuan *
                </label>
                <input
                  type="text"
                  required
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                  placeholder="Contoh: Konsep Vektor Selesai Dikembangkan"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Status Tahap
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={3}
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  placeholder="Detail hasil pengerjaan, catatan untuk klien..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama File Lampiran (Opsional)
                </label>
                <input
                  type="text"
                  value={updateForm.file_name}
                  onChange={(e) => setUpdateForm({ ...updateForm, file_name: e.target.value })}
                  placeholder="Concept-Deck-v2.pdf"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-xs text-zinc-300 rounded border border-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-xs font-semibold rounded hover:bg-zinc-200 uppercase"
                >
                  Kirim Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELIVERABLE UPLOAD MODAL */}
      {isDeliverableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsDeliverableModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white uppercase">
                Unggah Berkas Deliverable
              </h3>
              <p className="text-xs text-zinc-400">
                File master (AI, SVG, PDF, ZIP) yang dapat diunduh langsung oleh klien.
              </p>
            </div>

            <form onSubmit={handleAddDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Upload Berkas
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-black border border-zinc-800 hover:border-zinc-700 rounded text-xs text-zinc-300 font-mono transition-colors">
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>{uploadingDeliverable ? 'Mengunggah...' : 'Pilih File dari Komputer'}</span>
                  <input
                    type="file"
                    onChange={handleDeliverableFileUpload}
                    className="hidden"
                    disabled={uploadingDeliverable}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  Nama File *
                </label>
                <input
                  type="text"
                  required
                  value={deliverableForm.name}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, name: e.target.value })}
                  placeholder="Brand-Logo-Primary-Vector.svg"
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                  URL Berkas *
                </label>
                <input
                  type="text"
                  required
                  value={deliverableForm.url}
                  onChange={(e) => setDeliverableForm({ ...deliverableForm, url: e.target.value })}
                  placeholder="/uploads/..."
                  className="w-full px-3 py-2 bg-black border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeliverableModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-xs text-zinc-300 rounded border border-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black text-xs font-semibold rounded hover:bg-zinc-200 uppercase"
                >
                  Simpan Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded max-w-sm w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase">Hapus Project?</h3>
            <p className="text-xs text-zinc-400">
              Apakah Anda yakin ingin menghapus project ini beserta seluruh catatan timeline dan file-nya?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-zinc-900 text-xs text-zinc-300 rounded border border-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs text-white rounded font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
