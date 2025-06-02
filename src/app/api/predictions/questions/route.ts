
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
    return JSON.parse(jsonData) as PredictionQuestion[];
  } catch (error) {
    console.error('Error reading prediction questions file:', error);
    // If file doesn't exist or is corrupted, return empty array or re-throw
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // Or create the file with an empty array
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

// GET /api/predictions/questions - Returns the latest 'active' question
export async function GET(request: NextRequest) {
  try {
    const questions = await readPredictionQuestions();
    const activeQuestions = questions
      .filter(q => q.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (activeQuestions.length > 0) {
      return NextResponse.json(activeQuestions[0]); // Return the latest active one
    }
    return NextResponse.json(null, { status: 200 }); // No active question found
  } catch (error) {
    console.error("Error in GET /api/predictions/questions:", error);
    return NextResponse.json({ message: 'Error fetching prediction questions', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody: CreatePredictionQuestionFormValues = await request.json();
    
    // Validate using the form schema
    const validationResult = CreatePredictionQuestionFormSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid prediction question data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { questionText, options, correctAnswer, rewardDescription, status } = validationResult.data;

    // Transform options from array of objects to array of strings
    const transformedOptions = options ? options.map(opt => opt.value) : [];

    const newQuestion: PredictionQuestion = {
      id: crypto.randomUUID(),
      questionText,
      options: transformedOptions,
      correctAnswer,
      rewardDescription,
      status,
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
