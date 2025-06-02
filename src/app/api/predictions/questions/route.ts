
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PredictionQuestionSchema, CreatePredictionQuestionFormSchema, type PredictionQuestion, type CreatePredictionQuestionFormValues } from '@/types';
import crypto from 'crypto';

const questionsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'prediction-questions.json');
const dataDir = path.dirname(questionsFilePath);

async function readPredictionQuestions(): Promise<PredictionQuestion[]> {
  try {
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    if (!fs.existsSync(questionsFilePath)) {
      await fs.promises.writeFile(questionsFilePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const jsonData = await fs.promises.readFile(questionsFilePath, 'utf-8');
    // Ensure googleFormLink is present, default to undefined if missing during parse
    // and ensure other fields are handled if they are missing in old data
    return (JSON.parse(jsonData) as any[]).map(q => ({
        id: q.id || crypto.randomUUID(), // Ensure id exists
        questionText: q.questionText || '',
        googleFormLink: q.googleFormLink || undefined,
        createdAt: q.createdAt || new Date(0).toISOString(), // Ensure createdAt exists
    })) as PredictionQuestion[];
  } catch (error) {
    console.error('Error reading prediction questions file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw new Error('Could not read prediction questions data.');
  }
}

async function writePredictionQuestions(data: PredictionQuestion[]): Promise<void> {
  try {
    if (!fs.existsSync(dataDir)) {
      await fs.promises.mkdir(dataDir, { recursive: true });
    }
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(questionsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing prediction questions file:', error);
    throw new Error('Could not write prediction questions data.');
  }
}

// GET /api/predictions/questions - Returns the latest question based on createdAt
export async function GET(request: NextRequest) {
  try {
    const questions = await readPredictionQuestions();
    // Sort by creation date in descending order to get the latest one first
    const sortedQuestions = questions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sortedQuestions.length > 0) {
      return NextResponse.json(sortedQuestions[0]); // Return the latest one
    }
    return NextResponse.json(null, { status: 200 }); // No question found
  } catch (error) {
    console.error("Error in GET /api/predictions/questions:", error);
    return NextResponse.json({ message: 'Error fetching prediction questions', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody: CreatePredictionQuestionFormValues = await request.json();
    
    const validationResult = CreatePredictionQuestionFormSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid prediction question data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { questionText, googleFormLink } = validationResult.data;

    const newQuestion: PredictionQuestion = {
      id: crypto.randomUUID(),
      questionText,
      googleFormLink: googleFormLink || undefined, // Ensure it's undefined if empty
      createdAt: new Date().toISOString(),
    };

    const questions = await readPredictionQuestions();
    questions.push(newQuestion);
    await writePredictionQuestions(questions);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) { // This is line 93 referenced in the error. The '{' is crucial.
    console.error("Error in POST /api/predictions/questions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error creating prediction question', error: errorMessage }, { status: 500 });
  }
}
