import type { NewsArticle } from '@/types';
import { NewsCard } from './news-card';

interface NewsListProps {
  articles: NewsArticle[];
}

export function NewsList({ articles }: NewsListProps) {
  if (!articles || articles.length === 0) {
    return <p className="text-muted-foreground">No news articles available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
