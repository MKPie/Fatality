// VendorFlow API Configuration
// Update this URL when your tunnel changes

export const API_BASE_URL = 'https://currencies-european-saving-lexington.trycloudflare.com';

export const API_ENDPOINTS = {
  status: `${API_BASE_URL}/api/status`,
  stop: `${API_BASE_URL}/api/stop`,
  config: `${API_BASE_URL}/api/config`,
  upload: `${API_BASE_URL}/api/upload`,
  logs: `${API_BASE_URL}/api/logs`,
  logsStream: `${API_BASE_URL}/api/logs/stream`,
  
  // Scraping
  scrape: `${API_BASE_URL}/api/scrape`,
  scrapeFile: `${API_BASE_URL}/api/scrape/file`,
  scrapeResults: `${API_BASE_URL}/api/scrape/results`,
  
  // Tags
  tagsProcess: `${API_BASE_URL}/api/tags/process`,
  tagsPush: `${API_BASE_URL}/api/tags/push`,
  
  // Weights
  weightsProcess: `${API_BASE_URL}/api/weights/process`,
  
  // Eniture
  enitureSync: `${API_BASE_URL}/api/eniture/sync`,
  
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
