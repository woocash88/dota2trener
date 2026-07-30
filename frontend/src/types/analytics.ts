export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export interface PlayerBadges {
  heroVersatility: string;
  macroRole: string;
  microRole: string;
}

export interface FullPlayerAnalysis {
  badges: PlayerBadges;
  actionPlan: ActionPlanCard[];
}
