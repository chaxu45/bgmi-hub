
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockNewsArticles } from '@/data/mock-data';
import type { NewsArticle } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  let articles = mockNewsArticles;

  if (limit) {
    articles = articles.slice(0, limit);
  }

  return NextResponse.json(articles);
}
