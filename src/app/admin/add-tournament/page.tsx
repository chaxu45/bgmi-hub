
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { TournamentSchema } from '@/types';
import { CalendarPlus, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Schema for creating a tournament, accommodating field array for imageUrls
const CreateTournamentFormSchema = TournamentSchema.omit({ id: true, imageUrls: true }).extend({
    imageUrls: z.array(z.object({ value: z.string().url("Invalid URL format.").min(1, "URL cannot be empty if field is added.") })).optional().default([]),
});
type CreateTournamentFormValues = z.infer<typeof CreateTournamentFormSchema>;

export default function AddTournamentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateTournamentFormValues>({
    resolver: zodResolver(CreateTournamentFormSchema),
    defaultValues: {
      name: '',
      organizer: '',
      prizePool: '',
      dates: '',
      format: '',
      pointSystem: '',
      imageUrls: [],
      status: 'Upcoming',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'imageUrls',
  });

  async function onSubmit(data: CreateTournamentFormValues) {
    try {
      // Transform imageUrls from array of objects to array of strings
      const transformedData = {
        ...data,
        imageUrls: data.imageUrls?.map(img => img.value) || [],
      };

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create tournament');
      }

      toast({
        title: 'Success!',
        description: 'Tournament added successfully.',
      });
      form.reset();
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add New Tournament"
        description="Fill in the details below to add a new tournament."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
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
            name="organizer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organizer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter organizer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prizePool"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prize Pool</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ₹1,00,00,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dates</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., January 1 - January 31, 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tournament status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
           <div>
            <FormLabel>Image URLs (Optional)</FormLabel>
            <FormDescription className="mb-2">
              Add one or more URLs for the tournament's images or banners.
            </FormDescription>
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2 mb-2">
                <FormField
                  control={form.control}
                  name={`imageUrls.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                       {index === 0 && <FormLabel className="sr-only">Image URL</FormLabel>}
                      <FormControl>
                        <Input placeholder="https://example.com/tournament-banner.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Remove image URL"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: '' })}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
            </Button>
            <FormMessage>{form.formState.errors.imageUrls?.message}</FormMessage>
          </div>
          <Separator />


          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the tournament format (e.g., Squads, TPP, Online Qualifiers, LAN Finals)"
                    {...field}
                     value={field.value ?? ''}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pointSystem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Point System (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the point system"
                    {...field}
                    value={field.value ?? ''}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {form.formState.isSubmitting ? 'Adding Tournament...' : (
              <>
                <CalendarPlus className="mr-2 h-5 w-5" /> Add Tournament
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
