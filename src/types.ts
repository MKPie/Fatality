export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export interface ScrapingConfig {
  modelColumn: string;
  prefix: string;
  variationMode: 'None' | 'Model Variations' | 'Custom';
  startRow: number;
  endRow: number;
  saveInterval: number;
}

export interface TagConfig {
  pushToShopify: boolean;
}

export type TabId = 'dashboard' | 'scraping' | 'tags' | 'weights' | 'eniture' | 'settings';
