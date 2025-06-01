import Image from 'next/image';
import Link from 'next/link';
import type { NewsArticle } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {article.imageUrl && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={article.imageUrl}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="news article"
            />
          </div>
        )}
        <CardTitle className="font-headline text-xl">{article.title}</CardTitle>
        <CardDescription>
          Published on {new Date(article.publishedDate).toLocaleDateString()} by {article.source}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="text-accent p-0 h-auto">
          <Link href={article.link} target="_blank" rel="noopener noreferrer">
            Read More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
