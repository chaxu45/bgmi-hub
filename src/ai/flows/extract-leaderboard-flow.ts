
'use server';
/**
 * @fileOverview An AI flow to extract leaderboard data from an image.
 *
 * - extractLeaderboardFromImage - A function that handles leaderboard data extraction from an image.
 * - ExtractLeaderboardInput - The input type for the function.
 * - AiExtractedLeaderboardData - The return type for the function (defined in @/types).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { AiExtractedLeaderboardDataSchema, AiExtractedLeaderboardEntrySchema } from '@/types';

export const ExtractLeaderboardInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a game leaderboard, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLeaderboardInput = z.infer<typeof ExtractLeaderboardInputSchema>;

export async function extractLeaderboardFromImage(input: ExtractLeaderboardInput): Promise<AiExtractedLeaderboardData> {
  return extractLeaderboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLeaderboardPrompt',
  input: { schema: ExtractLeaderboardInputSchema },
  output: { schema: AiExtractedLeaderboardDataSchema },
  prompt: `You are an expert AI assistant specializing in analyzing images of game leaderboards, particularly for BGMI (Battlegrounds Mobile India).
Your task is to extract the tournament name and all leaderboard entries from the provided image.

For each leaderboard entry, please extract the following details if available:
- rank: The team's numerical rank.
- teamName: The name of the team.
- points: The total points scored by the team.
- matchesPlayed: The number of matches played by the team. This might not always be present.

The 'teamLogoUrl' is highly unlikely to be visible or extractable from the image itself. You should omit this field or leave it as an empty string for each entry. The user will fill this in manually if needed.

If the tournament name is not clearly visible or identifiable in the image, use the placeholder "Tournament Name from Image".

Ensure that 'rank' and 'points' are numbers. 'matchesPlayed' should also be a number if present.

Return the extracted information strictly in the JSON format specified by the output schema.

Image to analyze:
{{media url=imageDataUri}}
`,
});

const extractLeaderboardFlow = ai.defineFlow(
  {
    name: 'extractLeaderboardFlow',
    inputSchema: ExtractLeaderboardInputSchema,
    outputSchema: AiExtractedLeaderboardDataSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to extract leaderboard data from the image.');
    }
    // Ensure entries are at least an empty array if AI returns undefined/null for it.
    return {
        tournamentName: output.tournamentName,
        entries: output.entries || [] 
    };
  }
);
