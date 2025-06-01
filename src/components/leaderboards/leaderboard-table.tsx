import Image from 'next/image';
import type { TournamentLeaderboard } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';

interface LeaderboardTableProps {
  leaderboard: TournamentLeaderboard;
}

export function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Matches</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.entries.map((entry) => (
            <TableRow key={entry.rank} className="hover:bg-card/80">
              <TableCell className="font-medium text-center">{entry.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {entry.teamLogoUrl ? (
                       <AvatarImage src={entry.teamLogoUrl} alt={entry.teamName} data-ai-hint="esports logo" />
                    ) : null }
                    <AvatarFallback>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{entry.teamName}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{entry.matchesPlayed ?? '-'}</TableCell>
              <TableCell className="text-right font-semibold">{entry.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
