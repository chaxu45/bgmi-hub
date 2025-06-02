
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TournamentSchema, type Tournament } from '@/types';
import { z } from 'zod';
import crypto from 'crypto';

const tournamentsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'tournaments.json');

async function readTournaments(): Promise<Tournament[]> {
  try {
    const jsonData = await fs.promises.readFile(tournamentsFilePath, 'utf-8');
    const parsedData = JSON.parse(jsonData) as any[]; // Read as any first
    // Ensure imageUrls is an array, convert old string imageUrl if necessary
    return parsedData.map(tournament => {
      if (typeof tournament.imageUrl === 'string') {
        return { ...tournament, imageUrls: [tournament.imageUrl], imageUrl: undefined };
      }
      if (tournament.imageUrl === undefined && !Array.isArray(tournament.imageUrls)) {
         return { ...tournament, imageUrls: [] };
      }
      return tournament;
    }) as Tournament[];
  } catch (error) {
    console.error('Error reading tournaments file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw new Error('Could not read tournaments data.');
  }
}

async function writeTournaments(data: Tournament[]): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tournamentsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing tournaments file:', error);
    throw new Error('Could not write tournaments data.');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let tournamentsResult = await readTournaments();

    if (statusParam) {
      const statuses = statusParam.split(',') as Array<Tournament['status']>;
      tournamentsResult = tournamentsResult.filter(t => statuses.includes(t.status));
    }

    if (limit) {
      tournamentsResult = tournamentsResult.slice(0, limit);
    }

    return NextResponse.json(tournamentsResult);
  } catch (error) {
    console.error("Error in GET /api/tournaments:", error);
    return NextResponse.json({ message: 'Error fetching tournaments', error: (error as Error).message }, { status: 500 });
  }
}

const CreateTournamentSchema = TournamentSchema.omit({ id: true });

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
     // Ensure imageUrls is an array, even if not provided or empty
    const validatedBody = {
      ...requestBody,
      imageUrls: Array.isArray(requestBody.imageUrls) ? requestBody.imageUrls : [],
    };
    const validationResult = CreateTournamentSchema.safeParse(validatedBody);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid tournament data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const newTournamentData = validationResult.data;
    const tournaments = await readTournaments();
    
    const newTournament: Tournament = {
      ...newTournamentData,
      id: crypto.randomUUID(),
    };

    tournaments.push(newTournament);
    await writeTournaments(tournaments);

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/tournaments:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error creating tournament', error: errorMessage }, { status: 500 });
  }
}
