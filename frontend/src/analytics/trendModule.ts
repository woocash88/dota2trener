export interface ImpStats {
  averageImp: number;  // Średni IMP wyciągnięty z globalnej próbki (np. ost. 50 meczów)
  winrate: number;     // Procent wygranych w tej samej próbce (0 - 100)
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export function evaluateImpTrend(stats: ImpStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];

  // 🔴 CZERWONE KARTKI
  if (stats.averageImp <= -20) {
    cards.push({
      id: 'spadek_formy',
      status: 'failed',
      message: 'Twoja osobista forma drastycznie spadła. Na przestrzeni kilkudziesięciu ostatnich meczów grasz zauważalnie poniżej standardów swojej rangi (ujemny wskaźnik IMP). Być może grasz zmęczony, na autopilocie, lub testujesz mechaniki i bohaterów, których jeszcze nie opanowałeś. Zrób sobie przerwę lub wróć do swoich najlepszych postaci.'
    });
  }

  // 🟡 ŻÓŁTE KARTKI
  if (stats.averageImp < 0 && stats.averageImp > -20 && stats.winrate >= 50) {
    cards.push({
      id: 'pasazer',
      status: 'warning',
      message: 'Wygrywasz mecze, ale Twój długoterminowy wpływ na grę jest poniżej średniej dla Twojej rangi. Oznacza to, że jesteś statystycznie "niesiony" przez sojuszników (tzw. bycie carrowanym). Aby przebić się wyżej i utrzymać MMR, musisz zacząć wywierać większy, samodzielny nacisk na mapę.'
    });
  }

  // 🟢 ZIELONE KARTKI
  if (stats.averageImp >= 20 && stats.winrate < 40) {
    cards.push({
      id: 'team_diff',
      status: 'passed',
      message: 'Przegrywasz mecze, ale statystyka mówi jasno: to nie Twoja wina! Twój wskaźnik IMP jest bardzo wysoki na przestrzeni wielu meczów. Oznacza to, że wyciągasz ze swoich bohaterów znacznie więcej niż wynosi norma w Twojej randze, jednak system dobiera Ci słabszych sojuszników. Nie tiltuj się – przy takiej formie długa passa wygranych to tylko kwestia czasu.'
    });
  }

  if (stats.averageImp >= 30) {
    cards.push({
      id: 'w_zonie',
      status: 'passed',
      message: 'Grasz fenomenalnie, absolutnie deklasując swoją obecną rangę w długim horyzoncie czasowym! Utrzymanie tak potężnego wskaźnika IMP przez kilkadziesiąt meczów wskazuje, że mechanicznie i decyzyjnie należysz wyżej. Jesteś w tzw. "Zonie" – wykorzystaj ten moment na maksymalny grind MMR.'
    });
  }

  return cards;
}