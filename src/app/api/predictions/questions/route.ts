
// This API route has been neutralized as part of reverting the "Predict and Win" feature.
// For a full cleanup, this file can be deleted.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Predict and Win feature has been removed." }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ message: "Predict and Win feature has been removed." }, { status: 404 });
}
