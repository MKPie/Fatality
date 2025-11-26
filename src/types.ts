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
  model_column: string;
  prefix: string;
  variation_mode: string;
  start_row: number;
  end_row: number;
  save_interval: number;
}

export interface TagConfig {
  mode: 'process' | 'push';
  output_name?: string;
}

export interface AppState {
  activeTab: string;
  status: AppStatus;
  progress: number;
  currentTask: string;
  logs: LogEntry[];
}

export type TabId = 'dashboard' | 'scraping' | 'tags' | 'weights' | 'eniture' | 'settings';
