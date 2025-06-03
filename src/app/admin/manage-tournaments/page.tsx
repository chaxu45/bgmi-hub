
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2, PlusCircle, CalendarDays, Medal, Users } from 'lucide-react';
import type { Tournament } from '@/types';

export default function ManageTournamentsPage() {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const { toast } = useToast();

  const fetchTournaments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tournaments');
      if (!response.ok) throw new Error('Failed to fetch tournaments');
      let data: Tournament[] = await response.json();
      // Sort tournaments: Ongoing, Upcoming, Completed
      const statusOrder: Record<Tournament['status'], number> = { Ongoing: 1, Upcoming: 2, Completed: 3 };
      data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      setTournaments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Could not load tournaments.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleDeleteTournament = async (tournamentId: string) => {
    setIsDeleting(tournamentId);
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tournament');
      }
      toast({ title: 'Success', description: 'Tournament deleted successfully.' });
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <PageHeader title="Manage Tournaments" description="Edit or delete existing BGMI tournaments." />
         <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/admin/add-tournament">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Tournament
            </Link>
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">No tournaments found. Add one using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const displayImageUrl = tournament.imageUrls && tournament.imageUrls.length > 0 ? tournament.imageUrls[0] : null;
            return (
            <Card key={tournament.id} className="flex flex-col">
              <CardHeader>
                {displayImageUrl && (
                  <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={displayImageUrl}
                      alt={tournament.name}
                      layout="fill"
                      objectFit="cover"
                       data-ai-hint="gaming tournament"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg line-clamp-2">{tournament.name}</CardTitle>
                    <Badge variant={tournament.status === 'Ongoing' ? 'default' : tournament.status === 'Upcoming' ? 'secondary' : 'outline'}
                        className={tournament.status === 'Ongoing' ? 'bg-accent text-accent-foreground' : ''}>
                        {tournament.status}
                    </Badge>
                </div>
                <CardDescription className="text-xs flex items-center gap-1"><Users className="h-3 w-3"/> {tournament.organizer}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1 text-sm">
                <p className="flex items-center gap-1"><Medal className="h-4 w-4 text-accent" /> {tournament.prizePool}</p>
                <p className="flex items-center gap-1"><CalendarDays className="h-4 w-4 text-accent" /> {tournament.dates}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/edit-tournament/${tournament.id}`}>
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting === tournament.id}>
                      {isDeleting === tournament.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the tournament &quot;{tournament.name}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}

