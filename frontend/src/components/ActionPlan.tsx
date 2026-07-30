import { ActionPlanCard } from '../types/analytics';

interface ActionPlanProps {
  cards: ActionPlanCard[];
}

const statusOrder = { failed: 0, warning: 1, passed: 2 };

const statusConfig: Record<
  ActionPlanCard['status'],
  { border: string; bg: string; badge: string; icon: string; label: string }
> = {
  failed: {
    border: 'border-red-500/40',
    bg: 'bg-red-950/20',
    badge: 'bg-red-500/20 text-red-300',
    icon: '✕',
    label: 'Failed',
  },
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    badge: 'bg-amber-500/20 text-amber-300',
    icon: '⚠',
    label: 'Warning',
  },
  passed: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/20',
    badge: 'bg-emerald-500/20 text-emerald-300',
    icon: '✓',
    label: 'Passed',
  },
};

const formatTitle = (id: string) =>
  id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const ActionPlan = ({ cards }: ActionPlanProps) => {
  const sorted = [...cards].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const counts = { passed: 0, failed: 0, warning: 0 };
  cards.forEach((c) => counts[c.status]++);

  return (
    <div>
      {/* Summary row */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        {counts.passed > 0 && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {counts.passed} passed
          </span>
        )}
        {counts.warning > 0 && (
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {counts.warning} warnings
          </span>
        )}
        {counts.failed > 0 && (
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {counts.failed} failed
          </span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((card) => {
          const cfg = statusConfig[card.status];
          return (
            <div
              key={card.id}
              className={`relative ${cfg.bg} backdrop-blur-md border ${cfg.border} rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-lg leading-none">{cfg.icon}</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{formatTitle(card.id)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{card.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
