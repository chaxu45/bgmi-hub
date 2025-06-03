
import { PageHeader } from '@/components/shared/page-header';
import type { StoredPredictionQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, Send } from 'lucide-react';
import { AdsenseAdUnit } from '@/components/ads/adsense-ad-unit'; // Import the ad unit
import { Separator } from '@/components/ui/separator';

async function getCurrentPrediction(): Promise<StoredPredictionQuestion | null> {
  try {
    // Using NEXT_PUBLIC_APP_URL for server-side fetch in a Server Component
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/predictions`, {
      next: { revalidate: 10 } // Revalidate every 10 seconds
    });
    if (!res.ok) {
      console.error("Failed to fetch prediction:", res.statusText);
      return null;
    }
    const data = await res.json();
    // The API returns null if no prediction is set, or the prediction object.
    return data as StoredPredictionQuestion | null;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return null;
  }
}

export default async function PredictAndWinPage() {
  const prediction = await getCurrentPrediction();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Predict & Win!"
        description="Test your BGMI knowledge and win exciting prizes."
      />

      {prediction ? (
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-accent mb-4">{prediction.questionText}</h3>
          <p className="text-muted-foreground mb-6">
            Think you know the answer? Submit your prediction via the Google Form linked below.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={prediction.googleFormUrl} target="_blank" rel="noopener noreferrer">
              Submit Your Prediction <Send className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Ensure you submit before the deadline mentioned in the form. Good luck!
          </p>
        </div>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto">
          <HelpCircle className="h-5 w-5" />
          <AlertTitle>No Active Prediction Challenge</AlertTitle>
          <AlertDescription>
            There are no active prediction challenges at the moment. Please check back later!
          </AlertDescription>
        </Alert>
      )}

      {/* AdSense Ad Unit for Predict & Win page */}
      <section className="my-8 pt-8">
         <Separator className="my-6" />
        <h3 className="text-xl font-semibold font-headline mb-4 text-center">Advertisement</h3>
        {/* Replace YOUR_AD_SLOT_ID_PREDICT_PAGE with an actual Ad Slot ID from your AdSense account */}
        <AdsenseAdUnit adSlotId="6934477342" className="mx-auto max-w-full w-[300px] h-[250px] md:w-[728px] md:h-[90px] bg-muted/20 flex items-center justify-center text-muted-foreground rounded-md shadow" />
         <Separator className="my-6" />
      </section>
    </div>
  );
}
