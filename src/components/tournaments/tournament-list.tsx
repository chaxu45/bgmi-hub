import type { Tournament } from '@/types';
import { TournamentCard } from './tournament-card';

interface TournamentListProps {
  tournaments: Tournament[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  if (!tournaments || tournaments.length === 0) {
    return <p className="text-muted-foreground">No tournaments found.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  );
}
