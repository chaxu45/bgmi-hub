
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NewsArticleSchema, type NewsArticle } from '@/types';
import { z } from 'zod';
import crypto from 'crypto';

const newsFilePath = path.join(process.cwd(), 'src', 'data', 'json-db', 'news.json');

async function readNews(): Promise<NewsArticle[]> {
  try {
    const jsonData = await fs.promises.readFile(newsFilePath, 'utf-8');
    return JSON.parse(jsonData) as NewsArticle[];
  } catch (error) {
    console.error('Error reading news file:', error);
    // If the file doesn't exist or is empty, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw new Error('Could not read news data.');
  }
}

async function writeNews(data: NewsArticle[]): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(newsFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing news file:', error);
    throw new Error('Could not write news data.');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let articles = await readNews();

    // Sort articles by publishedDate in descending order (newest first)
    articles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    if (limit) {
      articles = articles.slice(0, limit);
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error in GET /api/news:", error);
    return NextResponse.json({ message: 'Error fetching news articles', error: (error as Error).message }, { status: 500 });
  }
}

// Zod schema for POST request body (excluding id, which will be generated)
const CreateNewsArticleSchema = NewsArticleSchema.omit({ id: true });

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const validationResult = CreateNewsArticleSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid article data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const newArticleData = validationResult.data;
    const articles = await readNews();
    
    const newArticle: NewsArticle = {
      ...newArticleData,
      id: crypto.randomUUID(), // Generate a unique ID
    };

    articles.push(newArticle);
    await writeNews(articles);

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/news:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: 'Error creating news article', error: errorMessage }, { status: 500 });
  }
}

