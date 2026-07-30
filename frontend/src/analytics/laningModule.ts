export interface LaningStats {
  laneWinRate: number;     // Procent wygranych linii w ostatnich 50 grach (0-100)
  winrate: number;         // Ogólny procent wygranych (0-100)
  laningGpm: number;       // Średni Gold Per Minute w 10. minucie
  overallGpm: number;      // Średni ogólny Gold Per Minute z całego meczu
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export function evaluateLaningPhase(stats: LaningStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];

  // 🔴 CZERWONE KARTKI

  // Zmarnowany Potencjał
  if (stats.laneWinRate >= 70 && stats.winrate < 45) {
    cards.push({
      id: 'zmarnowany_potencjal',
      status: 'failed',
      message: 'Miażdżysz przeciwników na linii, ale nie potrafisz przełożyć tej przewagi na zwycięstwo. Jesteś świetny mechanicznie (last hity, harras), ale Twoje makro leży. Po 10. minucie biegasz po mapie bez konkretnego celu i oddajesz zdobytą przewagę (tzw. mid-game paralysis). Skup się na presji na wieże po wygranej linii.'
    });
  }

  // Worek Treningowy
  if (stats.laneWinRate <= 50 && stats.winrate < 50) {
    cards.push({
      id: 'worek_treningowy',
      status: 'failed',
      message: 'Przegrywasz zdecydowaną większość swoich linii, co ciągnie Twoją drużynę w dół. Masz problemy z podstawami mechaniki, dobieraniem przedmiotów startowych lub nie znasz matchupów. Musisz poćwiczyć agro-kontrolę (manipulację creepami) i skupić się na bezpiecznym last-hitowaniu.'
    });
  }

  // 🟢 ZIELONE KARTKI

  // Odbitka Gaming (zaktualizowane progi: Winrate >= 55, overallGpm >= 550)
  if (stats.laneWinRate <= 50 && stats.winrate >= 55 && stats.laningGpm < 400 && stats.overallGpm >= 550) {
    cards.push({
      id: 'odbitka_gaming',
      status: 'passed',
      message: 'Prawdziwy Comeback King! Często przegrywasz fazę linii, ale mimo to wyciągasz fenomenalny Winrate. Doskonale wiesz, jak odbić się od dna (tzw. recovery farm w dżungli) i imponująco pompujesz swój GPM w późniejszych fazach gry. Świetnie czytasz mapę, unikasz niepotrzebnych walk i miażdżysz wroga w late-gamie.'
    });
  }

  return cards;
}