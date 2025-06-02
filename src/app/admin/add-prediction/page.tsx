
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { CreatePredictionQuestionFormSchema, type CreatePredictionQuestionFormValues } from '@/types';
import { PlusCircle, Trash2, HelpCircleIcon, Link as LinkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AddPredictionPage() {
  const { toast } = useToast();

  const form = useForm<CreatePredictionQuestionFormValues>({
    resolver: zodResolver(CreatePredictionQuestionFormSchema),
    defaultValues: {
      questionText: '',
      options: [],
      correctAnswer: '',
      rewardDescription: '',
      status: 'active',
      googleFormLink: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
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
        description="Create a new question for the 'Predict and Win' feature."
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
                    placeholder="Enter the prediction question"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <div>
            <FormLabel>Answer Options (Optional)</FormLabel>
            <FormDescription className="mb-2">
              Add multiple choice options. If left empty, the question will expect a free-text answer.
            </FormDescription>
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2 mb-2">
                <FormField
                  control={form.control}
                  name={`options.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      {index === 0 && <FormLabel className="sr-only">Option Value</FormLabel>}
                      <FormControl>
                        <Input placeholder={`Option ${index + 1}`} {...field} />
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
                  aria-label="Remove option"
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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Option
            </Button>
            <FormMessage>{form.formState.errors.options?.message}</FormMessage>
          </div>
          <Separator />

          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correct Answer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the exact correct answer" {...field} />
                </FormControl>
                <FormDescription>
                  If using options, ensure this matches one of the option values exactly.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rewardDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 1000 UC, Exclusive Merchandise" {...field} />
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
                <FormLabel>Google Form Link (Optional)</FormLabel>
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


          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active (Visible to users)</SelectItem>
                    <SelectItem value="closed">Closed (Not visible for new predictions)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  'Active' questions will be shown on the public Predict & Win page.
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
      </Form>
    </div>
  );
}
