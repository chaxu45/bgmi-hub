
import { PageHeader } from '@/components/shared/page-header';
import type { TournamentLeaderboard } from '@/types';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageIcon } from 'lucide-react';


async function getLeaderboardData(): Promise<TournamentLeaderboard | null> {
  try {
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
  const displayImageUrl = currentLeaderboard?.leaderboardImageUrls && currentLeaderboard.leaderboardImageUrls.length > 0 
                          ? currentLeaderboard.leaderboardImageUrls[0] 
                          : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={currentLeaderboard?.tournamentName || "Tournament Leaderboard"}
        description="The latest tournament standings. The first uploaded image is displayed here."
      />
      
      {displayImageUrl ? (
        <section className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl aspect-[3/4] border rounded-lg shadow-lg overflow-hidden bg-card">
            <Image
              src={displayImageUrl}
              alt={`${currentLeaderboard?.tournamentName || 'Leaderboard'} Image`}
              layout="fill"
              objectFit="contain"
              priority
              data-ai-hint="leaderboard chart"
            />
          </div>
          {currentLeaderboard && currentLeaderboard.leaderboardImageUrls && currentLeaderboard.leaderboardImageUrls.length > 1 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Displaying the first of {currentLeaderboard.leaderboardImageUrls.length} images.
            </p>
          )}
        </section>
      ) : (
        <Alert variant="default" className="max-w-xl mx-auto">
          <ImageIcon className="h-5 w-5" />
          <AlertTitle>Leaderboard Image Not Available</AlertTitle>
          <AlertDescription>
            {currentLeaderboard ? `Leaderboard images for "${currentLeaderboard.tournamentName}" have not been set yet.` : "Leaderboard data is currently unavailable or no images have been uploaded."}
            Please check back later or contact an administrator.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
