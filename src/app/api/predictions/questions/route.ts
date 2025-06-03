
// This API route has been replaced by /api/predictions/route.ts
// and is no longer used for the simplified "Predict and Win" feature.
// For a full cleanup, this file can be deleted.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "This prediction API is deprecated. Use /api/predictions instead." }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ message: "This prediction API is deprecated. Use /api/predictions instead." }, { status: 404 });
}
