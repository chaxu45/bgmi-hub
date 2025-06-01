import Image from 'next/image';
import type { Tournament } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Medal, Users } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {tournament.imageUrl && (
          <div className="relative w-full h-48 mb-4">
            <Image
              src={tournament.imageUrl}
              alt={tournament.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint="gaming tournament"
            />
          </div>
        )}
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl">{tournament.name}</CardTitle>
          <Badge variant={tournament.status === 'Ongoing' ? 'default' : tournament.status === 'Upcoming' ? 'secondary' : 'outline'}
                 className={tournament.status === 'Ongoing' ? 'bg-accent text-accent-foreground' : ''}
          >
            {tournament.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Users className="h-4 w-4" /> {tournament.organizer}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Medal className="h-4 w-4 text-accent" />
          <span>Prize Pool: {tournament.prizePool}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-accent" />
          <span>Dates: {tournament.dates}</span>
        </div>
        {tournament.format && (
          <p className="text-sm text-muted-foreground">Format: {tournament.format}</p>
        )}
      </CardContent>
       {tournament.pointSystem && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">Point System: {tournament.pointSystem}</p>
        </CardFooter>
      )}
    </Card>
  );
}
