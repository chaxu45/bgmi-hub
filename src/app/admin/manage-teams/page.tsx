
'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users as UsersIcon, Edit, Trash2, Loader2, PlusCircle } from 'lucide-react'; // Renamed Users to UsersIcon
import type { Team } from '@/types';

export default function ManageTeamsPage() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null); // Stores ID of team being deleted
  const { toast } = useToast();

  const fetchTeams = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Could not load teams.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleDeleteTeam = async (teamId: string) => {
    setIsDeleting(teamId);
    try {
      const response = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete team');
      }
      toast({ title: 'Success', description: 'Team deleted successfully.' });
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
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
        <p className="ml-2 text-muted-foreground">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <PageHeader title="Manage Teams" description="Edit or delete existing BGMI teams." />
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/admin/add-team">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Team
            </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <p className="text-muted-foreground">No teams found. You can add a new team using the button above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                {team.logoUrl ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={team.logoUrl} alt={team.name} data-ai-hint="esports logo" />
                    <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                   <Avatar className="h-12 w-12 bg-muted flex items-center justify-center">
                     <UsersIcon className="h-6 w-6 text-muted-foreground" />
                   </Avatar>
                )}
                <div>
                  <CardTitle className="font-headline text-lg">{team.name}</CardTitle>
                  {team.description && <CardDescription className="text-xs line-clamp-2">{team.description}</CardDescription>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {team.roster.length} player{team.roster.length !== 1 ? 's' : ''} in roster.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/edit-team/${team.id}`}>
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting === team.id}>
                      {isDeleting === team.id ? (
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
                        This action cannot be undone. This will permanently delete the team &quot;{team.name}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTeam(team.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
