
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Save, Loader2, ImageUp, PlusCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Schema for the form, accommodating field array for leaderboardImageUrls
// Each item in the array is an object { value: string } for react-hook-form
const UpdateLeaderboardFormSchema = TournamentLeaderboardSchema.omit({ leaderboardImageUrls: true }).extend({
  leaderboardImageUrls: z.array(z.object({ value: z.string().url("Invalid data URI or URL.").min(1, "Image data cannot be empty if field is added.") })).optional().default([]),
});
type UpdateLeaderboardFormValues = z.infer<typeof UpdateLeaderboardFormSchema>;

export default function UpdateLeaderboardPage() {
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  const form = useForm<UpdateLeaderboardFormValues>({
    resolver: zodResolver(UpdateLeaderboardFormSchema),
    defaultValues: {
      tournamentId: '',
      tournamentName: '',
      leaderboardImageUrls: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'leaderboardImageUrls',
  });

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/leaderboards');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data: TournamentLeaderboard = await response.json();
        const formSafeUrls = data.leaderboardImageUrls ? data.leaderboardImageUrls.map(url => ({ value: url })) : [];
        form.reset({
            tournamentId: data.tournamentId,
            tournamentName: data.tournamentName,
            leaderboardImageUrls: formSafeUrls,
        });
        setImagePreviews(data.leaderboardImageUrls || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Could not load leaderboard data: ${(error as Error).message}`,
          variant: 'destructive',
        });
        form.reset({
          tournamentId: `error-fallback-${Date.now()}`,
          tournamentName: 'Error Loading Leaderboard',
          leaderboardImageUrls: [],
        });
        setImagePreviews([]);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchLeaderboard();
  }, [form, toast]);

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue(`leaderboardImageUrls.${index}.value`, dataUri, { shouldValidate: true });
        const newPreviews = [...imagePreviews];
        newPreviews[index] = dataUri;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    } else {
      // Optionally clear if file selection is cancelled
      // form.setValue(`leaderboardImageUrls.${index}.value`, '', { shouldValidate: true });
      // const newPreviews = [...imagePreviews];
      // newPreviews[index] = ''; // Or null
      // setImagePreviews(newPreviews);
    }
  };

  function removeImage(index: number) {
    remove(index);
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  }
  
  function addImageField() {
    append({ value: '' }); // Add an empty value, user will fill via file input
    setImagePreviews([...imagePreviews, '']); // Add placeholder for preview
  }


  async function onSubmit(data: UpdateLeaderboardFormValues) {
    setIsSaving(true);
    try {
      const transformedData = {
        ...data,
        leaderboardImageUrls: data.leaderboardImageUrls?.map(img => img.value).filter(url => url) || [], // Filter out empty strings
      };

      const response = await fetch('/api/leaderboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Failed to update leaderboard');
      }
      toast({ title: 'Success!', description: 'Leaderboard images updated successfully.' });
      // Refetch or update previews based on saved data if necessary
      const savedData: TournamentLeaderboard = await response.json();
      setImagePreviews(savedData.leaderboardImageUrls || []);

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
        title="Set Tournament Leaderboard Images"
        description="Upload one or more images for the leaderboard. The first image will be displayed."
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
            <FormLabel className="flex items-center mb-2">
                <ImageUp className="mr-2 h-5 w-5 text-accent" />
                Leaderboard Images
            </FormLabel>
            <FormDescription className="mb-2">
                Upload one or more images. The first valid image will be shown on the public leaderboard page.
            </FormDescription>
            {fields.map((item, index) => (
              <div key={item.id} className="space-y-3 p-4 border rounded-md mb-4 relative">
                <FormField
                  control={form.control}
                  name={`leaderboardImageUrls.${index}.value`}
                  render={({ field }) => ( // field.value here is the data URI string
                    <FormItem>
                      <FormLabel>Leaderboard Image {index + 1}</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageFileChange(e, index)} 
                          className="max-w-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {imagePreviews[index] && (
                    <div className="relative w-full max-w-md aspect-[3/4] border rounded-md overflow-hidden bg-muted/20">
                        <Image src={imagePreviews[index]!} alt={`Leaderboard preview ${index + 1}`} layout="fill" objectFit="contain" />
                    </div>
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove Image
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImageField}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Leaderboard Image
            </Button>
            <FormMessage>{form.formState.errors.leaderboardImageUrls?.message || form.formState.errors.leaderboardImageUrls?.root?.message}</FormMessage>
          </div>
          <Separator />

          {fields.length === 0 && (
             <Alert variant="default">
                <AlertTitle>No Images Set</AlertTitle>
                <AlertDescription>
                  There are currently no images set for the leaderboard. Upload one or more above.
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
                <Save className="mr-2 h-5 w-5" /> Save Leaderboard Images
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
