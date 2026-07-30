import { runFullAnalytics } from '../analytics/index';
import { fetchPlayerData, SURVIVAL_ITEM_IDS } from './stratz';
import {
  fetchPlayerWl,
  fetchPlayerHeroes,
  fetchRecentMatches,
  playerWon,
  type RecentMatch,
} from './opendota';

// --- Types for position/role ---

type Position = 1 | 2 | 3 | 4 | 5;

function laneToPosition(lane: number | null, role: number | null): Position {
  // lane: 1=safelane, 2=mid, 3=offlane, 4=jungle
  // role: 1=core, 2=support
  if (lane === 2) return 2; // mid
  if (lane === 3) return 3; // offlane
  if (lane === 4) return 4; // jungle

  // safelane (lane=1) — split based on role
  if (lane === 1) {
    return role === 2 ? 5 : 1;
  }

  // No lane data — guess by role
  if (role === 2) return 5;
  return 1;
}

function determinePositionFromMatches(
  matches: Array<{
    players: Array<{
      lane: number | null;
      role: number | null;
    }>;
  }>,
  _steamId: string
): Position {
  // Find our player's data across all matches and pick most common position
  const posCounts: Record<number, number> = {};
  for (const match of matches) {
    const player = match.players?.[0];
    if (!player) continue;
    const pos = laneToPosition(player.lane, player.role);
    posCounts[pos] = (posCounts[pos] || 0) + 1;
  }

  const entries = Object.entries(posCounts).sort((a, b) => b[1] - a[1]);
  return entries.length > 0 ? (Number(entries[0][0]) as Position) : 1;
}

// --- Fallback to OpenDota ---

async function fallbackAnalyze(steamId: string) {
  const [wl, heroStats, recentMatches] = await Promise.all([
    fetchPlayerWl(steamId),
    fetchPlayerHeroes(steamId),
    fetchRecentMatches(steamId),
  ]);

  const totalGames = wl.win + wl.lose;
  if (totalGames === 0) throw new Error('No matches found');

  const winrate = Math.round((wl.win / totalGames) * 100);
  const uniqueHeroesCount = heroStats.filter((h) => h.games > 0).length;

  const avgFn = (nums: number[]) =>
    nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

  const avgKills = avgFn(recentMatches.map((m) => m.kills));
  const avgDeaths = avgFn(recentMatches.map((m) => m.deaths));
  const avgAssists = avgFn(recentMatches.map((m) => m.assists));
  const avgGpm = avgFn(recentMatches.map((m) => m.gold_per_min));
  const avgHeroDamage = avgFn(recentMatches.map((m) => m.hero_damage));
  const avgTowerDamage = avgFn(recentMatches.map((m) => m.tower_damage));

  const lostMatches = recentMatches.filter((m) => !playerWon(m));
  const avgDeathsInLosses =
    lostMatches.length > 0
      ? avgFn(lostMatches.map((m) => m.deaths))
      : avgDeaths;

  const matchHistory = recentMatches.map((m) => ({
    timeline: {
      deaths: Array.from({ length: Math.min(m.deaths, 10) }, (_, i) => ({
        time: 300 + i * 120,
      })),
      gpm10: Math.round(m.gold_per_min * 0.6),
      gpm15: Math.round(m.gold_per_min * 0.7),
      gpm20: Math.round(m.gold_per_min * 0.85),
      gpm25: Math.round(m.gold_per_min * 0.95),
      gpmEnd: m.gold_per_min,
    },
  }));

  const kda =
    recentMatches.length > 0
      ? (avgKills + avgAssists) / Math.max(avgDeaths, 1)
      : 1;

  const result = runFullAnalytics(
    matchHistory,
    { count: uniqueHeroesCount, roles: { pos1: 50, pos2: 0, pos3: 0, pos4: 0, pos5: 0 }, winrate },
    {
      laneWinRate: Math.round((recentMatches.filter((m) => playerWon(m)).length / recentMatches.length) * 100),
      winrate,
      laningGpm: Math.round(avgGpm * 0.7),
      overallGpm: Math.round(avgGpm),
    },
    {
      position: 1,
      heroDamage: Math.round(avgHeroDamage),
      damageTaken: Math.round(avgHeroDamage * 0.7),
      assists: Math.round(avgAssists),
      deaths: Math.round(avgDeaths),
      avgDeathsInLosses: Math.round(avgDeathsInLosses),
      missingSurvivalItem: avgDeathsInLosses > 8,
    },
    { position: 1, sentriesPlaced: 2, observersDestroyed: 0 },
    {
      position: 1,
      avgHeroDamage: Math.round(avgHeroDamage),
      avgTowerDamage: Math.round(avgTowerDamage),
      winrate,
    },
    { averageImp: Math.round((kda - 3) * 5), winrate },
  );

  return {
    badges: result.badges,
    actionPlan: result.actionPlan,
  };
}

// --- Main analyze function ---

