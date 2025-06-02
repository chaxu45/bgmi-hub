
import { NextResponse } from 'next/server';
import { mockTeams } from '@/data/mock-data';

export async function GET() {
  return NextResponse.json(mockTeams);
}
