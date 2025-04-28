export type Emotion = 'joyful' | 'funny' | 'thoughtful' | 'bittersweet' | 'sad';

export interface MemoryFormData {
  content: string;
  relationship: string;
  timePeriod: string;
  emotion: Emotion;
  contributorName: string;
  mediaFile: File | null;
  mediaPreview: string | null;
}

export interface CreateMemoryPayload extends MemoryFormData {
  memorialId: string;
  mediaUrl: string;
}
