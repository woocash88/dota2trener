export interface PsychologyStats {
  gamesWithBadStart: number; // Liczba gier z 50, gdzie wczesne śmierci >= 2
  tiltGamesCount: number;    // Ile razy wyszło "Tragedia tilt" lub "Wykolejony, tilt"
  comebackGamesCount: number;// Ile razy wyszło "Locked in" lub "Full focus, comeback"
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export function evaluatePsychologyAndTilt(stats: PsychologyStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];

  // Jeśli gracz miał mniej niż 5 gier ze złym startem w próbce 50 meczów,
  // próbka jest zbyt mała, by obiektywnie ocenić jego psychikę.
  if (stats.gamesWithBadStart < 5) {
    return cards;
  }

  // Obliczamy procentowe wskaźniki reakcji na stres
  const tiltRate = (stats.tiltGamesCount / stats.gamesWithBadStart) * 100;
  const comebackRate = (stats.comebackGamesCount / stats.gamesWithBadStart) * 100;

  // 🔴 CZERWONE KARTKI
  if (tiltRate >= 40) {
    cards.push({
      id: 'slaba_psychika',
      status: 'failed',
      message: 'Twoja psychika pęka przy najmniejszym niepowodzeniu. Jeśli zginiesz 2-3 razy na linii, całkowicie tracisz koncentrację i zaczynasz grać bezmyślnie, drastycznie niszcząc swoją ekonomię. Każda gra jest do wygrania – dopóki Twój Ancient stoi, masz obowiązek grać na 100%.'
    });
  }

  // 🟡 ŻÓŁTE KARTKI
  // Warunek zabezpieczony przed nałożeniem się z czerwoną kartką
  if (tiltRate >= 20 && tiltRate < 40) {
    cards.push({
      id: 'niestabilny_emocjonalnie',
      status: 'warning',
      message: 'Zbyt łatwo dajesz się wytrącić z równowagi. Gdy początek meczu nie idzie po Twojej myśli, zdarza Ci się wejść w tryb frustracji, co widać po spadkach GPM w mid-game. Popracuj nad wyciszeniem – jedna zła linia nie definiuje całego meczu.'
    });
  }

  // 🟢 ZIELONE KARTKI
  if (comebackRate >= 35) {
    cards.push({
      id: 'zelazna_psychika',
      status: 'passed',
      message: 'Masz elitarną, żelazną psychikę! Nawet jeśli wróg zniszczy Cię na początku linii, Ty nigdy się nie poddajesz. Potrafisz zablokować emocje, wejść w tryb maksymalnego skupienia (Locked in) i spektakularnie odwrócić losy spotkania. Twardy charakter to cecha graczy z najwyższych rang.'
    });
  }

  return cards;
}