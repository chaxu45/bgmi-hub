
import { z } from 'zod';

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  imageUrls: z.array(
    z.string().url("Each image URL must be a valid URL.")
  ).optional().default([]),
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
  imageUrls: z.array(
    z.string().url("Each image URL must be a valid URL.")
  ).optional().default([]),
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
  logoUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format for Team Logo URL").optional()
  ),
  roster: z.array(PlayerSchema),
  description: z.string().optional(),
});
export type Team = z.infer<typeof TeamSchema>;

export const TournamentLeaderboardSchema = z.object({
  tournamentId: z.string().min(1, "Tournament ID is required"),
  tournamentName: z.string().min(1, "Tournament name is required"),
  leaderboardImageUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL for leaderboard image.").optional()
  ),
});
export type TournamentLeaderboard = z.infer<typeof TournamentLeaderboardSchema>;
