
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

export default async function TournamentsPage() {
  const tournaments = await getAllTournaments();

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
