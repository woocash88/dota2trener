// 1. Importy modułów reguł
import { analyzePlayerProfile } from './profileModule';
import { evaluateLaningPhase } from './laningModule';
import { evaluateFightEfficiency } from './fightModule';
import { evaluateVisionControl } from './visionModule';
import { evaluateObjectiveGaming } from './pushModule';
import { evaluateImpTrend } from './trendModule';
import { evaluatePsychologyAndTilt } from './psychologyModule';

// 2. Interfejs wyjściowy dla Frontendu
export interface FullPlayerAnalysis {
  badges: {
    heroVersatility: string;
    macroRole: string;
    microRole: string;
  };
  actionPlan: Array<{
    id: string;
    status: 'passed' | 'failed' | 'warning';
    message: string;
  }>;
}

// 3. TWOJA FUNKCJA ANALIZY OŚI CZASU GPM (Pojedynczy mecz)
function calculateTiltFactor(matchTimeline: any): string {
  const earlyDeaths = matchTimeline.deaths.filter((d: any) => d.time <= 600).length;
  
  if (earlyDeaths < 2) return "Normal Game"; 

  const gpmAvg = (matchTimeline.gpm10 + matchTimeline.gpm15 + matchTimeline.gpm20 + matchTimeline.gpm25) / 4;
  const gpmDeltaPct = ((matchTimeline.gpmEnd - gpmAvg) / gpmAvg) * 100;

  if (gpmDeltaPct <= -50) return "Tragedia tilt";
  if (gpmDeltaPct <= -25) return "Wykolejony, tilt";
  if (gpmDeltaPct < 0)    return "Trudna gra, tilt";
  if (gpmDeltaPct < 25)   return "Trudna gra, lekki comeback";
  if (gpmDeltaPct < 50)   return "Locked in";
  return "Full focus, comeback";
}

// 4. PARSER AGREGUJĄCY HISTORIĘ GIER
function parsePsychologyData(matchHistory: any[]): any {
  let gamesWithBadStart = 0;
  let tiltGamesCount = 0;
  let comebackGamesCount = 0;

  for (const match of matchHistory) {
    // Zakładamy, że obiekt meczu ma w sobie pole timeline
    const status = calculateTiltFactor(match.timeline);

    if (status !== "Normal Game") {
      gamesWithBadStart++;

      if (status === "Tragedia tilt" || status === "Wykolejony, tilt") {
        tiltGamesCount++;
      }
      
      if (status === "Locked in" || status === "Full focus, comeback") {
        comebackGamesCount++;
      }
    }
  }

  return { gamesWithBadStart, tiltGamesCount, comebackGamesCount };
}

// 5. GŁÓWNY ORCHESTRATOR SILNIKA
export function runFullAnalytics(
  rawMatchHistory: any[], // Surowa tablica 50 meczów prosto z API
  profileInput: any,      // Dane do profilu (count, roles, global winrate)
  laningInput: any,       // Zagregowane dane do linii
  fightInput: any,        // Zagregowane dane do walk
  visionInput: any,       // Zagregowane dane do wizji
  pushInput: any,         // Zagregowane dane do pushu
  impInput: any           // Zagregowane dane do IMP trendu
): FullPlayerAnalysis {
  
  // Uruchamiamy parser psychologii na surowej historii gier
  const psychologyData = parsePsychologyData(rawMatchHistory);

  // Uruchamiamy wszystkie silniki oceniania
  const profileResult = analyzePlayerProfile(profileInput.count, profileInput.roles, profileInput.winrate);
  const laningCards = evaluateLaningPhase(laningInput);
  const fightCards = evaluateFightEfficiency(fightInput);
  const visionCards = evaluateVisionControl(visionInput);
  const pushCards = evaluateObjectiveGaming(pushInput);
  const trendCards = evaluateImpTrend(impInput);
  const psychologyCards = evaluatePsychologyAndTilt(psychologyData);

  // Łączymy wszystkie wygenerowane karty w jeden Action Plan
  const allCards = [
    ...profileResult.actionPlan,
    ...laningCards,
    ...fightCards,
    ...visionCards,
    ...pushCards,
    ...trendCards,
    ...psychologyCards
  ];

  return {
    badges: {
      heroVersatility: profileResult.heroVersatilityLabel,
      macroRole: profileResult.macroRoleLabel,
      microRole: profileResult.microRoleLabel
    },
    actionPlan: allCards
  };
}