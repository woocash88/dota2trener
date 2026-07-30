import { NextResponse } from 'next/server';
import { analyzePlayer } from '../../../services/analyzeService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { steamId } = body;

    if (!steamId || typeof steamId !== 'string' || !steamId.trim()) {
      return NextResponse.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      );
    }

    const result = await analyzePlayer(steamId.trim());
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
