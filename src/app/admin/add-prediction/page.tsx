
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { CreatePredictionQuestionFormSchema, type CreatePredictionQuestionFormValues } from '@/types';
import { HelpCircleIcon, Link as LinkIcon } from 'lucide-react';

export default function AddPredictionPage() {
  const { toast } = useToast();

  const form = useForm<CreatePredictionQuestionFormValues>({
    resolver: zodResolver(CreatePredictionQuestionFormSchema),
    defaultValues: {
      questionText: '',
      googleFormLink: '',
    },
  });

  async function onSubmit(data: CreatePredictionQuestionFormValues) {
    try {
      const response = await fetch('/api/predictions/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prediction question');
      }

      toast({
        title: 'Success!',
        description: 'Prediction question added successfully.',
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
        title="Add New Prediction Question"
        description="Create a new question prompt and link it to your Google Form for submissions."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the prediction question (e.g., Who will win the next BGIS?)"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="googleFormLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Form Link</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="https://docs.google.com/forms/..." 
                      {...field} 
                      value={field.value ?? ''}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Link to the Google Form where users will submit their answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {form.formState.isSubmitting ? 'Adding Question...' : (
              <>
                <HelpCircleIcon className="mr-2 h-5 w-5" /> Add Prediction Question
              </>
            )}
          </Button>
        </form>
      </Form> {/* Correctly closed Form component */}
    </div>
  );
}
