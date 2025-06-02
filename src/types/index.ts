
import { z } from 'zod';

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format for Image URL").optional()
  ),
  source: z.string().min(1, "Source is required"),
  publishedDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  link: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format for Article Link").optional()
  ),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const TournamentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  organizer: z.string().min(1, "Organizer is required"),
  prizePool: z.string().min(1, "Prize pool is required"),
  dates: z.string().min(1, "Dates are required"),
  format: z.string().optional(),
  pointSystem: z.string().optional(),
  imageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format for Image URL").optional()
  ),
  status: z.enum(['Ongoing', 'Upcoming', 'Completed']),
});
export type Tournament = z.infer<typeof TournamentSchema>;

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Player name is required"),
  ign: z.string().min(1, "In-game name (IGN) is required"),
  role: z.string().optional(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Team name is required"),
  logoUrl: z.string().url().optional(),
  roster: z.array(PlayerSchema),
  description: z.string().optional(),
});
export type Team = z.infer<typeof TeamSchema>;

export const LeaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  teamName: z.string().min(1, "Team name is required"),
  teamLogoUrl: z.string().url().optional(),
  points: z.number().int(),
  matchesPlayed: z.number().int().optional(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const TournamentLeaderboardSchema = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  tournamentName: z.string().min(1, "Tournament name is required"),
  entries: z.array(LeaderboardEntrySchema),
});
export type TournamentLeaderboard = z.infer<typeof TournamentLeaderboardSchema>;

