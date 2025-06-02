
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PredictionQuestion } from '@/types';
import { ExternalLink, AlertCircle, GiftIcon } from 'lucide-react';
import Link from 'next/link';

async function getActivePredictionQuestion(): Promise<PredictionQuestion | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/predictions/questions`, { 
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!res.ok) {
      console.error("Failed to fetch prediction question:", res.statusText);
      return null;
    }
    const data = await res.json();
    return data as PredictionQuestion | null;
  } catch (error) {
    console.error("Error fetching prediction question:", error);
    return null;
  }
}

export default async function PredictAndWinPage() {
  const question = await getActivePredictionQuestion();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Predict & Win!"
        description="Test your BGMI knowledge and win exciting rewards. Answer the current question via the provided link."
      />

      {question && question.status === 'active' ? (
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-accent flex items-center">
              <GiftIcon className="mr-3 h-7 w-7" /> Current Prediction Challenge
            </CardTitle>
            <CardDescription>
              Answer correctly for a chance to win: {question.rewardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-foreground">{question.questionText}</p>
            {question.options && question.options.length > 0 && (
              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Options:</h4>
                <ul className="list-disc list-inside space-y-1 text-foreground">
                  {question.options.map((opt, index) => (
                    <li key={index}>{opt}</li>
                  ))}
                </ul>
              </div>
            )}
             {!question.googleFormLink && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission Link Missing</AlertTitle>
                    <AlertDescription>
                        The submission link for this question is not available yet. Please check back soon.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
          {question.googleFormLink && (
            <CardFooter>
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={question.googleFormLink} target="_blank" rel="noopener noreferrer">
                  Submit Your Prediction <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>No Active Prediction Challenge</AlertTitle>
          <AlertDescription>
            There isn't an active "Predict & Win" challenge right now. Please check back later for new questions!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
