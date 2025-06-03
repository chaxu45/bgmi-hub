
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { StoredPredictionQuestionSchema, type StoredPredictionQuestion } from '@/types';

const predictionFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'prediction.json');

async function readPrediction(): Promise<StoredPredictionQuestion | null> {
  try {
    if (!fs.existsSync(predictionFilePath)) {
      await writePrediction(null); // Create file with null if it doesn't exist
      return null;
    }
    const jsonData = await fs.promises.readFile(predictionFilePath, 'utf-8');
    if (jsonData.trim() === 'null' || jsonData.trim() === '') {
      return null;
    }
    return StoredPredictionQuestionSchema.parse(JSON.parse(jsonData));
  } catch (error) {
    console.error('Error reading prediction file:', error);
    // If parsing fails or other read errors, assume no valid prediction
    await writePrediction(null); // Reset to null in case of corrupted data
    return null;
  }
}

async function writePrediction(data: StoredPredictionQuestion | null): Promise<void> {
  try {
    const dir = path.dirname(predictionFilePath);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(predictionFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing prediction file:', error);
    throw new Error('Could not write prediction data.');
  }
}

export async function GET() {
  try {
    const prediction = await readPrediction();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error in GET /api/predictions:", error);
    return NextResponse.json({ message: 'Error fetching prediction', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const validationResult = StoredPredictionQuestionSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid prediction data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const newPredictionData = validationResult.data;
    await writePrediction(newPredictionData);

    return NextResponse.json(newPredictionData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/predictions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error setting prediction', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await writePrediction(null); // Set prediction to null
    return NextResponse.json({ message: 'Prediction deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/predictions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error deleting prediction', error: errorMessage }, { status: 500 });
  }
}
