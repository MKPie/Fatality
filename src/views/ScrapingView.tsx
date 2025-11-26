import React, { useState, useRef } from 'react';
import { Database, Upload, X, Info } from 'lucide-react';
import { AppStatus, ScrapingConfig } from '../types';

interface ScrapingViewProps {
  status: AppStatus;
  onStart: (file: File, config: ScrapingConfig) => void;
  onStop: () => void;
}

export const ScrapingView: React.FC<ScrapingViewProps> = ({ status, onStart, onStop }) => {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ScrapingConfig>({
    modelColumn: 'Model',
    prefix: '',
    variationMode: 'None',
    startRow: 1,
    endRow: 9999,
    saveInterval: 10
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = status === AppStatus.PROCESSING;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStart = () => {
    if (!file) {
      alert('Please select an Excel file');
      return;
    }
    onStart(file, config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Database className="w-7 h-7 mr-3 text-blue-600" />
          Web Scraping Automation
        </h2>
        <p className="text-gray-600">
          Extract product data from vendor websites using Selenium-powered web scraping
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input File</h3>
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isProcessing
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isProcessing ? 'text-gray-400' : 'text-blue-500'}`} />
          {file ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
              {!isProcessing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-700 font-medium mb-1">Click to upload Excel file</p>
              <p className="text-sm text-gray-500">Supports .xlsx, .xls files</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraping Configuration</h3>
        <div className="space-y-4">
          {/* Model Column */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Model Column Name</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Excel column name containing product model numbers
                </div>
              </div>
            </div>
            <input
              type="text"
              value={config.modelColumn}
              onChange={(e) => setConfig({ ...config, modelColumn: e.target.value })}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Model"
              disabled={isProcessing}
            />
          </div>

          {/* Prefix */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Model Prefix</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Optional prefix to add before model numbers (e.g., brand name)
                </div>
              </div>
            </div>
            <input
              type="text"
              value={config.prefix}
              onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional prefix"
              disabled={isProcessing}
            />
          </div>

          {/* Variation Mode */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Variation Mode</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  How to handle product variations (None, Model Variations, or Custom)
                </div>
              </div>
            </div>
            <select
              value={config.variationMode}
              onChange={(e) => setConfig({ ...config, variationMode: e.target.value as ScrapingConfig['variationMode'] })}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            >
              <option value="None">None</option>
              <option value="Model Variations">Model Variations</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Row Range */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Row Range</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Specify which rows to process from the Excel file
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="number"
                value={config.startRow}
                onChange={(e) => setConfig({ ...config, startRow: parseInt(e.target.value) || 1 })}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start"
                min="1"
                disabled={isProcessing}
              />
              <span className="flex items-center text-gray-500">to</span>
              <input
                type="number"
                value={config.endRow}
                onChange={(e) => setConfig({ ...config, endRow: parseInt(e.target.value) || 9999 })}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="End"
                min="1"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Save Interval */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Save Interval</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Save progress every N products (prevents data loss)
                </div>
              </div>
            </div>
            <input
              type="number"
              value={config.saveInterval}
              onChange={(e) => setConfig({ ...config, saveInterval: parseInt(e.target.value) || 10 })}
              className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 10"
              min="1"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={!file || isProcessing}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            !file || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? 'Scraping in Progress...' : 'Start Scraping'}
        </button>
        {isProcessing && (
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            Stop
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Selenium-powered web scraping extracts product data from vendor websites</li>
          <li>• Processes model numbers, dimensions, weights, and product images</li>
          <li>• Saves progress automatically at specified intervals</li>
          <li>• Generates output Excel file with all scraped data</li>
        </ul>
      </div>
    </div>
  );
};
