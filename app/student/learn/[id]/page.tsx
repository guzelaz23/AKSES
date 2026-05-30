'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Eye, Ear, ChevronDown, ChevronUp, CheckCircle, Circle, Users, BookOpen } from 'lucide-react';
import StudentBottomNav from '@/components/shared/StudentBottomNav';
import StudentSidebar from '@/components/shared/StudentSidebar';
import AccessibilityBar from '@/components/accessibility/AccessibilityBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAccessibilityStore } from '@/lib/store/accessibility-store';
import materials from '@/lib/mock-data/materials.json';
import { cn } from '@/lib/utils/cn';

type ViewMode = 'visual' | 'audio';

export default function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const material = materials.find(m => m.id === id);
  const { ttsEnabled, ttsRate } = useAccessibilityStore();

  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const ttsWordsRef = useRef<string[]>([]);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };
  }, []);

  if (!material) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-3">Materi tidak ditemukan</p>
          <Link href="/student/learn" className="text-blue-600 hover:underline text-sm">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const words = material.transkrip.split(/\s+/);

  const handleTTS = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isTTSPlaying) {
      window.speechSynthesis.cancel();
      setIsTTSPlaying(false);
      setHighlightedWord(-1);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(material.transkrip);
    utterance.lang = 'id-ID';
    utterance.rate = ttsRate;

    ttsWordsRef.current = words;
    let wordIdx = 0;
    const msPerWord = (60 / (ttsRate * 150)) * 1000;

    setIsTTSPlaying(true);
    setHighlightedWord(0);

    wordTimerRef.current = setInterval(() => {
      wordIdx++;
      if (wordIdx >= ttsWordsRef.current.length) {
        clearInterval(wordTimerRef.current!);
        setHighlightedWord(-1);
        setIsTTSPlaying(false);
      } else {
        setHighlightedWord(wordIdx);
      }
    }, msPerWord);

    utterance.onend = () => {
      setIsTTSPlaying(false);
      setHighlightedWord(-1);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  const completedSteps = material.langkah.filter(l => l.selesai).length;
  const overallProgress = Math.round((completedSteps / material.langkah.length) * 100);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />

      <main id="main-content" className="flex-1 sm:ml-60 pb-20 sm:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/student/learn"
            className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Kembali ke katalog materi"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 font-medium">{material.mataPelajaran}</p>
            <h1 className="text-sm font-semibold text-slate-900 truncate">{material.judul}</h1>
          </div>
          <Badge variant={material.mode as 'audio' | 'visual' | 'both'} className="text-[10px] flex-shrink-0">
            {material.mode === 'audio' ? '🔊 Audio' : material.mode === 'visual' ? '👁️ Visual' : '⚡ Keduanya'}
          </Badge>
        </div>

        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {/* Mode Toggle */}
          <div className="bg-white rounded-2xl p-1 flex border border-slate-200 shadow-sm" role="group" aria-label="Pilih mode belajar">
            <button
              onClick={() => setViewMode('visual')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                viewMode === 'visual'
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
              aria-pressed={viewMode === 'visual'}
              aria-label="Mode visual deskriptif"
            >
              <Eye size={15} aria-hidden="true" />
              Visual Deskriptif
            </button>
            <button
              onClick={() => setViewMode('audio')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                viewMode === 'audio'
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
              aria-pressed={viewMode === 'audio'}
              aria-label="Mode audio deskriptif"
            >
              <Ear size={15} aria-hidden="true" />
              Audio Deskriptif
            </button>
          </div>

          {/* Player Area */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: material.thumbnailColor + '20', minHeight: '180px' }}
            role="region"
            aria-label="Area player materi"
          >
            <div className="flex items-center justify-center h-44 text-6xl">
              {material.thumbnailEmoji}
            </div>

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-end justify-between p-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={isPlaying ? "Jeda video" : "Putar video"}
                aria-pressed={isPlaying}
              >
                {isPlaying ? <Pause size={20} className="text-blue-800" /> : <Play size={20} className="text-blue-800" />}
              </button>

              <button
                onClick={handleTTS}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500",
                  isTTSPlaying
                    ? "bg-amber-500 text-white"
                    : "bg-white text-blue-800 hover:bg-blue-50"
                )}
                aria-label={isTTSPlaying ? "Hentikan pembacaan teks" : "Putar audio deskriptif"}
                aria-pressed={isTTSPlaying}
              >
                {isTTSPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isTTSPlaying ? 'Hentikan' : 'Putar Audio'}
              </button>
            </div>
          </div>

          {/* Transkrip/Deskripsi dengan TTS Highlight */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 text-sm">
                  {viewMode === 'audio' ? '🔊 Transkrip Audio' : '📝 Deskripsi Materi'}
                </h2>
                {isTTSPlaying && (
                  <Badge variant="warning" className="text-[10px] animate-pulse">Sedang Dibacakan</Badge>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed" aria-live="polite">
                {words.map((word, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "transition-all",
                      highlightedWord === idx ? "tts-word-highlight" : ""
                    )}
                    aria-current={highlightedWord === idx ? "true" : undefined}
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            </CardContent>
          </Card>

          {/* Langkah-langkah */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen size={15} className="text-blue-700" />
                  Langkah Pembelajaran
                </h2>
                <span className="text-xs text-slate-500">{completedSteps}/{material.langkah.length} selesai</span>
              </div>

              <Progress value={overallProgress} className="h-2 mb-4" />

              <div className="space-y-2">
                {material.langkah.map((langkah, idx) => (
                  <div key={langkah.id} className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedStep(expandedStep === langkah.id ? null : langkah.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                      aria-expanded={expandedStep === langkah.id}
                      aria-controls={`step-content-${langkah.id}`}
                    >
                      {langkah.selesai ? (
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <Circle size={18} className="text-slate-300 flex-shrink-0" aria-hidden="true" />
                      )}
                      <span className="flex-1 text-sm font-medium text-slate-800">
                        <span className="text-slate-400 mr-1">Langkah {idx + 1}:</span>
                        {langkah.judul}
                      </span>
                      {expandedStep === langkah.id ? (
                        <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {expandedStep === langkah.id && (
                      <div
                        id={`step-content-${langkah.id}`}
                        className="px-4 pb-3 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50"
                      >
                        {langkah.deskripsi}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/student/quiz/${material.id}`}
              className="flex items-center justify-center gap-2 h-12 bg-blue-800 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Lanjut ke kuis materi ini"
            >
              Lanjut ke Kuis
            </Link>
            <button
              className="flex items-center justify-center gap-2 h-12 border-2 border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Minta bantuan pendamping"
            >
              <Users size={15} />
              Minta Pendamping
            </button>
          </div>
        </div>
      </main>

      <StudentBottomNav />
      <AccessibilityBar />
    </div>
  );
}
