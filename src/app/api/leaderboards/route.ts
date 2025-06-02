
import { NextResponse } from 'next/server';
import { mockLeaderboard } from '@/data/mock-data';

export async function GET() {
  return NextResponse.json(mockLeaderboard);
}
