
export interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAI: boolean;
  voiceName: string;
  personality: string;
}

export enum CallState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface TranscriptionEntry {
  speaker: string;
  text: string;
  timestamp: number;
}
