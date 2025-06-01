import { LeaderboardTable } from '@/components/leaderboards/leaderboard-table';
import { PageHeader } from '@/components/shared/page-header';
import { mockLeaderboard } from '@/data/mock-data';
// Import Select components if needed for filtering in the future
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeaderboardsPage() {
  // In a real app, you might fetch multiple leaderboards or allow selection
  const currentLeaderboard = mockLeaderboard;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tournament Leaderboards"
        description="Check out the latest rankings and scores from BGMI tournaments."
      />
      
      {/* Placeholder for tournament selection dropdown - Future enhancement
      <div className="mb-6 max-w-xs">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Tournament" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={currentLeaderboard.tournamentId}>
              {currentLeaderboard.tournamentName}
            </SelectItem>
            // Add more tournaments here
          </SelectContent>
        </Select>
      </div> 
      */}

      <section>
        <h3 className="text-xl font-semibold mb-4 font-headline">{currentLeaderboard.tournamentName}</h3>
        <LeaderboardTable leaderboard={currentLeaderboard} />
      </section>
    </div>
  );
}
