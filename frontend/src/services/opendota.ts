const BASE = 'https://api.opendota.com/api';

export interface PlayerWl {
  win: number;
  lose: number;
}

export interface PlayerHeroStat {
  hero_id: number;
  games: number;
  win: number;
}

export interface RecentMatch {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  hero_damage: number;
  tower_damage: number;
  hero_healing: number;
  last_hits: number;
  denies: number;
  lane_role: number | null;
  party_size: number | null;
}

/** Determine if the player won based on slot + radiant_win */
export function playerWon(match: RecentMatch): boolean {
  return match.radiant_win === (match.player_slot < 128);
}

export async function fetchPlayerWl(steamId: string): Promise<PlayerWl> {
  const res = await fetch(`${BASE}/players/${steamId}/wl`);
  if (!res.ok) throw new Error(`Failed to fetch W/L: ${res.status}`);
  return res.json();
}

export async function fetchPlayerHeroes(steamId: string): Promise<PlayerHeroStat[]> {
  const res = await fetch(`${BASE}/players/${steamId}/heroes`);
  if (!res.ok) throw new Error(`Failed to fetch hero stats: ${res.status}`);
  return res.json();
}

export async function fetchRecentMatches(steamId: string): Promise<RecentMatch[]> {
  const res = await fetch(`${BASE}/players/${steamId}/recentMatches`);
  if (!res.ok) throw new Error(`Failed to fetch recent matches: ${res.status}`);
  return res.json();
}
