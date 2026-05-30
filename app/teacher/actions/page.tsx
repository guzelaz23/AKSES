'use client';

import { useState } from 'react';
import { Zap, MessageSquare, Send, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import TeacherSidebar from '@/components/shared/TeacherSidebar';
import AccessibilityBar from '@/components/accessibility/AccessibilityBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import sessions from '@/lib/mock-data/sessions.json';
import { cn } from '@/lib/utils/cn';

const SOAL_MOCK = [
  {
    id: 'sq1',
    pertanyaan: 'Apakah terumbu karang bisa dipulihkan setelah bleaching?',
    siswaNama: 'Alex Pratama',
    siswaAvatar: 'AP',
    siswaColor: '#1E40AF',
    waktu: '09:25',
    sesi: 'Kelas Live: Interaksi Real-Time Ekosistem Laut',
    terjawab: true,
    jawaban: 'Ya, terumbu karang bisa pulih jika suhu air kembali normal. Prosesnya 10-15 tahun.',
  },
  {
    id: 'sq2',
    pertanyaan: 'Apa yang bisa kita lakukan sebagai pelajar untuk membantu pelestarian terumbu karang?',
    siswaNama: 'Sari Dewi',
    siswaAvatar: 'SD',
    siswaColor: '#7C3AED',
    waktu: '09:40',
    sesi: 'Kelas Live: Interaksi Real-Time Ekosistem Laut',
    terjawab: false,
    jawaban: '',
  },
  {
    id: 'sq3',
    pertanyaan: 'Bagaimana cara kerja TTS pada platform ini untuk membantu tunanetra?',
    siswaNama: 'Budi Santoso',
    siswaAvatar: 'BS',
    siswaColor: '#059669',
    waktu: '10:15',
    sesi: 'Sesi Mandiri',
    terjawab: false,
    jawaban: '',
  },
];

type AnswerMode = 'text' | 'audio' | 'visual';

export default function ActionsPage() {
  const [soal, setSoal] = useState(SOAL_MOCK);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [modes, setModes] = useState<Record<string, AnswerMode>>({});
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const handleSend = (id: string) => {
    setSoal(prev => prev.map(s => s.id === id ? { ...s, terjawab: true, jawaban: answers[id] || '' } : s));
    setSent(prev => ({ ...prev, [id]: true }));
    setExpandedId(null);
  };

  const unanswered = soal.filter(s => !s.terjawab).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />

      <main id="main-content" className="flex-1 sm:ml-60 pb-4">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 flex items-center gap-2">
              <Zap size={18} className="text-blue-700" />
              Aksi Aktual
            </h1>
            {unanswered > 0 && (
              <Badge variant="warning" className="text-[10px]">{unanswered} belum dijawab</Badge>
            )}
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Pertanyaan', value: soal.length, color: 'bg-blue-50 text-blue-700' },
              { label: 'Sudah Dijawab', value: soal.filter(s => s.terjawab).length, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Menunggu', value: unanswered, color: 'bg-amber-50 text-amber-700' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.color}`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {soal.map((s) => (
              <Card key={s.id} className={cn("border-0 shadow-sm", !s.terjawab && "ring-1 ring-amber-200")}>
                <CardContent className="p-4">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: s.siswaColor }}
                    >
                      {s.siswaAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">{s.siswaNama}</span>
                        <span className="text-[10px] text-slate-400">{s.waktu}</span>
                        <Badge variant={s.terjawab ? 'success' : 'warning'} className="text-[10px]">
                          {s.terjawab ? '✓ Dijawab' : '⏳ Menunggu'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{s.sesi}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-800">{s.pertanyaan}</p>
                    </div>
                  </div>

                  {/* Answer (if answered) */}
                  {s.terjawab && s.jawaban && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-emerald-800 mb-1">Jawaban Guru:</p>
                      <p className="text-xs text-emerald-700">{s.jawaban}</p>
                    </div>
                  )}

                  {/* Answer form (if not answered) */}
                  {!s.terjawab && (
                    <>
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="w-full flex items-center justify-between text-sm font-medium text-blue-700 hover:text-blue-900 py-1"
                        aria-expanded={expandedId === s.id}
                      >
                        <span>Tulis Jawaban</span>
                        {expandedId === s.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {expandedId === s.id && (
                        <div className="mt-3 space-y-3 animate-fade-in">
                          {/* Mode selector */}
                          <div className="flex gap-2" role="group" aria-label="Format jawaban">
                            {(['text', 'audio', 'visual'] as AnswerMode[]).map(m => (
                              <button
                                key={m}
                                onClick={() => setModes(prev => ({ ...prev, [s.id]: m }))}
                                className={cn(
                                  "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                  (modes[s.id] || 'text') === m
                                    ? "bg-blue-800 text-white border-blue-800"
                                    : "border-slate-200 text-slate-600 hover:border-blue-300"
                                )}
                                aria-pressed={(modes[s.id] || 'text') === m}
                              >
                                {m === 'text' ? '📝 Teks' : m === 'audio' ? '🔊 Audio' : '🖼️ Visual'}
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={answers[s.id] || ''}
                            onChange={e => setAnswers(prev => ({ ...prev, [s.id]: e.target.value }))}
                            placeholder="Tulis jawaban untuk siswa..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            aria-label={`Tulis jawaban untuk pertanyaan dari ${s.siswaNama}`}
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSend(s.id)}
                              disabled={!answers[s.id]?.trim()}
                              className="flex-1 flex items-center justify-center gap-2 h-10 bg-blue-800 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                              aria-label="Kirim jawaban ke siswa"
                            >
                              <Send size={13} />
                              Kirim Feedback
                            </button>
                            <button
                              className="flex items-center gap-1.5 h-10 px-3 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 transition-colors"
                              aria-label="Pratinjau sebelum mengirim"
                            >
                              <Eye size={13} />
                              Pratinjau
                            </button>
                          </div>
                        </div>
                      )}

                      {sent[s.id] && (
                        <div className="flex items-center gap-2 text-emerald-600 text-xs mt-2 animate-fade-in" aria-live="polite">
                          <Check size={12} />
                          Jawaban terkirim ke {s.siswaNama}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <AccessibilityBar />
    </div>
  );
}
