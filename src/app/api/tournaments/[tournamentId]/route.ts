
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TournamentSchema, type Tournament } from '@/types';
import { z } from 'zod';

const tournamentsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'tournaments.json');

async function readTournaments(): Promise<Tournament[]> {
  try {
    const jsonData = await fs.promises.readFile(tournamentsFilePath, 'utf-8');
    const parsedData = JSON.parse(jsonData) as any[];
    return parsedData.map(tournament => ({
      ...tournament,
      imageUrls: Array.isArray(tournament.imageUrls) ? tournament.imageUrls : (typeof tournament.imageUrl === 'string' ? [tournament.imageUrl] : []),
      imageUrl: undefined // Ensure old single imageUrl field is removed
    })) as Tournament[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading tournaments file:', error);
    throw new Error('Could not read tournaments data.');
  }
}

async function writeTournaments(data: Tournament[]): Promise<void> {
  try {
    const dir = path.dirname(tournamentsFilePath);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tournamentsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing tournaments file:', error);
    throw new Error('Could not write tournaments data.');
  }
}

const UpdateTournamentBodySchema = TournamentSchema.omit({ id: true });

export async function GET(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const { tournamentId } = params;
    const tournaments = await readTournaments();
    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }
    return NextResponse.json(tournament);
  } catch (error) {
    console.error(`Error in GET /api/tournaments/[tournamentId]:`, error);
    return NextResponse.json({ message: 'Error fetching tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const { tournamentId } = params;
    const requestBody = await request.json();
     const validatedBody = {
      ...requestBody,
      imageUrls: Array.isArray(requestBody.imageUrls) ? requestBody.imageUrls : [],
    };

    const validationResult = UpdateTournamentBodySchema.safeParse(validatedBody);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid tournament data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedTournamentData = validationResult.data;
    let tournaments = await readTournaments();
    const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);

    if (tournamentIndex === -1) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    tournaments[tournamentIndex] = {
      ...tournaments[tournamentIndex], // Keep original ID
      ...updatedTournamentData,
    };

    await writeTournaments(tournaments);
    return NextResponse.json(tournaments[tournamentIndex]);
  } catch (error) {
    console.error(`Error in PUT /api/tournaments/[tournamentId]:`, error);
    return NextResponse.json({ message: 'Error updating tournament', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tournamentId: string } }) {
  try {
    const { tournamentId } = params;
    let tournaments = await readTournaments();
    const initialLength = tournaments.length;
    tournaments = tournaments.filter(t => t.id !== tournamentId);

    if (tournaments.length === initialLength) {
      return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
    }

    await writeTournaments(tournaments);
    return NextResponse.json({ message: 'Tournament deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error in DELETE /api/tournaments/[tournamentId]:`, error);
    return NextResponse.json({ message: 'Error deleting tournament', error: (error as Error).message }, { status: 500 });
  }
}
