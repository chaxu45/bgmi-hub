
import { TeamList } from '@/components/teams/team-list';
import { PageHeader } from '@/components/shared/page-header';
import type { Team } from '@/types';

async function getAllTeams(): Promise<Team[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/teams`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch teams:", res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getAllTeams();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Top BGMI Teams"
        description="Discover the top Indian BGMI teams and their current player rosters."
      />
      <TeamList teams={teams} />
    </div>
  );
}
