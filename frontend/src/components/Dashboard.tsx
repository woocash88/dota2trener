import { BadgeSection } from './BadgeSection';
import { ActionPlan } from './ActionPlan';
import type { FullPlayerAnalysis } from '../types/analytics';

interface DashboardProps {
  data: FullPlayerAnalysis;
  onReset: () => void;
}

export const Dashboard = ({ data, onReset }: DashboardProps) => (
  <div className="min-h-screen bg-black text-slate-200">
    {/* Top nav */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
      <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Virtual Dota 2 Coach
      </span>
      <button
        onClick={onReset}
        className="text-sm text-slate-500 hover:text-slate-200 transition-colors flex items-center gap-1"
      >
        <span className="text-base leading-none">←</span>
        <span>Scan another player</span>
      </button>
    </div>

    {/* Report content */}
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Player header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800/40">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ring-2 ring-purple-500/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
          ?
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Player Report</h1>
          <p className="text-sm text-slate-500">Full match analysis overview</p>
        </div>
      </div>

      {/* Player badges */}
      <BadgeSection badges={data.badges} />

      {/* Action plan */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Action Plan</h2>
        <p className="text-sm text-slate-500 mb-5">
          Priority-ordered findings and recommendations
        </p>
        <ActionPlan cards={data.actionPlan} />
      </div>
    </div>
  </div>
);
