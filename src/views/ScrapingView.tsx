import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, Square, Download, Database } from 'lucide-react';
import { AppStatus } from '../types';

const API_URL = 'https://api.mkpi.site';

interface ScrapingViewProps {
  status: AppStatus;
  onStart: (file: File, config: any) => void;
  onStop: () => void;
}

export const ScrapingView: React.FC<ScrapingViewProps> = ({ status, onStart, onStop }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState('');
  const [variationMode, setVariationMode] = useState('None');
  const [startRow, setStartRow] = useState(1);
  const [endRow, setEndRow] = useState(1000);
  const [saveInterval, setSaveInterval] = useState(5);
  const [modelColumn, setModelColumn] = useState('Mfr Model');
  
  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [logs, setLogs] = useState<Array<{timestamp: string, message: string, type: string}>>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // SSE connection
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect prefix from filename (last 3 digits)
      const match = selectedFile.name.match(/(\d{3})(?:\.|$)/);
      if (match) {
        setPrefix(match[1]);
      }
      
      // Auto-detect end row by reading CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const rowCount = lines.length - 1; // Subtract header
        setEndRow(rowCount);
        
        // Auto-detect model column from header
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const modelCol = headers.find(h => h.toLowerCase().includes('model') && h.toLowerCase().includes('mfr'));
          if (modelCol) {
            setModelColumn(modelCol);
          }
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  // Connect to SSE stream
  const connectSSE = (sid: string) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`${API_URL}/api/logs/stream?session_id=${sid}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'progress':
            setProgress(data.percentage);
            setCurrentModel(data.current_model);
            setProcessedCount(data.processed);
            setTotalCount(data.total);
            break;
            
          case 'log':
            setLogs(prev => [...prev, data.log]);
            break;
            
          case 'complete':
            setIsProcessing(false);
            if (data.status === 'completed') {
              setLogs(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: '✓ Scraping completed successfully!',
                type: 'success'
              }]);
            } else if (data.status === 'error') {
              setLogs(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: `✗ Error: ${data.error}`,
                type: 'error'
              }]);
            }
            eventSource.close();
            break;
            
          case 'error':
            setLogs(prev => [...prev, {
              timestamp: new Date().toLocaleTimeString(),
              message: `✗ ${data.message}`,
              type: 'error'
            }]);
            setIsProcessing(false);
            eventSource.close();
            break;
        }
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      setIsProcessing(false);
    };

    eventSourceRef.current = eventSource;
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Start scraping
  const handleStart = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    if (!prefix) {
      alert('Please enter a prefix');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setLogs([]);
      setCurrentModel('');
      setProcessedCount(0);
      setTotalCount(0);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', prefix);
      formData.append('variation_mode', variationMode);
      formData.append('start_row', startRow.toString());
      formData.append('end_row', endRow.toString());
      formData.append('save_interval', saveInterval.toString());
      formData.append('model_column', modelColumn);

      // Start scraping
      const response = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSessionId(result.session_id);
        connectSSE(result.session_id);
        
        setLogs([{
          timestamp: new Date().toLocaleTimeString(),
          message: `Started scraping with session ${result.session_id}`,
          type: 'info'
        }]);
      } else {
        throw new Error(result.error || 'Failed to start scraping');
      }

    } catch (error) {
      console.error('Error starting scraping:', error);
      setIsProcessing(false);
      setLogs([{
        timestamp: new Date().toLocaleTimeString(),
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      }]);
    }
  };

  // Stop scraping
  const handleStop = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsProcessing(false);
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message: 'Stopped by user',
      type: 'warning'
    }]);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Data Source</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="csv-upload"
                className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isProcessing
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Choose CSV file...'}
                </span>
              </label>
            </div>
            {file && (
              <p className="mt-2 text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB • {endRow} rows detected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraping Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Prefix
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., 109"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Column
            </label>
            <input
              type="text"
              value={modelColumn}
              onChange={(e) => setModelColumn(e.target.value)}
              placeholder="e.g., Mfr Model"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variation Mode
            </label>
            <select
              value={variationMode}
              onChange={(e) => setVariationMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            >
              <option>None</option>
              <option>Auto</option>
              <option>Gas Type</option>
              <option>Electric</option>
              <option>Low Voltage</option>
              <option>Check All</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Save Interval
            </label>
            <input
              type="number"
              value={saveInterval}
              onChange={(e) => setSaveInterval(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Row
            </label>
            <input
              type="number"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Row
            </label>
            <input
              type="number"
              value={endRow}
              onChange={(e) => setEndRow(parseInt(e.target.value))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          {!isProcessing ? (
            <button
              onClick={handleStart}
              disabled={!file || !prefix}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Scraping
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      {isProcessing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            <span className="text-sm font-medium text-blue-600">
              {progress}%
            </span>
          </div>

          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {currentModel && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Current Model:</span> {currentModel}
              <span className="mx-2">•</span>
              <span>{processedCount} / {totalCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
        </div>
        <div className="p-4 bg-slate-900 rounded-b-xl" style={{ maxHeight: '400px', overflow: 'auto' }}>
          <div className="font-mono text-sm space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No activity yet. Start scraping to see live progress.
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'success'
                      ? 'text-green-400'
                      : log.type === 'warning'
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
// rebuild Thu Dec  4 02:05:23 PM CST 2025
