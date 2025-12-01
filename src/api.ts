// VendorFlow API Configuration
// Update this URL when your tunnel changes

export const API_BASE_URL = 'https://api.mkpi.site';

export const API_ENDPOINTS = {
  status: `${API_BASE_URL}/`,  // Changed from /api/status
  health: `${API_BASE_URL}/health`,
  stop: `${API_BASE_URL}/api/stop`,
  logs: `${API_BASE_URL}/api/logs`,
  logsStream: `${API_BASE_URL}/api/logs/stream`,
  
  // Scraping - removed /file
  scrape: `${API_BASE_URL}/api/scrape`,
  scrapeFile: `${API_BASE_URL}/api/scrape`,
  
  // Tags - removed /process and /push suffixes
  tagsProcess: `${API_BASE_URL}/api/tags`,
  tagsPush: `${API_BASE_URL}/api/tags`,
  
  // Weights - removed /process
  weightsProcess: `${API_BASE_URL}/api/weights`,
  
  // Eniture - removed /sync
  enitureSync: `${API_BASE_URL}/api/eniture`,
  
  // Download
  download: (filename: string) => `${API_BASE_URL}/api/download/${filename}`,
};

// API helper functions
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(endpoint: string, data?: FormData | object): Promise<T> {
  const options: RequestInit = {
    method: 'POST',
  };
  
  if (data instanceof FormData) {
    options.body = data;
  } else if (data) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// SSE Log Stream
export function connectLogStream(onMessage: (log: any) => void, onError?: (error: any) => void): EventSource {
  const eventSource = new EventSource(API_ENDPOINTS.logsStream);
  
  eventSource.onmessage = (event) => {
    try {
      const log = JSON.parse(event.data);
      onMessage(log);
    } catch (e) {
      console.error('Failed to parse log:', e);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    if (onError) onError(error);
  };
  
  return eventSource;
}
