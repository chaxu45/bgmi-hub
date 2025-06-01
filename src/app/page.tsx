import { Button } from '@/components/ui/button';
import { NewsList } from '@/components/news/news-list';
import { TournamentList } from '@/components/tournaments/tournament-list';
import { PageHeader } from '@/components/shared/page-header';
import { mockNewsArticles, mockTournaments } from '@/data/mock-data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const featuredNews = mockNewsArticles.slice(0, 3);
  const featuredTournaments = mockTournaments.filter(t => t.status === 'Ongoing' || t.status === 'Upcoming').slice(0, 3);

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
              Team Rosters <Users className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/leaderboards">
              View Leaderboards <ListOrdered className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Dummy icons, replace with lucide-react if available or keep if not
const Users = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ListOrdered = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="10" x2="21" y1="6" y2="6"></line><line x1="10" x2="21" y1="12" y2="12"></line><line x1="10" x2="21" y1="18" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>;

