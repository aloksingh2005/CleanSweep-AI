export enum AppState {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
  PROCESSING = 'PROCESSING',
  COMPARE = 'COMPARE'
}

export enum AppMode {
  TEXT_REMOVAL = 'TEXT_REMOVAL',
  OBJECT_REMOVAL = 'OBJECT_REMOVAL',
  CUSTOM = 'CUSTOM'
}

export interface ProcessedResult {
  original: string;
  processed: string;
  timestamp: number;
}

export interface BrushSettings {
  size: number;
  hardness: number; // 0 to 1
  opacity: number; // 0 to 1
}

export interface Point {
  x: number;
  y: number;
}