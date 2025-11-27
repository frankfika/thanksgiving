export interface GratitudeInput {
  text: string;
}

export interface StarData {
  id: string;
  originalText: string;
  aiResponse: {
    category: string;
    sentimentColor: string; // Hex code
    blessing: string; // A poetic response
    brightness: number; // 0.5 to 1.0 based on emotion strength
    archetype: string; // e.g. "The Guardian", "The Spark"
    distance: string; // e.g. "450 Light Years"
    frequency: string; // e.g. "432 Hz"
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  VIEWING = 'VIEWING',
  ERROR = 'ERROR'
}