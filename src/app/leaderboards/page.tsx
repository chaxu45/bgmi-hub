
import { PageHeader } from '@/components/shared/page-header';
import type { TournamentLeaderboard } from '@/types';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageIcon } from 'lucide-react';


async function getLeaderboardData(): Promise<TournamentLeaderboard | null> {
  try {
    // Ensure cache is not used or revalidated frequently for up-to-date images
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/leaderboards`, { next: { revalidate: 10 } }); 
    if (!res.ok) {
      console.error("Failed to fetch leaderboard:", res.statusText);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return null;
  }
}

export default async function LeaderboardsPage() {
  const currentLeaderboard = await getLeaderboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title={currentLeaderboard?.tournamentName || "Tournament Leaderboard"}
        description="The latest tournament standings, displayed as an image."
      />
      
      {currentLeaderboard && currentLeaderboard.leaderboardImageUrl ? (
        <section className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl aspect-[3/4] border rounded-lg shadow-lg overflow-hidden bg-card">
            <Image
              src={currentLeaderboard.leaderboardImageUrl}
              alt={`${currentLeaderboard.tournamentName} Leaderboard`}
              layout="fill"
              objectFit="contain"
              priority // Prioritize loading the main content image
              data-ai-hint="leaderboard chart"
            />
          </div>
        </section>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto">
          <ImageIcon className="h-5 w-5" />
          <AlertTitle>Leaderboard Image Not Available</AlertTitle>
          <AlertDescription>
            {currentLeaderboard ? `The leaderboard image for "${currentLeaderboard.tournamentName}" has not been set yet.` : "Leaderboard data is currently unavailable or no image has been uploaded."}
            Please check back later or contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
