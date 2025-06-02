
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TournamentLeaderboardSchema, type TournamentLeaderboard } from '@/types';
import { z } from 'zod';

const leaderboardFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'leaderboard.json');

async function readLeaderboard(): Promise<TournamentLeaderboard | null> {
  try {
    const jsonData = await fs.promises.readFile(leaderboardFilePath, 'utf-8');
    return JSON.parse(jsonData) as TournamentLeaderboard;
  } catch (error) {
    console.error('Error reading leaderboard file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create a default one
      const defaultLeaderboard: TournamentLeaderboard = {
        tournamentId: `default-tournament-${Date.now()}`,
        tournamentName: 'New Tournament Leaderboard',
        leaderboardImageUrl: undefined,
      };
      await writeLeaderboard(defaultLeaderboard);
      return defaultLeaderboard;
    }
    throw new Error('Could not read leaderboard data.');
  }
}

async function writeLeaderboard(data: TournamentLeaderboard): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    // Ensure the directory exists
    const dir = path.dirname(leaderboardFilePath);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(leaderboardFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing leaderboard file:', error);
    throw new Error('Could not write leaderboard data.');
  }
}

export async function GET() {
  try {
    let leaderboard = await readLeaderboard();
    if (!leaderboard) {
       // This case should ideally be handled by readLeaderboard creating a default
       return NextResponse.json({ 
         tournamentId: `default-fallback-${Date.now()}`, 
         tournamentName: 'Leaderboard (Not Initialized)', 
         leaderboardImageUrl: undefined 
       }, { status: 200 });
    }
    return NextResponse.json(leaderboard);
  } catch (error) {
     console.error("Error in GET /api/leaderboards:", error);
     return NextResponse.json({ message: 'Error fetching leaderboard', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json();
    // Ensure leaderboardImageUrl is handled correctly if missing from payload
    const parsedBody = {
        ...requestBody,
        leaderboardImageUrl: requestBody.leaderboardImageUrl || undefined,
    };
    const validationResult = TournamentLeaderboardSchema.safeParse(parsedBody);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid leaderboard data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedLeaderboardData = validationResult.data;
    await writeLeaderboard(updatedLeaderboardData);

    return NextResponse.json(updatedLeaderboardData, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/leaderboards:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error updating leaderboard', error: errorMessage }, { status: 500 });
  }
}
