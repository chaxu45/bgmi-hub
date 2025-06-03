
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ManagePredictionFormSchema, type ManagePredictionFormValues, type StoredPredictionQuestion } from '@/types';
import { Edit3, Save, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function ManagePredictionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentPrediction, setCurrentPrediction] = React.useState<StoredPredictionQuestion | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ManagePredictionFormValues>({
    resolver: zodResolver(ManagePredictionFormSchema),
    defaultValues: {
      questionText: '',
      googleFormUrl: '',
    },
  });

  React.useEffect(() => {
    async function fetchCurrentPrediction() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/predictions');
        if (!response.ok) {
          throw new Error('Failed to fetch current prediction');
        }
        const data: StoredPredictionQuestion | null = await response.json();
        setCurrentPrediction(data);
        if (data) {
          form.reset(data);
        } else {
          form.reset({ questionText: '', googleFormUrl: '' });
        }
      } catch (error) {
        toast({
          title: 'Error Loading Prediction',
          description: (error as Error).message,
          variant: 'destructive',
        });
        setCurrentPrediction(null);
        form.reset({ questionText: '', googleFormUrl: '' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrentPrediction();
  }, [form, toast]);

  async function onSubmit(data: ManagePredictionFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set prediction question');
      }
      const savedPrediction: StoredPredictionQuestion = await response.json();
      setCurrentPrediction(savedPrediction);
      form.reset(savedPrediction);
      toast({
        title: 'Success!',
        description: `Prediction question ${currentPrediction ? 'updated' : 'set'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error Saving Prediction',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePrediction() {
    if (!currentPrediction) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete prediction question');
      }
      setCurrentPrediction(null);
      form.reset({ questionText: '', googleFormUrl: '' });
      toast({
        title: 'Success!',
        description: 'Prediction question deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Prediction',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading prediction data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage Prediction Question"
        description={currentPrediction ? "Update or delete the current prediction question." : "Set a new prediction question for users."}
      />

      {!currentPrediction && !isLoading && (
        <Alert variant="default" className="mb-6">
          <Edit3 className="h-5 w-5" />
          <AlertTitle>No Active Prediction</AlertTitle>
          <AlertDescription>
            There is currently no prediction question set. Fill out the form below to add one.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prediction Question Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Who will win the Grand Finals?"
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
            name="googleFormUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Form URL for Submissions</FormLabel>
                <FormControl>
                  <Input placeholder="https://forms.gle/your-form-link" {...field} />
                </FormControl>
                <FormDescription>
                  Users will be directed to this Google Form to submit their predictions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> {currentPrediction ? 'Update Question' : 'Set Question'}
                </>
              )}
            </Button>

            {currentPrediction && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeletePrediction}
                disabled={isSaving}
              >
                {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Current Question
              </Button>
            )}
          </div>
        </form>
      </Form>
       {currentPrediction && (
         <>
            <Separator className="my-8" />
            <div className="space-y-3 p-4 border rounded-md bg-card/50">
                <h3 className="text-lg font-semibold text-foreground">Current Active Prediction:</h3>
                <p className="text-muted-foreground"><span className="font-medium text-foreground/90">Question:</span> {currentPrediction.questionText}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground/90">Form URL:</span> <a href={currentPrediction.googleFormUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{currentPrediction.googleFormUrl}</a></p>
            </div>
         </>
       )}
    </div>
  );
}
