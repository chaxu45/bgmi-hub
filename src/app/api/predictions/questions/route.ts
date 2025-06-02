
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PredictionQuestionSchema, CreatePredictionQuestionFormSchema, type PredictionQuestion, type CreatePredictionQuestionFormValues } from '@/types';
import crypto from 'crypto';

const questionsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'prediction-questions.json');
const dataDir = path.dirname(questionsFilePath);

async function ensureDataFileExists(): Promise<void> {
  try {
    if (!fs.existsSync(dataDir)) {
      console.log(`Data directory ${dataDir} not found, creating...`);
      await fs.promises.mkdir(dataDir, { recursive: true });
      console.log(`Data directory ${dataDir} created successfully.`);
    }
    if (!fs.existsSync(questionsFilePath)) {
      console.log(`Prediction questions file ${questionsFilePath} not found, creating with empty array...`);
      await fs.promises.writeFile(questionsFilePath, JSON.stringify([], null, 2), 'utf-8');
      console.log(`Prediction questions file ${questionsFilePath} created successfully.`);
    }
  } catch (error) {
    console.error('CRITICAL SETUP ERROR: Error ensuring prediction questions file/directory exists:', error);
  }
}


async function readPredictionQuestions(): Promise<PredictionQuestion[]> {
  await ensureDataFileExists();
  try {
    const jsonData = await fs.promises.readFile(questionsFilePath, 'utf-8');
    const parsedData = JSON.parse(jsonData) as any[];
    
    return parsedData.map(q => ({
        id: q.id || crypto.randomUUID(),
        questionText: q.questionText || '',
        googleFormLink: q.googleFormLink || undefined, 
        createdAt: q.createdAt || new Date(0).toISOString(),
    })).filter(q => q.questionText) as PredictionQuestion[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.warn(`Prediction questions file not found at ${questionsFilePath}. Returning empty array.`);
        return [];
    }
    console.error('Error reading prediction questions file:', error);
    return [];
  }
}

async function writePredictionQuestions(data: PredictionQuestion[]): Promise<void> {
  await ensureDataFileExists();
  try {
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
    const sortedQuestions = questions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    if (sortedQuestions.length > 0) {
      return NextResponse.json(sortedQuestions[0]);
    }
    return NextResponse.json(null, { status: 200 }); 
  } catch (error) {
    console.error("Error in GET /api/predictions/questions:", error);
    return NextResponse.json({ message: 'Error fetching prediction questions', error: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
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
      googleFormLink: googleFormLink || undefined,
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
