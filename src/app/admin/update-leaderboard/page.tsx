
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { TournamentLeaderboardSchema, type TournamentLeaderboard, LeaderboardEntrySchema } from '@/types';
import { PlusCircle, Trash2, Save, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Form schema matches the TournamentLeaderboardSchema
type UpdateLeaderboardFormValues = z.infer<typeof TournamentLeaderboardSchema>;

export default function UpdateLeaderboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const form = useForm<UpdateLeaderboardFormValues>({
    resolver: zodResolver(TournamentLeaderboardSchema),
    defaultValues: {
      tournamentId: '',
      tournamentName: '',
      entries: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entries',
  });

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/leaderboards');
        if (!response.ok) {
          if (response.status === 404) {
            // Handle case where leaderboard.json might be empty or non-existent initially
            toast({
              title: 'Info',
              description: 'No existing leaderboard data found. You can start by creating one.',
              variant: 'default',
            });
            // Initialize with a default structure if not found, or let user create from scratch
            form.reset({
              tournamentId: 'default-tournament-id', // Or generate one
              tournamentName: 'New Tournament Leaderboard',
              entries: [{ rank: 1, teamName: '', points: 0, matchesPlayed: 0, teamLogoUrl: '' }],
            });
          } else {
            throw new Error('Failed to fetch leaderboard data');
          }
        } else {
          const data = await response.json();
          form.reset(data); // Populate form with fetched data
        }
      } catch (error) {
        let errorMessage = 'Could not load leaderboard data.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchLeaderboard();
  }, [form, toast]);

  async function onSubmit(data: UpdateLeaderboardFormValues) {
    // Ensure rank is a number
    const processedData = {
      ...data,
      entries: data.entries.map(entry => ({
        ...entry,
        rank: Number(entry.rank),
        points: Number(entry.points),
        matchesPlayed: entry.matchesPlayed ? Number(entry.matchesPlayed) : undefined,
        teamLogoUrl: entry.teamLogoUrl || undefined,
      })),
    };

    try {
      const response = await fetch('/api/leaderboards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update leaderboard');
      }

      toast({
        title: 'Success!',
        description: 'Leaderboard updated successfully.',
      });
    } catch (error) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading leaderboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Update Tournament Leaderboard"
        description="Modify the current tournament leaderboard details and entries."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tournamentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tournament Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tournament name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tournament ID might be hidden or read-only as it's tied to the single leaderboard file */}
          <FormField
            control={form.control}
            name="tournamentId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Tournament ID (System)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">Leaderboard Entries</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-3 p-4 border rounded-md mb-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`entries.${index}.rank`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Rank" {...field} 
                           onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`entries.${index}.teamName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`entries.${index}.points`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Points" {...field} 
                           onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name={`entries.${index}.matchesPlayed`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matches Played (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Matches" {...field} 
                           onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))}
                           value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name={`entries.${index}.teamLogoUrl`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Entry
                </Button>
              </div>
            ))}
            <FormMessage>{form.formState.errors.entries?.root?.message || form.formState.errors.entries?.message}</FormMessage>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ rank: fields.length + 1, teamName: '', points: 0, matchesPlayed: undefined, teamLogoUrl: undefined })}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Leaderboard Entry
            </Button>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Leaderboard...
              </>
              ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> Save Leaderboard
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
