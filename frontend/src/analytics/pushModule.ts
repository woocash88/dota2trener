export interface PushStats {
  position: 1 | 2 | 3 | 4 | 5;
  avgHeroDamage: number;    // Średnie obrażenia zadane bohaterom
  avgTowerDamage: number;   // Średnie obrażenia zadane budynkom
  winrate: number;          // Procent wygranych w próbce
}

export interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export function evaluateObjectiveGaming(stats: PushStats): ActionPlanCard[] {
  const cards: ActionPlanCard[] = [];

  // Wykluczamy supporty (4 i 5)
  if (stats.position === 4 || stats.position === 5) {
    return cards;
  }

  // 🔴 CZERWONE KARTKI
  
  // Pacyfista Budowlany (Zaktualizowane progi dla pozycji 1, 2, 3)
  if ((stats.position === 1 || stats.position === 2 || stats.position === 3) && 
      stats.avgHeroDamage >= 35000 && 
      stats.avgTowerDamage < 3000) {
    cards.push({
      id: 'pacyfista_budowlany',
      status: 'failed',
      message: 'Mimo wykręcania gigantycznych obrażeń w walkach drużynowych (ponad 35k), całkowicie ignorujesz budynki. Po wygranych starciach Twoim pierwszym instynktem powinno być niszczenie wież, tymczasem oddajesz inicjatywę i pozwalasz wrogom wrócić do gry. Pamiętaj: same zabójstwa nie niszczą Ancienta.'
    });
  }

  // 🟡 ŻÓŁTE KARTKI
  
  // Kruszarka (Zabezpieczenie: nie pokazujemy, jeśli gracz dostał już czerwoną kartkę pacyfisty)
  if (stats.avgTowerDamage < 5500 && stats.winrate < 50 && stats.avgHeroDamage < 35000) {
    cards.push({
      id: 'kruszarka',
      status: 'warning',
      message: 'Masz problem z domykaniem meczów, przez co Twój Winrate spada poniżej 50%. Twoje obrażenia zadawane strukturom są zbyt niskie jak na rolę Core. Przestań grać bezcelowy "deathmatch" – po każdym udanym ganku natychmiast wywieraj presję na mapie i uderzaj w budynki.'
    });
  }

  // 🟢 ZIELONE KARTKI
  
  // Człowiek Demolka (Potężny próg 10 000+ Tower Damage)
  if (stats.avgTowerDamage >= 10000) {
    cards.push({
      id: 'czlowiek_demolka',
      status: 'passed',
      message: 'Absolutna dominacja na mapie! Przekuwasz każdy wygrany teamfight w zniszczone struktury wroga, generując potężne obrażenia budynków. Rozjeżdżasz bazę przeciwnika jak walec, nie dając im chwili na oddech. Taki styl gry to najprostsza i najszybsza droga do wygrywania meczów w pojedynkę.'
    });
  }

  return cards;
}