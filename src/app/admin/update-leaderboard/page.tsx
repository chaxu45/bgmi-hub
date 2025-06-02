
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
import { TournamentLeaderboardSchema, type TournamentLeaderboard, type AiExtractedLeaderboardData } from '@/types';
import { PlusCircle, Trash2, Save, Loader2, ImageUp, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { extractLeaderboardFromImage, type ExtractLeaderboardInput } from '@/ai/flows/extract-leaderboard-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// Form schema matches the TournamentLeaderboardSchema
type UpdateLeaderboardFormValues = z.infer<typeof TournamentLeaderboardSchema>;

export default function UpdateLeaderboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const form = useForm<UpdateLeaderboardFormValues>({
    resolver: zodResolver(TournamentLeaderboardSchema),
    defaultValues: {
      tournamentId: '',
      tournamentName: '',
      entries: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
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
            toast({
              title: 'Info',
              description: 'No existing leaderboard data found. You can start by creating one.',
            });
            form.reset({
              tournamentId: `default-tournament-${Date.now()}`, // Placeholder ID
              tournamentName: 'New Tournament Leaderboard',
              entries: [{ rank: 1, teamName: '', points: 0, matchesPlayed: 0, teamLogoUrl: '' }],
            });
          } else {
            throw new Error('Failed to fetch leaderboard data');
          }
        } else {
          const data = await response.json();
          form.reset(data); 
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: `Could not load leaderboard data: ${(error as Error).message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchLeaderboard();
  }, [form, toast]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const handleExtractFromImage = async () => {
    if (!selectedImageFile) {
      toast({ title: 'No Image Selected', description: 'Please select an image file first.', variant: 'destructive' });
      return;
    }
    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImageFile);
      reader.onload = async (e) => {
        const imageDataUri = e.target?.result as string;
        if (!imageDataUri) {
          throw new Error('Could not read image file.');
        }
        
        const input: ExtractLeaderboardInput = { imageDataUri };
        const extractedData: AiExtractedLeaderboardData = await extractLeaderboardFromImage(input);

        const currentFormValues = form.getValues();
        // Map AI extracted entries to form values, ensuring all fields are present
        const newEntries = extractedData.entries.map(entry => ({
            rank: entry.rank,
            teamName: entry.teamName,
            points: entry.points,
            matchesPlayed: entry.matchesPlayed ?? undefined,
            teamLogoUrl: entry.teamLogoUrl ?? '', // Default to empty string if not provided by AI
        }));

        form.reset({
          ...currentFormValues, // Preserve existing tournamentId
          tournamentName: extractedData.tournamentName || currentFormValues.tournamentName,
          entries: newEntries,
        });

        toast({ title: 'Success', description: 'Leaderboard data extracted from image and form populated.' });
      };
      reader.onerror = () => {
        throw new Error('Error reading image file for AI extraction.');
      }
    } catch (error) {
      toast({
        title: 'AI Extraction Failed',
        description: `Could not extract data: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };


  async function onSubmit(data: UpdateLeaderboardFormValues) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to update leaderboard');
      }
      toast({ title: 'Success!', description: 'Leaderboard updated successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update: ${(error as Error).message}`,
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
        description="Modify details and entries, or upload an image to extract data automatically."
      />

      <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground space-y-4">
        <h3 className="text-xl font-semibold flex items-center">
          <ImageUp className="mr-2 h-6 w-6 text-accent" />
          Extract from Image
        </h3>
        <Input type="file" accept="image/*" onChange={handleImageFileChange} className="max-w-md"/>
        {imagePreview && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-1">Selected Image Preview:</p>
            <img src={imagePreview} alt="Leaderboard preview" className="max-w-xs md:max-w-sm rounded-md border" />
          </div>
        )}
        {selectedImageFile && (
          <Button onClick={handleExtractFromImage} disabled={isExtracting} className="mt-2 bg-accent hover:bg-accent/90">
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Extracting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Extract Data & Populate Form
              </>
            )}
          </Button>
        )}
        <Alert>
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            Upload an image of a leaderboard. The AI will attempt to extract the tournament name and team entries (rank, name, points, matches). You can then review and edit the populated form before saving. Team logos usually need to be added manually.
          </AlertDescription>
        </Alert>
      </div>


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
          
          <FormField
            control={form.control}
            name="tournamentId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Tournament ID (System)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">Leaderboard Entries</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-3 p-4 border rounded-md mb-4 relative shadow-sm">
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
                         <FormDescription>Enter full URL. AI usually won&apos;t fill this.</FormDescription>
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
              onClick={() => append({ rank: fields.length + 1, teamName: '', points: 0, matchesPlayed: undefined, teamLogoUrl: '' })}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Leaderboard Entry Manually
            </Button>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting || isExtracting} className="bg-primary hover:bg-primary/90">
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

