
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
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { NewsArticleSchema } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Schema for the form, accommodating field array for imageUrls
const CreateNewsArticleFormSchema = NewsArticleSchema.omit({ id: true, imageUrls: true }).extend({
  imageUrls: z.array(z.object({ value: z.string().url("Invalid URL format.").min(1, "URL cannot be empty if field is added.") })).optional().default([]),
});
type CreateNewsArticleFormValues = z.infer<typeof CreateNewsArticleFormSchema>;

export default function AddNewsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateNewsArticleFormValues>({
    resolver: zodResolver(CreateNewsArticleFormSchema),
    defaultValues: {
      title: '',
      summary: '',
      imageUrls: [],
      source: '',
      publishedDate: new Date().toISOString().split('T')[0], // Default to today
      link: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'imageUrls',
  });

  async function onSubmit(data: CreateNewsArticleFormValues) {
    try {
      // Transform imageUrls from array of objects to array of strings
      const transformedData = {
        ...data,
        imageUrls: data.imageUrls?.map(img => img.value) || [],
      };

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create news article');
      }

      toast({
        title: 'Success!',
        description: 'News article added successfully.',
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
        title="Add New News Article"
        description="Fill in the details below to publish a new news article."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter article title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief summary of the article"
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <div>
            <FormLabel>Image URLs (Optional)</FormLabel>
            <FormDescription className="mb-2">
              Add one or more URLs for the article's images.
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
                        <Input placeholder="https://example.com/image.png" {...field} />
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
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., BGMI Official, Esports Insider" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Published Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Select the date the article was published.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/full-article" {...field} />
                </FormControl>
                <FormDescription>
                  Full URL to the original news article.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {form.formState.isSubmitting ? 'Adding Article...' : (
              <>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Article
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
