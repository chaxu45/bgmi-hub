
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  source: string;
  publishedDate: string;
  link: string;
}

export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  prizePool: string;
  dates: string;
  format?: string;
  pointSystem?: string;
  imageUrl?: string;
  status: 'Ongoing' | 'Upcoming' | 'Completed';
}

export interface Player {
  id:string;
  name: string;
  ign: string; // In-game name
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  roster: Player[];
  description?: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  teamLogoUrl?: string;
  points: number;
  matchesPlayed?: number;
}

export interface TournamentLeaderboard {
  tournamentId: string;
  tournamentName: string;
  entries: LeaderboardEntry[];
}
