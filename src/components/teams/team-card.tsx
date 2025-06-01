import Image from 'next/image';
import type { Team } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        {team.logoUrl ? (
          <Avatar className="h-16 w-16">
            <AvatarImage src={team.logoUrl} alt={team.name} data-ai-hint="esports logo" />
            <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-16 w-16 bg-muted">
             <Users className="h-8 w-8 text-muted-foreground" />
          </Avatar>
        )}
        <div>
          <CardTitle className="font-headline text-xl">{team.name}</CardTitle>
          {team.description && <CardDescription>{team.description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2 text-foreground">Active Roster:</h4>
        {team.roster.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {team.roster.map((player) => (
              <li key={player.id} className="flex items-center">
                <span>{player.ign} ({player.name}) {player.role && `- ${player.role}`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Roster information not available.</p>
        )}
      </CardContent>
    </Card>
  );
}
