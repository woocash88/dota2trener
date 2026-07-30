import { PlayerBadges } from '../types/analytics';

interface BadgeSectionProps {
  badges: PlayerBadges;
}

const badgeMeta = [
  { key: 'heroVersatility' as const, label: 'Hero Versatility', icon: '⚔️', desc: 'Draft adaptability' },
  { key: 'macroRole' as const, label: 'Macro Role', icon: '🗺️', desc: 'Map & objective play' },
  { key: 'microRole' as const, label: 'Micro Role', icon: '🎯', desc: 'Mechanics & execution' },
];

export const BadgeSection = ({ badges: values }: BadgeSectionProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    {badgeMeta.map(({ key, label, icon, desc }) => (
      <div
        key={key}
        className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {desc}
          </span>
        </div>
        <span className="text-2xl font-bold text-white truncate">{values[key] || '—'}</span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
    ))}
  </div>
);
