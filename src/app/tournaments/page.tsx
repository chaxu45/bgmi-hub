
import { TournamentList } from '@/components/tournaments/tournament-list';
import { PageHeader } from '@/components/shared/page-header';
import type { Tournament } from '@/types';

async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/tournaments`, { cache: 'no-store' });
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

const statusOrder: Record<Tournament['status'], number> = {
  Ongoing: 1,
  Upcoming: 2,
  Completed: 3,
};

export default async function TournamentsPage() {
  let tournaments = await getAllTournaments();

  tournaments.sort((a, b) => {
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="BGMI Tournaments"
        description="Stay updated with ongoing, upcoming, and completed BGMI tournaments in India."
      />
      <TournamentList tournaments={tournaments} />
    </div>
  );
}
