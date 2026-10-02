import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ContactMessage } from '../../types/index.ts';
import {
  Mail,
  CheckCircle2,
  Trash2,
  MailOpen,
  CornerUpRight,
  Send,
  ExternalLink,
  Save,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // In-app Reply Composer
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [savingReply, setSavingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMessages();
  }, [token]);

  const selectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setReplySuccessMsg('');
    setReplySubject(`Re: Inquiry Desain Logo - ${msg.name}`);

    // If message already has reply, show it or prefill template
    if (msg.reply_text) {
      setReplyBody(msg.reply_text);
    } else {
      setReplyBody(
`Halo ${msg.name},

Terima kasih telah menghubungi Kroma Studio. Kami sangat tertarik untuk mendiskusikan kebutuhan desain logo dan brand identity Anda.

Terkait inquiry Anda:
"${msg.message}"

Kami siap membantu merealisasikan visi brand Anda dengan paket desain yang sesuai. Apakah Anda memiliki waktu untuk diskusi lanjutan atau ingin kami kirimkan formulir brief awal?

Salam hangat,
Fikri Maulana
Lead Identity & Logo Specialist
Kroma Studio`
      );
    }

    if (msg.is_read === 0) {
      toggleReadStatus(msg);
    }
  };

  const toggleReadStatus = async (msg: ContactMessage) => {
    try {
      const newStatus = msg.is_read === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/messages/${msg.id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_read: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === msg.id) {
          setSelectedMessage({ ...selectedMessage, is_read: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save reply log to database
  const handleSaveReplyToDatabase = async () => {
    if (!selectedMessage) return;
    setSavingReply(true);
    setReplySuccessMsg('');

    try {
      const res = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply_text: replyBody }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan balasan.');

      const now = data.replied_at || new Date().toISOString();
      setSelectedMessage((prev) => (prev ? { ...prev, reply_text: replyBody, replied_at: now } : null));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id ? { ...m, reply_text: replyBody, replied_at: now, is_read: 1 } : m
        )
      );

      setReplySuccessMsg('Catatan balasan berhasil tersimpan secara permanen di database!');
      setTimeout(() => setReplySuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSavingReply(false);
    }
  };

  // Send via Gmail webmail direct compose link
  const openGmailCompose = () => {
    if (!selectedMessage) return;
    handleSaveReplyToDatabase();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      selectedMessage.email
    )}&su=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
    window.open(gmailUrl, '_blank');
  };

  // Send via default mail client (mailto)
  const openMailto = () => {
    if (!selectedMessage) return;
    handleSaveReplyToDatabase();
    const mailtoUrl = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(
      replySubject
    )}&body=${encodeURIComponent(replyBody)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Client Inquiries & Direct Responder
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">
            Pesan Formulir Kontak & Balasan Email
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Baca pesan masuk dari calon klien, tulis balasan langsung di sistem, dan kirimkan via Gmail atau aplikasi email Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-4 space-y-3">
          {loading ? (
            <div className="h-48 bg-zinc-950 border border-zinc-900 rounded animate-pulse" />
          ) : messages.length === 0 ? (
            <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded space-y-3">
              <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">Tidak Ada Pesan</h3>
              <p className="text-xs text-zinc-400">Belum ada pesan yang dikirim melalui formulir kontak.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                onClick={() => selectMessage(m)}
                className={`p-4 rounded border transition-colors cursor-pointer space-y-1.5 ${
                  selectedMessage?.id === m.id
                    ? 'bg-zinc-900 border-white'
                    : m.is_read === 0
                    ? 'bg-zinc-950 border-amber-500/40'
                    : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate mr-2">{m.name}</span>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {m.created_at?.split('T')[0] || m.created_at}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 truncate">{m.email}</div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-0.5">
                  {m.message}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {m.is_read === 0 && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      • Belum Dibaca
                    </span>
                  )}
                  {m.reply_text && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Sudah Dibalas
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Message & In-App Reply Composer */}
        <div className="lg:col-span-8">
          {selectedMessage ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded p-6 sm:p-8 space-y-6">
              {/* Message Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedMessage.name}</h2>
                    {selectedMessage.replied_at && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        Dibalas: {selectedMessage.replied_at.split('T')[0]}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">
                    {selectedMessage.email} • Masuk pada {selectedMessage.created_at}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReadStatus(selectedMessage)}
                    className="p-2 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 text-xs font-mono flex items-center gap-1.5"
                    title="Ubah status baca"
                  >
                    <MailOpen className="w-4 h-4" />
                    <span>{selectedMessage.is_read === 1 ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}</span>
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-900"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content from Client */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase text-zinc-500 block">
                  Pesan Asli dari Calon Klien:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap bg-black p-4 rounded border border-zinc-900 font-mono">
                  {selectedMessage.message}
                </p>
              </div>

              {/* In-App Email Reply Composer */}
              <div className="bg-black/60 border border-zinc-800 rounded p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CornerUpRight className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      Tulis Balasan Langsung ke {selectedMessage.email}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Template balasan otomatis telah disiapkan
                  </span>
                </div>

                {replySuccessMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{replySuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Subjek Email Balasan:
                    </label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Isi Pesan Balasan:
                    </label>
                    <textarea
                      rows={8}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none font-mono leading-relaxed"
                    />
                  </div>
                </div>

                {/* Reply Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleSaveReplyToDatabase}
                    disabled={savingReply}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingReply ? 'Menyimpan...' : 'Simpan Catatan ke Database'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openMailto}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      Kirim via Mail App
                    </button>

                    <button
                      type="button"
                      onClick={openGmailCompose}
                      className="px-5 py-2 bg-white text-black hover:bg-zinc-200 font-semibold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Buka & Kirim di Gmail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-zinc-950 border border-zinc-900 rounded flex items-center justify-center p-8 text-center text-zinc-500 text-xs font-mono">
              Pilih pesan di sebelah kiri untuk membaca dan membalas langsung ke email klien.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
