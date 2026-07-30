// 1. Definicja interfejsów dla TypeScripu
interface RoleDistribution {
  pos1: number; // Wartość procentowa 0-100
  pos2: number;
  pos3: number;
  pos4: number;
  pos5: number;
}

interface ActionPlanCard {
  id: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

interface PlayerProfileAnalysis {
  heroVersatilityLabel: string;
  macroRoleLabel: string;
  microRoleLabel: string;
  actionPlan: ActionPlanCard[];
}

// 2. Główna funkcja analityczna
export function analyzePlayerProfile(
  uniqueHeroesCount: number, 
  roles: RoleDistribution,
  winrate: number // Dodany parametr winrate (0-100) do generowania Action Planu
): PlayerProfileAnalysis {
  
  // ---------------------------------------------------------
  // ETAP 1: Hero Versatility (Pula Bohaterów)
  // ---------------------------------------------------------
  let heroVersatilityLabel = "";
  if (uniqueHeroesCount > 30) {
    heroVersatilityLabel = "Casual";
  } else if (uniqueHeroesCount > 20) {
    heroVersatilityLabel = "Fun player";
  } else if (uniqueHeroesCount > 5) {
    heroVersatilityLabel = "Focus";
  } else {
    heroVersatilityLabel = "Locked in";
  }

  // ---------------------------------------------------------
  // ETAP 2: Macro Role (Core vs Support)
  // ---------------------------------------------------------
  const corePct = roles.pos1 + roles.pos2 + roles.pos3;
  const suppPct = roles.pos4 + roles.pos5;
  
  const isCoreMain = corePct >= suppPct;
  const macroPct = isCoreMain ? corePct : suppPct;
  const macroType = isCoreMain ? "Core" : "Support";

  let macroRoleLabel = "";
  if (macroPct >= 90) {
    macroRoleLabel = `Locked in ${macroType}`;
  } else if (macroPct >= 70) {
    macroRoleLabel = `Focus na ${macroType}`;
  } else {
    macroRoleLabel = "Casualowy / Wariancyjny gracz";
  }

  // ---------------------------------------------------------
  // ETAP 3: Micro Role (Specjalizacja Konkretnej Pozycji)
  // ---------------------------------------------------------
  const roleArray = [
    { pos: "Pos 1", pct: roles.pos1 },
    { pos: "Pos 2", pct: roles.pos2 },
    { pos: "Pos 3", pct: roles.pos3 },
    { pos: "Pos 4", pct: roles.pos4 },
    { pos: "Pos 5", pct: roles.pos5 },
  ];
  
  roleArray.sort((a, b) => b.pct - a.pct); 
  const topRole = roleArray[0]; 
  const microPct = topRole.pct;

  let microRoleLabel = "";
  if (microPct >= 90) {
    microRoleLabel = `Locked in ${topRole.pos}`;
  } else if (microPct >= 70) {
    microRoleLabel = `Focus pozycji ${topRole.pos}`;
  } else if (microPct >= 50) {
    microRoleLabel = `Wariancyjny gracz ${topRole.pos}`;
  } else {
    microRoleLabel = "Gracz Casualowy, Zróżnicowanie";
  }

  // ---------------------------------------------------------
  // ETAP 4: Silnik Reguł - Generowanie kart Action Planu
  // ---------------------------------------------------------
  const actionPlan: ActionPlanCard[] = [];

  // 🔴 1. Syndrom "Zagram Wszystkim"
  if (uniqueHeroesCount > 20 && microPct < 50 && winrate < 48) {
    actionPlan.push({
      id: 'zagram_wszystkim',
      status: 'failed',
      message: 'Tracisz MMR przez ciągłe zmienianie postaci i ról. Brakuje Ci pamięci mięśniowej na konkretnych bohaterach. Zablokuj się na 1 pozycji i wyselekcjonuj do niej max 3-7 bohaterów.'
    });
  }

  // 🔴 2. Upadek One-Tricka
  if (uniqueHeroesCount <= 5 && winrate < 45) {
    actionPlan.push({
      id: 'upadek_one_tricka',
      status: 'failed',
      message: 'Grasz niezwykle wąską pulą postaci, ale mocno tracisz MMR. Prawdopodobnie wybierasz swoich bohaterów w ciemno (w złe matchupy) lub mocno wypadli z mety. Czas dodać 2-3 nowe postacie do Twojego arsenału.'
    });
  }

  // 🟡 3. Kryzys Tożsamości Core'a / Supporta
  if (macroPct >= 70 && microPct < 50 && winrate < 50) {
    actionPlan.push({
      id: 'kryzys_tozsamosci',
      status: 'warning',
      message: 'Trzymasz się ról Core\'owych, ale ciągle skaczesz między Midem, Carry i Offlanem. Każda z tych linii ma drastycznie inne tempo i timingi. Zdecyduj się na jedną z nich jako główną, aby ustabilizować swoją grę.'
    });
  }

  // 🟡 4. Stagnacja (Rzut Monetą)
  if (uniqueHeroesCount > 30 && winrate >= 48 && winrate <= 50) {
    actionPlan.push({
      id: 'stagnacja',
      status: 'warning',
      message: 'Stoisz w miejscu z MMR. Grasz dosłownie wszystkim, co daje dużo frajdy, ale Twoje mecze to rzut monetą. Jeśli chcesz przebić swój szklany sufit, musisz zawęzić pulę i przestać losować postacie.'
    });
  }

  // 🟢 5. Wzorowy Tryhard (Droga do Pro)
  if (uniqueHeroesCount <= 15 && microPct >= 70 && winrate >= 52) {
    actionPlan.push({
      id: 'wzorowy_tryhard',
      status: 'passed',
      message: 'Idealna specjalizacja! Konsekwentnie grasz swoją główną rolą i dopracowaną pulą bohaterów, co świetnie przekłada się na wzrost MMR. Nie zmieniaj niczego, po prostu kontynuuj grind!'
    });
  }

  // 🟢 6. Geniusz Draftu (Wszechstronny Dominator)
  if (uniqueHeroesCount > 25 && winrate >= 54) {
    actionPlan.push({
      id: 'geniusz_draftu',
      status: 'passed',
      message: 'Niesamowity Game Sense! Mimo skakania po rolach i graniu ogromną pulą postaci, deklasujesz przeciwników. Wygrywasz mecze dzięki elastyczności i wybieraniu idealnych kontr w drafcie. Oby tak dalej!'
    });
  }

  // Zwracamy gotowy, kompletny obiekt
  return {
    heroVersatilityLabel,
    macroRoleLabel,
    microRoleLabel,
    actionPlan
  };
}