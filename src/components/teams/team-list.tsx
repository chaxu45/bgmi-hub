import type { Team } from '@/types';
import { TeamCard } from './team-card';

interface TeamListProps {
  teams: Team[];
}

export function TeamList({ teams }: TeamListProps) {
  if (!teams || teams.length === 0) {
    return <p className="text-muted-foreground">No teams found.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
