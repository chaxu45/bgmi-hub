
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import { TournamentLeaderboardSchema, type TournamentLeaderboard } from '@/types';
import { Save, Loader2, ImageUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form schema matches the new TournamentLeaderboardSchema
type UpdateLeaderboardFormValues = z.infer<typeof TournamentLeaderboardSchema>;

export default function SetLeaderboardImagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const form = useForm<UpdateLeaderboardFormValues>({
    resolver: zodResolver(TournamentLeaderboardSchema),
    defaultValues: {
      tournamentId: '',
      tournamentName: '',
      leaderboardImageUrl: undefined,
    },
  });

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/leaderboards');
        if (!response.ok) {
          // If 404, API now returns a default structure, so this might not be hit often
          // but good to handle general errors.
          throw new Error('Failed to fetch leaderboard data');
        }
        const data: TournamentLeaderboard = await response.json();
        form.reset(data);
        if (data.leaderboardImageUrl) {
          setImagePreview(data.leaderboardImageUrl);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: `Could not load leaderboard data: ${(error as Error).message}`,
          variant: 'destructive',
        });
        // Set some defaults if loading fails completely
        form.reset({
          tournamentId: `error-fallback-${Date.now()}`,
          tournamentName: 'Error Loading Leaderboard',
          leaderboardImageUrl: undefined,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('leaderboardImageUrl', dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      form.setValue('leaderboardImageUrl', undefined, { shouldValidate: true });
    }
  };

  async function onSubmit(data: UpdateLeaderboardFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/leaderboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to update leaderboard');
      }
      toast({ title: 'Success!', description: 'Leaderboard image updated successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
        title="Set Tournament Leaderboard Image"
        description="Upload an image for the leaderboard. This image will be displayed directly."
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
          
          <FormField
            control={form.control}
            name="tournamentId"
            render={({ field }) => (
              // This field is usually system-managed for a single leaderboard setup
              <FormItem className="hidden">
                <FormLabel>Tournament ID (System)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaderboardImageUrl"
            render={({ field }) => ( // field is not directly used for input type file, but hook form needs it
              <FormItem>
                <FormLabel className="flex items-center">
                  <ImageUp className="mr-2 h-5 w-5 text-accent" />
                  Upload Leaderboard Image
                </FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange} 
                    className="max-w-md"
                  />
                </FormControl>
                <FormDescription>
                  Select an image file (PNG, JPG, GIF). This will replace any existing image.
                  Leave empty or clear selection if you want no image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {imagePreview && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Leaderboard Image Preview:</p>
              <div className="relative w-full max-w-lg aspect-[2/3] border rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Leaderboard preview" layout="fill" objectFit="contain" />
              </div>
               <Button variant="outline" size="sm" onClick={() => {
                  setImagePreview(null);
                  form.setValue('leaderboardImageUrl', undefined, { shouldValidate: true });
                  // Also clear the file input visually, though this is tricky across browsers
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}>
                  Clear Image
                </Button>
            </div>
          )}
           {!imagePreview && !form.getValues("leaderboardImageUrl") && (
             <Alert variant="default">
                <AlertTitle>No Image Set</AlertTitle>
                <AlertDescription>
                  There is currently no image set for the leaderboard. Upload one above.
                </AlertDescription>
              </Alert>
           )}


          <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Leaderboard...
              </>
              ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> Save Leaderboard Image
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
