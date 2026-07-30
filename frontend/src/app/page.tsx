"use client";

import { useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import Lightfall from '../components/Lightfall';
import type { FullPlayerAnalysis } from '../types/analytics';

export default function HomePage() {
  const [steamId, setSteamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<FullPlayerAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!steamId.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamId: steamId.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${res.status}`);
      }
      const data: FullPlayerAnalysis = await res.json();
      setReportData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setReportData({
        badges: { heroVersatility: 'Błąd', macroRole: 'Błąd', microRole: 'Błąd' },
        actionPlan: [
          {
            id: 'blad_pobierania',
            status: 'failed',
            message: `Nie udało się pobrać danych: ${message}`,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center text-slate-200">
      {/* Background — Lightfall */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#000000"
          speed={0.2}
          streakCount={8}
          streakWidth={0.5}
          streakLength={1}
          glow={0.6}
          density={0.5}
          twinkle={0.5}
          zoom={2}
          backgroundGlow={1}
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.6}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        {/* State 1 — Input */}
        {!isLoading && !reportData && (
          <div className="flex flex-col items-center w-full max-w-md p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
              Virtual Dota 2 Coach
            </h1>
            <input
              type="text"
              placeholder="Enter Steam ID..."
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full px-4 py-3 mb-4 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-slate-400"
            />
            <button
              onClick={handleAnalyze}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Analyze Match History
            </button>
          </div>
        )}

        {/* State 2 — Loading */}
        {isLoading && (
          <div className="flex flex-col items-center w-full max-w-md p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg animate-pulse">Scanning matches...</p>
          </div>
        )}

        {/* State 3 — Dashboard */}
        {reportData && !isLoading && (
          <Dashboard data={reportData} onReset={() => setReportData(null)} />
        )}
      </div>
    </main>
  );
}
