
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TeamSchema, PlayerSchema, type Team } from '@/types';
import { z } from 'zod';
import crypto from 'crypto';

const teamsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'teams.json');

async function readTeams(): Promise<Team[]> {
  try {
    const jsonData = await fs.promises.readFile(teamsFilePath, 'utf-8');
    return JSON.parse(jsonData) as Team[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // If file doesn't exist, return empty array
    }
    console.error('Error reading teams file:', error);
    throw new Error('Could not read teams data.');
  }
}

async function writeTeams(data: Team[]): Promise<void> {
  try {
    const dir = path.dirname(teamsFilePath);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(teamsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing teams file:', error);
    throw new Error('Could not write teams data.');
  }
}

// Schema for validating the body of a PUT request (similar to creating a new team)
const UpdateTeamBodySchema = TeamSchema.omit({ id: true, roster: true }).extend({
  roster: z.array(PlayerSchema.omit({ id: true })).min(1, "At least one player is required in the roster."),
});


export async function GET(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { teamId } = params;
    const teams = await readTeams();
    const team = teams.find(t => t.id === teamId);

    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error(`Error in GET /api/teams/[teamId]:`, error);
    return NextResponse.json({ message: 'Error fetching team', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { teamId } = params;
    const requestBody = await request.json();

    const validationResult = UpdateTeamBodySchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid team data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedTeamData = validationResult.data;
    let teams = await readTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);

    if (teamIndex === -1) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    // Update the team, regenerate player IDs for simplicity
    teams[teamIndex] = {
      ...teams[teamIndex], // Keep original ID
      name: updatedTeamData.name,
      logoUrl: updatedTeamData.logoUrl,
      description: updatedTeamData.description,
      roster: updatedTeamData.roster.map(player => ({ ...player, id: crypto.randomUUID() })),
    };

    await writeTeams(teams);
    return NextResponse.json(teams[teamIndex]);
  } catch (error) {
    console.error(`Error in PUT /api/teams/[teamId]:`, error);
    return NextResponse.json({ message: 'Error updating team', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const { teamId } = params;
    let teams = await readTeams();
    const initialLength = teams.length;
    teams = teams.filter(t => t.id !== teamId);

    if (teams.length === initialLength) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    await writeTeams(teams);
    return NextResponse.json({ message: 'Team deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error in DELETE /api/teams/[teamId]:`, error);
    return NextResponse.json({ message: 'Error deleting team', error: (error as Error).message }, { status: 500 });
  }
}
