
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TeamSchema, PlayerSchema, type Team, type Player } from '@/types';
import { z } from 'zod';
import crypto from 'crypto';

const teamsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'teams.json');

async function readTeams(): Promise<Team[]> {
  try {
    const jsonData = await fs.promises.readFile(teamsFilePath, 'utf-8');
    return JSON.parse(jsonData) as Team[];
  } catch (error) {
    console.error('Error reading teams file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw new Error('Could not read teams data.');
  }
}

async function writeTeams(data: Team[]): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(teamsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing teams file:', error);
    throw new Error('Could not write teams data.');
  }
}

export async function GET() {
  try {
    const teams = await readTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error in GET /api/teams:", error);
    return NextResponse.json({ message: 'Error fetching teams', error: (error as Error).message }, { status: 500 });
  }
}

const CreatePlayerSchema = PlayerSchema.omit({ id: true });
const CreateTeamSchema = TeamSchema.omit({ id: true, roster: true }).extend({
  roster: z.array(CreatePlayerSchema).optional().default([]),
});


export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const validationResult = CreateTeamSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid team data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const newTeamData = validationResult.data;
    const teams = await readTeams();
    
    const newTeam: Team = {
      ...newTeamData,
      id: crypto.randomUUID(),
      roster: newTeamData.roster.map(player => ({ ...player, id: crypto.randomUUID() })),
    };

    teams.push(newTeam);
    await writeTeams(teams);

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/teams:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error creating team', error: errorMessage }, { status: 500 });
  }
}