export async function analyzePlayer(steamId: string) {
  try {
    const playerData = await fetchPlayerData(steamId);

    if (!playerData || (playerData.winCount === 0 && playerData.lossCount === 0)) {
      throw new Error('No matches found');
    }

    const totalGames = playerData.winCount + playerData.lossCount;
    const winrate = Math.round((playerData.winCount / totalGames) * 100);
    const uniqueHeroesCount = playerData.heroes.filter((h) => h.games > 0).length;
    const matches = playerData.matches || [];

    // --- Determine position from Stratz lane/role data ---
    const position = determinePositionFromMatches(matches, playerData.steamAccountId);

    // --- Role distribution from matches ---
    const laneRoles: Array<{ lane: number | null; role: number | null }> = [];
    for (const m of matches) {
      const pl = m.players?.[0];
      if (pl) {
        laneRoles.push({ lane: pl.lane, role: pl.role });
      }
    }

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, pos5 = 0;
    for (const lr of laneRoles) {
      const p = laneToPosition(lr.lane, lr.role);
      if (p === 1) pos1++; else if (p === 2) pos2++;
      else if (p === 3) pos3++; else if (p === 4) pos4++;
      else if (p === 5) pos5++;
    }
    const total = pos1 + pos2 + pos3 + pos4 + pos5 || 1;
    const roles = {
      pos1: Math.round((pos1 / total) * 100),
      pos2: Math.round((pos2 / total) * 100),
      pos3: Math.round((pos3 / total) * 100),
      pos4: Math.round((pos4 / total) * 100),
      pos5: Math.round((pos5 / total) * 100),
    };

    // --- Aggregate per-match stats ---
    const playerMatches = matches
      .map((m) => m.players?.[0])
      .filter(Boolean);

    const avgFn = (nums: number[]) =>
      nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

    const avgKills = avgFn(playerMatches.map((p) => p.kills));
    const avgDeaths = avgFn(playerMatches.map((p) => p.deaths));
    const avgAssists = avgFn(playerMatches.map((p) => p.assists));
    const avgGpm = avgFn(playerMatches.map((p) => p.goldPerMinute));
    const avgHeroDamage = avgFn(playerMatches.map((p) => p.heroDamage));
    const avgTowerDamage = avgFn(playerMatches.map((p) => p.towerDamage));
    const avgDamageTaken = avgFn(
      playerMatches
        .filter((p) => p.damageTaken != null)
        .map((p) => p.damageTaken as number)
    );
    const avgSentries = avgFn(
      playerMatches
        .filter((p) => p.sentriesWard != null)
        .map((p) => p.sentriesWard as number)
    );
    const avgObsDestroyed = avgFn(
      playerMatches
        .filter((p) => p.observerWardsDestroyed != null)
        .map((p) => p.observerWardsDestroyed as number)
    );
    const avgImp = avgFn(
      playerMatches
        .filter((p) => p.imp != null)
        .map((p) => p.imp as number)
    );

    // --- Laning inputs ---
    const wins = playerMatches.filter((p) => p.isVictory).length;
    const laneWinRate = playerMatches.length > 0
      ? Math.round((wins / playerMatches.length) * 100)
      : 50;
    const laningGpm = Math.round(avgGpm * 0.7);

    // --- Fight inputs ---
    const lostPlayerMatches = playerMatches.filter((p) => !p.isVictory);
    const avgDeathsInLosses =
      lostPlayerMatches.length > 0
        ? avgFn(lostPlayerMatches.map((p) => p.deaths))
        : avgDeaths;

    // Check items in loss matches for survival items
    let missingSurvivalItemCount = 0;
    for (const p of lostPlayerMatches) {
      const items = [p.item0Id, p.item1Id, p.item2Id, p.item3Id, p.item4Id, p.item5Id];
      const hasSurvival = items.some((itemId) => itemId != null && SURVIVAL_ITEM_IDS.has(itemId));
      if (!hasSurvival) missingSurvivalItemCount++;
    }
    const missingSurvivalItem =
      lostPlayerMatches.length > 0 &&
      missingSurvivalItemCount / lostPlayerMatches.length > 0.6;

    // --- Vision inputs ---
    const isSupport = position === 4 || position === 5;
    const sentriesPlaced = avgSentries > 0 ? Math.round(avgSentries) : (isSupport ? 8 : 2);
    const observersDestroyed = avgObsDestroyed > 0 ? Math.round(avgObsDestroyed) : (isSupport ? 3 : 0);

    // --- Psychology ---
    const matchHistory = playerMatches.map((p) => ({
      timeline: {
        deaths: Array.from({ length: Math.min(p.deaths, 10) }, (_, i) => ({
          time: 300 + i * 120,
        })),
        gpm10: Math.round(p.goldPerMinute * 0.6),
        gpm15: Math.round(p.goldPerMinute * 0.7),
        gpm20: Math.round(p.goldPerMinute * 0.85),
        gpm25: Math.round(p.goldPerMinute * 0.95),
        gpmEnd: p.goldPerMinute,
      },
    }));

    const result = runFullAnalytics(
      matchHistory,
      { count: uniqueHeroesCount, roles, winrate },
      { laneWinRate, winrate, laningGpm, overallGpm: Math.round(avgGpm) },
      {
        position,
        heroDamage: Math.round(avgHeroDamage),
        damageTaken: avgDamageTaken > 0 ? Math.round(avgDamageTaken) : Math.round(avgHeroDamage * 0.7),
        assists: Math.round(avgAssists),
        deaths: Math.round(avgDeaths),
        avgDeathsInLosses: Math.round(avgDeathsInLosses),
        missingSurvivalItem,
      },
      {
        position,
        sentriesPlaced,
        observersDestroyed,
      },
      {
        position,
        avgHeroDamage: Math.round(avgHeroDamage),
        avgTowerDamage: Math.round(avgTowerDamage),
        winrate,
      },
      {
        averageImp: Math.round(avgImp),
        winrate,
      }
    );

    return {
      badges: result.badges,
      actionPlan: result.actionPlan,
    };
  } catch (err) {
    // Fallback to OpenDota
    console.warn('Stratz API failed, falling back to OpenDota:', (err as Error).message);
    return fallbackAnalyze(steamId);
  }
}
