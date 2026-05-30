'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Calendar, PlusCircle, ChevronRight } from 'lucide-react';
import TeacherSidebar from '@/components/shared/TeacherSidebar';
import AccessibilityBar from '@/components/accessibility/AccessibilityBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import teachers from '@/lib/mock-data/teachers.json';
import students from '@/lib/mock-data/students.json';
import sessions from '@/lib/mock-data/sessions.json';
import { getDisabilitasLabel, getDisabilitasBadgeColor } from '@/lib/utils/formatters';

const teacher = teachers[0];

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const upcomingSessions = sessions.filter(s => s.status !== 'done').slice(0, 3);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <TeacherSidebar />
        <main className="flex-1 sm:ml-60 p-4">
          <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />

      <main id="main-content" className="flex-1 sm:ml-60 pb-4">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:hidden">
            <span className="font-bold text-blue-900">AKSES</span>
          </div>
          <div className="hidden sm:block" />
          <div />
        </div>

        <div className="p-4 space-y-5 max-w-3xl mx-auto">
          {/* Greeting */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <p className="text-emerald-200 text-sm mb-1">{today}</p>
            <h1 className="text-2xl font-bold mb-1">Halo, {teacher.nama}! 👋</h1>
            <p className="text-emerald-100 text-sm mb-4">{teacher.mataPelajaran.join(' & ')}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Siswa', value: teacher.totalSiswa, icon: '👥' },
                { label: 'Siswa Aktif', value: teacher.siswaAktif, icon: '✅' },
                { label: 'Sesi Bulan Ini', value: teacher.sesibulanIni, icon: '📅' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-xl mb-0.5" aria-hidden="true">{stat.icon}</div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-emerald-200 text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <Link href="/teacher/create-session">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <PlusCircle size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm">Buat Sesi Baru</p>
                <p className="text-blue-600 text-xs">Jadwalkan kelas live atau upload materi</p>
              </div>
              <ChevronRight size={16} className="text-blue-400" />
            </div>
          </Link>

          {/* Student Progress */}
          <section aria-labelledby="progress-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="progress-heading" className="font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-700" />
                Progress Siswa
              </h2>
              <Link href="/teacher/students" className="text-xs text-blue-600 font-medium hover:underline">
                Lihat semua
              </Link>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: s.avatarColor }}
                      role="img"
                      aria-label={`Avatar ${s.nama}`}
                    >
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800 truncate">{s.nama}</span>
                        <span className="text-xs font-bold text-blue-700 ml-2 flex-shrink-0">{s.progress}%</span>
                      </div>
                      <Progress
                        value={s.progress}
                        className="h-1.5"
                        indicatorClassName={
                          s.progress >= 80 ? "bg-emerald-500" :
                          s.progress >= 50 ? "bg-blue-500" : "bg-amber-500"
                        }
                      />
                    </div>
                    <Badge
                      className={`text-[10px] flex-shrink-0 ${getDisabilitasBadgeColor(s.disabilitas)}`}
                    >
                      {s.disabilitas === 'none' ? '—' : s.disabilitas === 'tunanetra' ? '👁️' : s.disabilitas === 'tunarungu' ? '👂' : '♿'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Upcoming Sessions */}
          <section aria-labelledby="jadwal-heading">
            <div className="flex items-center gap-2 mb-3">
              <h2 id="jadwal-heading" className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar size={16} className="text-blue-700" />
                Jadwal Sesi
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingSessions.map((sess) => (
                <div key={sess.id} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
                  <div className={`w-2 h-12 rounded-full flex-shrink-0 ${sess.status === 'live' ? 'bg-red-500' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sess.judul}</p>
                    <p className="text-xs text-slate-500">{sess.tanggal} • {sess.waktu} WIB</p>
                    <p className="text-xs text-slate-400">{sess.peserta?.length || 0} peserta terdaftar</p>
                  </div>
                  <Badge
                    variant={sess.status === 'live' ? 'live' : 'default'}
                    className="flex-shrink-0 text-[10px]"
                  >
                    {sess.status === 'live' ? 'LIVE' : 'Terjadwal'}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <AccessibilityBar />
    </div>
  );
}
