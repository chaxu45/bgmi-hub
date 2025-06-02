
import { Button } from '@/components/ui/button';
import { NewsList } from '@/components/news/news-list';
import { TournamentList } from '@/components/tournaments/tournament-list';
import { PageHeader } from '@/components/shared/page-header';
import Link from 'next/link';
import { ArrowRight, Users as UsersIcon, ListOrdered as ListOrderedIcon } from 'lucide-react'; // Renamed to avoid conflict
import type { NewsArticle, Tournament } from '@/types';

async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/news?limit=3`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch news:", res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

async function getFeaturedTournaments(): Promise<Tournament[]> {
   try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/tournaments?status=Ongoing,Upcoming&limit=3`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch tournaments:", res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredNews = await getFeaturedNews();
  const featuredTournaments = await getFeaturedTournaments();

  return (
    <div className="space-y-12">
      <PageHeader
        title="Welcome to BGMI India Hub"
        description="Your central source for BGMI esports news, tournaments, rosters, and leaderboards in India."
      />

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold font-headline">Latest News</h3>
          {/* Potential "View All" link for news if a dedicated news page is added later */}
        </div>
        <NewsList articles={featuredNews} />
      </section>

      <section>
         <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold font-headline">Featured Tournaments</h3>
          <Button variant="link" asChild className="text-accent">
            <Link href="/tournaments">
              View All Tournaments <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <TournamentList tournaments={featuredTournaments} />
      </section>

      <section className="text-center py-8">
        <h3 className="text-2xl font-semibold font-headline mb-6">Explore More</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/teams">
              Team Rosters <UsersIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/leaderboards">
              View Leaderboards <ListOrderedIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
