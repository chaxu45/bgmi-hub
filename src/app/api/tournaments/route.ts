
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockTournaments } from '@/data/mock-data';
import type { Tournament } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  let tournamentsResult = mockTournaments;

  if (statusParam) {
    const statuses = statusParam.split(',') as Array<Tournament['status']>;
    tournamentsResult = tournamentsResult.filter(t => statuses.includes(t.status));
  }

  if (limit) {
    tournamentsResult = tournamentsResult.slice(0, limit);
  }

  return NextResponse.json(tournamentsResult);
}
