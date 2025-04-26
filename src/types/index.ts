export interface Memorial {
  id: string;
  fullName: string;
  birthDate: string;
  passedDate: string;
  createdat: string; // Matches database column name (lowercase)
  coverImage?: string;
  description?: string;
  privacy: 'public' | 'family' | 'private';
  contributorCount: number;
  memoryCount: number;
  aiNarrative: string;
  user_id: string;
  tone?: string;
  style?: string;
}

export interface Memory {
  id: string;
  memorialId: string;
  contributorId: string;
  contributorName: string;
  contributorAvatar?: string;
  relationship?: string;
  content: string;
  date?: string;
  timePeriod?: string;
  emotion?: 'joyful' | 'funny' | 'thoughtful' | 'bittersweet' | 'sad';
  mediaUrl?: string;
  likes?: number;
  hasLiked?: boolean;
  comments?: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  memoryId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}