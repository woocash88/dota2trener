// 1. Definicja interfejsów wejściowych
export interface FightStats {
  position: 1 | 2 | 3 | 4 | 5;     // Pozycja gracza w meczu
  heroDamage: number;              // Średnie zadane obrażenia
  damageTaken: number;             // Średnie przyjęte obrażenia
  assists: number;                 // Średnia liczba asyst
  deaths: number;                  // Średnia liczba śmierci (ogółem)
  
  // Dane z przegranych meczów (do weryfikacji itemizacji)
  avgDeathsInLosses: number;       // Średnia śmierci tylko w przegranych grach
  missingSurvivalItem: boolean;    // true, jeśli brak BKB/Manta/Linken w >60% przegranych
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

// 2. Główna funkcja analityczna
export function evaluateFightEfficiency(stats: FightStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];
  
  // Zabezpieczenie przed dzieleniem przez zero (jeśli gracz ma 0 śmierci, podstawiamy 1)
  const safeDeaths = stats.deaths > 0 ? stats.deaths : 1;

  // Wyliczenie głównych wskaźników
  const ddr = stats.heroDamage / safeDeaths; // Damage to Death Ratio
  const tdr = stats.damageTaken / safeDeaths; // Tank to Death Ratio
  const adr = stats.assists / safeDeaths;    // Assist to Death Ratio

  // ---------------------------------------------------------
  // 🔴 CZERWONE KARTKI (Błędy krytyczne)
  // ---------------------------------------------------------

  // Syndrom Szklanej Armaty (Pos 1, Pos 2)
  if ((stats.position === 1 || stats.position === 2) && ddr < 2500 && stats.deaths > 6) {
    cards.push({
      id: 'szklana_armata',
      status: 'failed',
      message: 'Zbyt często giniesz przed zadaniem kluczowych obrażeń w walkach. Twoje wejścia w teamfighty są zbyt wczesne lub stoisz za blisko frontu. Poczekaj, aż wrogowie użyją swoich głównych umiejętności ogłuszających, zanim dołączysz do walki.'
    });
  }

  // Zła Itemizacja - Brak Przeżywalności (Core: Pos 1, 2, 3)
  if ((stats.position === 1 || stats.position === 2 || stats.position === 3) && 
      stats.avgDeathsInLosses > 7 && 
      stats.missingSurvivalItem) {
    cards.push({
      id: 'zla_itemizacja',
      status: 'failed',
      message: 'Przegrywasz mecze przez chciwość w budowaniu przedmiotów. Przy tak dużej liczbie śmierci w przegranych grach brak przedmiotów defensywnych (np. BKB) to błąd krytyczny. Zrozum, że martwy bohater nie zadaje żadnych obrażeń.'
    });
  }

  // Chodzący Bankomat (Support: Pos 4, 5)
  if ((stats.position === 4 || stats.position === 5) && adr < 1.0 && stats.deaths > 8) {
    cards.push({
      id: 'chodzacy_bankomat',
      status: 'failed',
      message: 'Oddajesz wrogom zbyt dużo darmowego złota. Zanim walka na dobre się zacznie, Ty już padasz ofiarą inicjacji wroga. Popracuj nad pozycjonowaniem: rzucaj czary z maksymalnego dystansu i nie chodź samotnie po nieoświetlonej mapie.'
    });
  }

  // ---------------------------------------------------------
  // 🟡 ŻÓŁTE KARTKI (Ostrzeżenia)
  // ---------------------------------------------------------

  // Papierowy Inicjator (Offlane: Pos 3)
  if (stats.position === 3 && tdr < 4000) {
    cards.push({
      id: 'papierowy_inicjator',
      status: 'warning',
      message: 'Jako Offlaner zbyt szybko "wyparowujesz" w walkach drużynowych. Sprawdź, czy nie inicjujesz walk bez wsparcia drużyny (samobójstwa) lub czy kupujesz odpowiednie przedmioty pod typ obrażeń wroga (Armor vs Magic Resistance).'
    });
  }

  // ---------------------------------------------------------
  // 🟢 ZIELONE KARTKI (Wzorowe zachowania)
  // ---------------------------------------------------------

  // Mistrz Pozycjonowania (Pos 1, Pos 2)
  if ((stats.position === 1 || stats.position === 2) && ddr >= 8000 && stats.deaths <= 4) {
    cards.push({
      id: 'mistrz_pozycjonowania',
      status: 'passed',
      message: 'Perfekcyjne pozycjonowanie na mapie! Cechuje Cię niezwykła dyscyplina w teamfightach. Zadajesz masę obrażeń, trzymając się bezpiecznego dystansu i rzadko dając się złapać.'
    });
  }

  // Niewidzialny Anioł Stróż (Support: Pos 4, 5)
  if ((stats.position === 4 || stats.position === 5) && adr >= 2.5 && stats.deaths <= 6) {
    cards.push({
      id: 'aniol_stroz',
      status: 'passed',
      message: 'Świetnie wspierasz swoją drużynę z tylnej linii! Notujesz mnóstwo asyst, a jednocześnie nie oddajesz darmowych zabójstw wrogom. Twoje pozycjonowanie jako wsparcie jest wzorowe i bezpośrednio przekłada się na wygrane teamfighty.'
    });
  }

  return cards;
}