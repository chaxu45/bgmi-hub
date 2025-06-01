import type { NewsArticle, Tournament, Team, TournamentLeaderboard } from '@/types';

export const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Major BGMI Tournament Announced for Q3 2024',
    summary: 'A new major BGMI tournament with a massive prize pool has been announced by Krafton India, scheduled for the third quarter of 2024.',
    imageUrl: 'https://placehold.co/600x400.png',
    source: 'BGMI Official',
    publishedDate: '2024-07-20',
    link: '#',
  },
  {
    id: '2',
    title: 'Team Velocity crowned champions of BGMI Masters Series',
    summary: 'Team Velocity showcased an incredible performance to win the BGMI Masters Series, taking home the lion\'s share of the prize pool.',
    imageUrl: 'https://placehold.co/600x400.png',
    source: 'Esports Insider',
    publishedDate: '2024-07-18',
    link: '#',
  },
  {
    id: '3',
    title: 'BGMI Update 3.5: New Map and Features Coming Soon',
    summary: 'The upcoming BGMI update 3.5 is rumored to introduce a new map, several gameplay enhancements, and new weapon skins.',
    imageUrl: 'https://placehold.co/600x400.png',
    source: 'Gaming News Hub',
    publishedDate: '2024-07-15',
    link: '#',
  },
];

export const mockTournaments: Tournament[] = [
  {
    id: 't1',
    name: 'BGMI India Series (BGIS) 2024',
    organizer: 'Krafton India',
    prizePool: '₹2,00,00,000',
    dates: 'August 1 - September 15, 2024',
    format: 'Squads, TPP, Online Qualifiers, LAN Finals',
    pointSystem: 'Standard points system with placement and kill points.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'Upcoming',
  },
  {
    id: 't2',
    name: 'Skyesports Championship 5.0 BGMI',
    organizer: 'Skyesports',
    prizePool: '₹1,00,00,000',
    dates: 'July 25 - August 30, 2024',
    format: 'Squads, TPP, Invitational + Qualifiers',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'Ongoing',
  },
  {
    id: 't3',
    name: 'BGMI Pro Series (BMPS) 2024 Season 2',
    organizer: 'Krafton India',
    prizePool: '₹1,50,00,000',
    dates: 'October 10 - November 25, 2024',
    status: 'Upcoming',
    imageUrl: 'https://placehold.co/600x400.png',
  },
  {
    id: 't4',
    name: 'India Today Gaming BGMI Cup',
    organizer: 'India Today Gaming',
    prizePool: '₹50,00,000',
    dates: 'June 1 - July 10, 2024',
    status: 'Completed',
    imageUrl: 'https://placehold.co/600x400.png',
  },
];

export const mockTeams: Team[] = [
  {
    id: 'team1',
    name: 'Team SouL',
    logoUrl: 'https://placehold.co/100x100.png',
    description: 'One of the most popular and successful BGMI teams in India.',
    roster: [
      { id: 'p1', name: 'Omega', ign: 'SouLOmega', role: 'IGL' },
      { id: 'p2', name: 'Goblin', ign: 'SouLGoblin', role: 'Assaulter' },
      { id: 'p3', name: 'AkshaT', ign: 'SouLAkshaT', role: 'Assaulter' },
      { id: 'p4', name: 'Hector', ign: 'SouLHector', role: 'Support' },
    ],
  },
  {
    id: 'team2',
    name: 'GodLike Esports',
    logoUrl: 'https://placehold.co/100x100.png',
    description: 'A powerhouse in Indian BGMI, known for its aggressive gameplay.',
    roster: [
      { id: 'p5', name: 'Jonathan', ign: 'GodLJonathan', role: 'Assaulter' },
      { id: 'p6', name: 'ClutchGod', ign: 'GodLClutchGod', role: 'IGL' },
      { id: 'p7', name: 'ZGOD', ign: 'GodLZGOD', role: 'Support' },
      { id: 'p8', name: 'Neyoo', ign: 'GodLNeyoo', role: 'Entry Fragger' },
    ],
  },
  {
    id: 'team3',
    name: 'Team XSpark',
    logoUrl: 'https://placehold.co/100x100.png',
    description: 'Led by Scout, a fan-favorite team with a strong lineup.',
    roster: [
      { id: 'p9', name: 'Scout', ign: 'TXScout', role: 'IGL/Assaulter' },
      { id: 'p10', name: 'Mavi', ign: 'TXMavi', role: 'IGL' },
      { id: 'p11', name: 'Aditya', ign: 'TXAditya', role: 'Assaulter' },
      { id: 'p12', name: 'Pukar', ign: 'TXPukar', role: 'Support' },
    ],
  },
  {
    id: 'team4',
    name: 'OR Esports',
    logoUrl: 'https://placehold.co/100x100.png',
    description: 'Consistently performing team with skilled players.',
    roster: [
      { id: 'p13', name: 'Jelly', ign: 'ORJelly', role: 'IGL' },
      { id: 'p14', name: 'Maxx', ign: 'ORMaxx', role: 'Assaulter' },
      { id: 'p15', name: 'Attanki', ign: 'ORAttanki', role: 'Entry Fragger' },
      { id: 'p16', name: 'Admino', ign: 'ORAdmino', role: 'Support' },
    ],
  },
];

export const mockLeaderboard: TournamentLeaderboard = {
  tournamentId: 't2',
  tournamentName: 'Skyesports Championship 5.0 BGMI (Ongoing)',
  entries: [
    { rank: 1, teamName: 'GodLike Esports', teamLogoUrl: 'https://placehold.co/50x50.png', points: 120, matchesPlayed: 10 },
    { rank: 2, teamName: 'Team SouL', teamLogoUrl: 'https://placehold.co/50x50.png', points: 115, matchesPlayed: 10 },
    { rank: 3, teamName: 'OR Esports', teamLogoUrl: 'https://placehold.co/50x50.png', points: 100, matchesPlayed: 10 },
    { rank: 4, teamName: 'Team XSpark', teamLogoUrl: 'https://placehold.co/50x50.png', points: 95, matchesPlayed: 10 },
    { rank: 5, teamName: 'Blind Esports', teamLogoUrl: 'https://placehold.co/50x50.png', points: 92, matchesPlayed: 10 },
    { rank: 6, teamName: 'Revenant Esports', teamLogoUrl: 'https://placehold.co/50x50.png', points: 88, matchesPlayed: 10 },
  ],
};
