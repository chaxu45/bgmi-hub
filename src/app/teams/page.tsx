import { TeamList } from '@/components/teams/team-list';
import { PageHeader } from '@/components/shared/page-header';
import { mockTeams } from '@/data/mock-data';

export default function TeamsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Top BGMI Teams"
        description="Discover the top Indian BGMI teams and their current player rosters."
      />
      <TeamList teams={mockTeams} />
    </div>
  );
}
