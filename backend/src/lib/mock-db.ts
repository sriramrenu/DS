
export type Role = 'Admin' | 'Participant';

export interface Track {
  id: string;
  track_name: 'Machine Learning' | 'Data Analytics' | 'NLP' | 'Computer Vision';
  download_link: string;
}

export interface Team {
  id: string;
  team_name: string;
  track_id: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  team_id?: string;
}

export interface Submission {
  id: string;
  team_id: string;
  track_id: string;
  numeric_answer: number;
  image_path: string;
  submission_time: string;
}

export interface Score {
  team_id: string;
  phase1_score: number;
  phase2_score: number;
  phase3_score: number;
  phase4_score: number;
  total_score: number;
}

export const tracks: Track[] = [
  { id: 'track-1', track_name: 'Machine Learning', download_link: 'https://example.com/ml-dataset' },
  { id: 'track-2', track_name: 'Data Analytics', download_link: 'https://example.com/analytics-dataset' },
  { id: 'track-3', track_name: 'NLP', download_link: 'https://example.com/nlp-dataset' },
  { id: 'track-4', track_name: 'Computer Vision', download_link: 'https://example.com/cv-dataset' },
];

// Backward compatibility exports
export const troops = tracks;
export type Troop = Track;

// Generate 25 teams
export const teams: Team[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `team-${i + 1}`,
  team_name: `DataTeam ${i + 1}`,
  track_id: tracks[i % 4].id,
}));

// Mock Users
export const users: User[] = [
  { id: 'u-admin', username: 'admin', password: 'password123', role: 'Admin' },
  ...teams.map((team, i) => ({
    id: `u-p-${i + 1}`,
    username: `user${i + 1}`,
    password: 'password123',
    role: 'Participant' as Role,
    team_id: team.id,
  })),
];

// Initial scores for all teams
export const initialScores: Score[] = teams.map((team) => ({
  team_id: team.id,
  phase1_score: 0,
  phase2_score: 0,
  phase3_score: 0,
  phase4_score: 0,
  total_score: 0,
}));
