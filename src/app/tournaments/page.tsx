import { TournamentList } from '@/components/tournaments/tournament-list';
import { PageHeader } from '@/components/shared/page-header';
import { mockTournaments } from '@/data/mock-data';

export default function TournamentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="BGMI Tournaments"
        description="Stay updated with ongoing, upcoming, and completed BGMI tournaments in India."
      />
      <TournamentList tournaments={mockTournaments} />
    </div>
  );
}
