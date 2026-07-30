const STRATZ_API = 'https://api.stratz.com/graphql';

const SURVIVAL_ITEM_IDS = new Set([
  116,  // Black King Bar
  123,  // Linken's Sphere
  147,  // Manta Style
  156,  // Satanic
  250,  // Bloodthorn
  256,  // Aeon Disk
]);

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const PLAYER_QUERY = `
  query PlayerData($steamId: Long!) {
    player(steamAccountId: $steamId) {
      steamAccountId
      winCount
      lossCount
      heroes {
        heroId
        games
        wins
      }
      matches(request: { take: 20 }) {
        id
        players(steamAccountId: $steamId) {
          steamAccountId
          heroId
          role
          lane
          isVictory
          kills
          deaths
          assists
          goldPerMinute
          xpPerMinute
          heroDamage
          towerDamage
          heroHealing
          lastHits
          denies
          imp
          networth
          sentriesWard
          observerWardsDestroyed
          damageTaken
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
        }
      }
    }
  }
`;

export interface StratzPlayerMatch {
  id: number;
  players: Array<{
    steamAccountId: string;
    heroId: number;
    role: number | null;
    lane: number | null;
    isVictory: boolean;
    kills: number;
    deaths: number;
    assists: number;
    goldPerMinute: number;
    xpPerMinute: number;
    heroDamage: number;
    towerDamage: number;
    heroHealing: number;
    lastHits: number;
    denies: number;
    imp: number | null;
    networth: number | null;
    sentriesWard: number | null;
    observerWardsDestroyed: number | null;
    damageTaken: number | null;
    item0Id: number | null;
    item1Id: number | null;
    item2Id: number | null;
    item3Id: number | null;
    item4Id: number | null;
    item5Id: number | null;
  }>;
}

export interface StratzPlayerData {
  steamAccountId: string;
  winCount: number;
  lossCount: number;
  heroes: Array<{ heroId: number; games: number; wins: number }>;
  matches: StratzPlayerMatch[];
}

export { SURVIVAL_ITEM_IDS };

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.STRATZ_API_KEY;
  if (!apiKey) throw new Error('STRATZ_API_KEY not configured');

  const res = await fetch(STRATZ_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Dota2Coach/1.0',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Stratz API HTTP ${res.status}`);
  }

  const json: GraphQLResponse<T> = await res.json();
  if (json.errors) {
    throw new Error(`Stratz GraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

export async function fetchPlayerData(steamId: string): Promise<StratzPlayerData> {
  const data = await graphql<{ player: StratzPlayerData }>(PLAYER_QUERY, {
    steamId: parseInt(steamId, 10),
  });
  return data.player;
}
