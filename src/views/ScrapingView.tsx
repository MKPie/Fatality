import React, { useState, useRef } from 'react';
import { Upload, Play, Square, Download, FileText, Zap } from 'lucide-react';
import { AppStatus } from '../types';

interface ScrapingViewProps {
  status: AppStatus;
  onStart: (file: File, config: ScrapingConfig) => void;
  onStop: () => void;
}

interface ScrapingConfig {
  model_column: string;
  prefix: string;
  variation_mode: string;
  start_row: number;
  end_row: number;
  save_interval: number;
}

export const ScrapingView: React.FC<ScrapingViewProps> = ({ status, onStart, onStop }) => {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ScrapingConfig>({
    model_column: 'Mfr Model',
    prefix: '',
    variation_mode: 'None',
    start_row: 1,
    end_row: 1000,
    save_interval: 5,
  });
  const [fileInfo, setFileInfo] = useState<{ rows: number; columns: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract prefix from filename (3 digits at end before extension)
  const extractPrefixFromFilename = (filename: string): string => {
    const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    const match = baseName.match(/(\d{3})$/);
    return match ? match[1] : '';
  };

  // Parse CSV to get row count and column names
  const parseCSVFile = (file: File): Promise<{ rows: number; columns: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          resolve({
            rows: lines.length - 1, // Exclude header
            columns: headers
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Auto-detect model column
  const detectModelColumn = (columns: string[]): string => {
    for (const col of columns) {
      const lower = col.toLowerCase();
      if (lower.includes('model') && lower.includes('mfr')) {
        return col;
      }
    }
    for (const col of columns) {
      if (col.toLowerCase().includes('model')) {
        return col;
      }
    }
    return columns[0] || 'Mfr Model';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Auto-detect prefix from filename
    const prefix = extractPrefixFromFilename(selectedFile.name);
    
    // Parse CSV for row count and columns
    try {
      const info = await parseCSVFile(selectedFile);
      setFileInfo(info);
      
      // Auto-detect model column
      const modelCol = detectModelColumn(info.columns);
      
      setConfig(prev => ({
        ...prev,
        prefix: prefix || prev.prefix,
        end_row: info.rows,
        model_column: modelCol,
      }));
    } catch (err) {
      console.error('Error parsing CSV:', err);
    }
  };

  const handleStart = () => {
    if (!file) return;
    onStart(file, config);
  };

  const isProcessing = status === AppStatus.PROCESSING;

  return (
    <div className="space-y-6">
      {/* File Selection Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">CSV File Selection</h3>
        </div>
        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${file ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-blue-500" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                  {fileInfo && ` • ${fileInfo.rows} rows • ${fileInfo.columns.length} columns`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Click to select CSV file</p>
                <p className="text-xs text-gray-400">Prefix will be auto-detected from filename</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Scraping Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Model Column & Prefix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Column</label>
              {fileInfo ? (
                <select
                  value={config.model_column}
                  onChange={(e) => setConfig(prev => ({ ...prev, model_column: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {fileInfo.columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={config.model_column}
                  onChange={(e) => setConfig(prev => ({ ...prev, model_column: e.target.value }))}
                  placeholder="e.g., Mfr Model"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Prefix
                {config.prefix && <span className="text-green-600 ml-2 text-xs">(auto-detected)</span>}
              </label>
              <input
                type="text"
                value={config.prefix}
                onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
                placeholder="e.g., 109"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row Range */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Row</label>
              <input
                type="number"
                min={1}
                value={config.start_row}
                onChange={(e) => setConfig(prev => ({ ...prev, start_row: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Row
                {fileInfo && <span className="text-green-600 ml-2 text-xs">(auto-detected)</span>}
              </label>
              <input
                type="number"
                min={1}
                value={config.end_row}
                onChange={(e) => setConfig(prev => ({ ...prev, end_row: parseInt(e.target.value) || 1000 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Save Interval</label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.save_interval}
                onChange={(e) => setConfig(prev => ({ ...prev, save_interval: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Variation Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variation Mode</label>
            <select
              value={config.variation_mode}
              onChange={(e) => setConfig(prev => ({ ...prev, variation_mode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="None">None (Original only)</option>
              <option value="Auto">Auto (Based on AQ Specification)</option>
              <option value="Gas Type">Gas Type (LP, NG)</option>
              <option value="Electric">Electric (18 voltage variations)</option>
              <option value="Low Voltage">Low Voltage (12 variations)</option>
              <option value="Check All">Check All (20 variations)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {config.variation_mode === 'Auto' && 'Uses AQ Specification column to determine variation type'}
              {config.variation_mode === 'None' && 'Only scrapes original model number'}
              {config.variation_mode === 'Gas Type' && 'Scrapes original + LP and NG variants'}
              {config.variation_mode === 'Electric' && 'Scrapes original + 18 electrical voltage variants'}
              {config.variation_mode === 'Check All' && 'Scrapes original + all 20 possible variants'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        {isProcessing ? (
          <button
            onClick={onStop}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Scraping
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!file || !config.prefix}
            className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors
              ${!file || !config.prefix 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Scraping
          </button>
        )}
      </div>

      {/* Info Box */}
      {file && config.prefix && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Ready to scrape</p>
              <p className="mt-1">
                Will scrape rows {config.start_row} to {config.end_row} from column "{config.model_column}" 
                using prefix "{config.prefix}" with {config.variation_mode} variation mode.
                Results auto-save every {config.save_interval} models.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
