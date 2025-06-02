
import { LeaderboardTable } from '@/components/leaderboards/leaderboard-table';
import { PageHeader } from '@/components/shared/page-header';
import type { TournamentLeaderboard } from '@/types';

async function getLeaderboardData(): Promise<TournamentLeaderboard | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/leaderboards`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch leaderboard:", res.statusText);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return null;
  }
}

export default async function LeaderboardsPage() {
  const currentLeaderboard = await getLeaderboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tournament Leaderboards"
        description="Check out the latest rankings and scores from BGMI tournaments."
      />
      
      {currentLeaderboard ? (
        <section>
          <h3 className="text-xl font-semibold mb-4 font-headline">{currentLeaderboard.tournamentName}</h3>
          <LeaderboardTable leaderboard={currentLeaderboard} />
        </section>
      ) : (
        <p className="text-muted-foreground">Leaderboard data is currently unavailable.</p>
      )}
    </div>
  );
}
