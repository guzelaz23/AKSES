'use client';

import { useState, useEffect, useRef } from 'react';
import { Radio, Send, ChevronDown, Mic, MicOff, Users } from 'lucide-react';
import StudentBottomNav from '@/components/shared/StudentBottomNav';
import StudentSidebar from '@/components/shared/StudentSidebar';
import AccessibilityBar from '@/components/accessibility/AccessibilityBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccessibilityStore } from '@/lib/store/accessibility-store';
import sessions from '@/lib/mock-data/sessions.json';

const liveSession = sessions.find(s => s.status === 'live')!;

const FULL_TRANSCRIPT = liveSession?.transcript || [];

type Question = { id: string; text: string; answered: boolean; answer?: string };

export default function LivePage() {
  const { subtitleEnabled } = useAccessibilityStore();
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<Question[]>(
    (liveSession?.pertanyaan || []).map(q => ({
      id: q.id,
      text: q.pertanyaan,
      answered: q.terjawab,
      answer: q.jawaban || undefined,
    }))
  );
  const [activeInteraction, setActiveInteraction] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIdx >= FULL_TRANSCRIPT.length) return;
    const timer = setTimeout(() => {
      setTranscriptLines(prev => [...prev, FULL_TRANSCRIPT[currentLineIdx]]);
      setCurrentLineIdx(prev => prev + 1);
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentLineIdx]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcriptLines]);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setQuestions(prev => [...prev, {
      id: `q${Date.now()}`,
      text: question.trim(),
      answered: false,
    }]);
    setQuestion('');
  };

  const interactions = [
    { id: 'obs', label: 'Observasi', emoji: '🔭', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'kon', label: 'Kondensasi', emoji: '💧', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
    { id: 'pre', label: 'Presipitasi', emoji: '🌧️', color: 'bg-slate-50 border-slate-200 text-slate-700' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />

      <main id="main-content" className="flex-1 sm:ml-60 pb-20 sm:pb-4">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 live-indicator">
              <Radio size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="live" className="text-[10px]">LIVE</Badge>
                <span className="text-xs text-slate-500">{liveSession?.mataPelajaran}</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 truncate">{liveSession?.judul}</h1>
              <p className="text-xs text-slate-500">{liveSession?.guru}</p>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Users size={12} />
              <span>{liveSession?.peserta?.length || 4}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-3xl mx-auto">
          {/* Content Area */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-5 text-white relative overflow-hidden min-h-[160px]">
            <div className="absolute top-4 right-4 text-5xl opacity-30" aria-hidden="true">🌊</div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">{liveSession?.topik}</p>
            <h2 className="text-lg font-bold mb-2">Interaksi Real-Time</h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
              {liveSession?.deskripsi}
            </p>
          </div>

          {/* Subtitle / Transcript */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                  Live Transcript
                </h2>
                <Badge variant={subtitleEnabled ? 'success' : 'secondary'} className="text-[10px]">
                  {subtitleEnabled ? 'Subtitle Aktif' : 'Subtitle Mati'}
                </Badge>
              </div>

              <div
                ref={transcriptRef}
                className="h-36 overflow-y-auto space-y-2 pr-1"
                aria-live="polite"
                aria-label="Transkrip kelas live"
                role="log"
              >
                {transcriptLines.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">Menunggu guru memulai...</p>
                ) : (
                  transcriptLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`text-sm text-slate-700 leading-relaxed p-2 rounded-lg transition-all ${
                        idx === transcriptLines.length - 1
                          ? 'bg-blue-50 border-l-2 border-blue-500 typing-cursor'
                          : 'text-slate-500'
                      }`}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactions */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Interaksi Cepat</p>
            <div className="grid grid-cols-3 gap-2">
              {interactions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveInteraction(activeInteraction === item.id ? null : item.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeInteraction === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : item.color
                  }`}
                  aria-pressed={activeInteraction === item.id}
                  aria-label={`Tandai: ${item.label}`}
                >
                  <div className="text-xl mb-1" aria-hidden="true">{item.emoji}</div>
                  <p className="text-xs font-semibold">{item.label}</p>
                </button>
              ))}
            </div>
            {activeInteraction && (
              <div className="mt-2 text-xs text-center text-blue-600 font-medium animate-fade-in" aria-live="polite">
                ✓ Respon &ldquo;{interactions.find(i => i.id === activeInteraction)?.label}&rdquo; terkirim ke guru
              </div>
            )}
          </div>

          {/* Q&A Panel */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-semibold text-slate-900 text-sm mb-3">Panel Tanya Jawab</h2>

              {/* Question Form */}
              <form onSubmit={handleSendQuestion} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Tulis pertanyaan untuk guru"
                />
                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="w-10 h-10 bg-blue-800 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Kirim pertanyaan"
                >
                  <Send size={14} />
                </button>
              </form>

              {/* Questions List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border text-sm ${
                      q.answered
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${
                        q.answered ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {q.answered ? '✓' : '?'}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-800">{q.text}</p>
                        {q.answered && q.answer && (
                          <p className="text-xs text-emerald-700 mt-1 italic">Guru: {q.answer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-slate-400 text-xs italic text-center py-3">
                    Belum ada pertanyaan. Jadilah yang pertama!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <StudentBottomNav />
      <AccessibilityBar />
    </div>
  );
}
