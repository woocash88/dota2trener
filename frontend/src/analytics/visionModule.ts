export interface VisionStats {
  position: 1 | 2 | 3 | 4 | 5;
  sentriesPlaced: number;       // Średnia postawionych Sentry na mecz
  observersDestroyed: number;   // Średnia zniszczonych Observerów na mecz
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export function evaluateVisionControl(stats: VisionStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];

  // Wizja to zadanie głównie dla supportów, więc analizujemy tylko pozycje 4 i 5
  if (stats.position !== 4 && stats.position !== 5) {
    return cards; 
  }

  // Zabezpieczenie przed dzieleniem przez zero
  const safeSentries = stats.sentriesPlaced > 0 ? stats.sentriesPlaced : 1;
  const dwr = (stats.observersDestroyed / safeSentries) * 100;

  // 🔴 CZERWONE KARTKI
  if (stats.sentriesPlaced < 6) {
    cards.push({
      id: 'slepiec',
      status: 'failed',
      message: 'Całkowicie oddajesz wrogom kontrolę nad mapą. Stawiasz tak mało Sentry Wardów, że przeciwnicy mogą swobodnie obserwować Twoją dżunglę. Brak dewardowania to bezpośredni powód, dla którego Twój Carry jest ciągle łapany (gankowany).'
    });
  }

  // 🟡 ŻÓŁTE KARTKI
  if (stats.sentriesPlaced >= 10 && dwr < 25) {
    cards.push({
      id: 'przecietny_latarnik',
      status: 'warning',
      message: 'Wydajesz fortunę na Sentry Wardy, ale skuteczność ich wykorzystania jest niska. Zamiast "zgadywać" i stawiać wizję w ciemno, zacznij obserwować ekwipunek wrogich supportów. Szukaj wardów tam, gdzie fizycznie widziałeś przeciwnika.'
    });
  }

  // 🟢 ZIELONE KARTKI
  if (stats.sentriesPlaced >= 14 && dwr >= 50) {
    cards.push({
      id: 'inwigilator',
      status: 'passed',
      message: 'Masz wybitne Vision IQ! Czytasz ruchy wrogich supportów jak otwartą książkę. Bezlitośnie inwigilujesz mapę, a Twoje Sentry błyskawicznie niszczą wrogą wizję. Odcinasz przeciwników od terytorium i zapewniasz drużynie ogromną przewagę.'
    });
  }

  return cards;
}