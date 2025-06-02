
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
    const parsedData = JSON.parse(jsonData) as any[];
    // Map to the simplified PredictionQuestion structure, ensuring all required fields are present
    return parsedData.map(q => ({
        id: q.id || crypto.randomUUID(),
        questionText: q.questionText || '',
        googleFormLink: q.googleFormLink || undefined, 
        createdAt: q.createdAt || new Date(0).toISOString(), // Provide a fallback createdAt
    })).filter(q => q.questionText) as PredictionQuestion[]; // Filter out any potentially invalid entries
  } catch (error) {
    console.error('Error reading prediction questions file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, it will be created by the write function or above check.
      return [];
    }
    // For other errors, return an empty array to prevent cascading issues,
    // as the calling functions might expect an array.
    return [];
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

export async function GET(request: NextRequest) {
  try {
    const questions = await readPredictionQuestions();
    // Sort by createdAt descending to get the latest
    const sortedQuestions = questions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sortedQuestions.length > 0) {
      return NextResponse.json(sortedQuestions[0]); // Return the latest question
    }
    // If no questions, return null
    return NextResponse.json(null, { status: 200 }); 
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
      googleFormLink: googleFormLink || undefined, // Ensure optional link is handled
      createdAt: new Date().toISOString(),
    };

    const questions = await readPredictionQuestions();
    questions.push(newQuestion);
    await writePredictionQuestions(questions);

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/predictions/questions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error creating prediction question', error: errorMessage }, { status: 500 });
  }
}
