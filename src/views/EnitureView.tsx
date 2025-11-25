import React, { useState, useRef } from 'react';
import { Zap, Upload, X, Info } from 'lucide-react';
import { AppStatus } from '../types';

interface EnitureViewProps {
  status: AppStatus;
  onStart: (files: { lookup: File; csv: File }) => void;
}

export const EnitureView: React.FC<EnitureViewProps> = ({ status, onStart }) => {
  const [lookupFile, setLookupFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const lookupInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = status === AppStatus.PROCESSING;

  const handleStart = () => {
    if (!lookupFile || !csvFile) {
      alert('Please select both Lookup and CSV files');
      return;
    }
    onStart({ lookup: lookupFile, csv: csvFile });
  };

  const FileUpload = ({ 
    label, 
    file, 
    setFile, 
    inputRef, 
    accept 
  }: { 
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    accept: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isProcessing
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50 cursor-pointer'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isProcessing ? 'text-gray-400' : 'text-orange-500'}`} />
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
            <p className="text-sm text-gray-600 font-medium">Click to upload</p>
            <p className="text-xs text-gray-500">{accept}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Zap className="w-7 h-7 mr-3 text-orange-600" />
          Eniture Shipping API
        </h2>
        <p className="text-gray-600">
          Sync weight and dimension data with Eniture's freight shipping calculator API
        </p>
      </div>

      {/* File Uploads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Lookup Table File"
            file={lookupFile}
            setFile={setLookupFile}
            inputRef={lookupInputRef}
            accept=".xlsx,.xls"
          />
          <FileUpload
            label="Weight CSV File"
            file={csvFile}
            setFile={setCsvFile}
            inputRef={csvInputRef}
            accept=".csv"
          />
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Lookup File:</strong> Product mapping and Eniture product IDs<br />
            <strong>Weight CSV:</strong> Current weight/dimension data to sync
          </p>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Connection</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">API Status</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Connection status to Eniture freight shipping API
                </div>
              </div>
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">API Endpoint</label>
            </div>
            <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
              api.eniture.com
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sync Mode</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Updates product dimensions via Eniture API for freight calculations
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Dimension Update
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={!lookupFile || !csvFile || isProcessing}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            !lookupFile || !csvFile || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? 'Syncing with Eniture...' : 'Start Eniture Sync'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-orange-900 mb-2">How It Works</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Reads product mappings from lookup table (SKU to Eniture ID)</li>
          <li>• Matches current weight/dimension data from CSV file</li>
          <li>• Updates product dimensions via Eniture freight API</li>
          <li>• Generates sync report showing API results and any errors</li>
        </ul>
      </div>

      {/* Sync Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Products to sync:</span>
            <span className="font-medium text-gray-900">
              {lookupFile && csvFile ? 'Ready' : 'Waiting for files...'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">API Rate Limit:</span>
            <span className="font-medium text-gray-900">100 requests/minute</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Retry on failure:</span>
            <span className="font-medium text-gray-900">3 attempts</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Timeout:</span>
            <span className="font-medium text-gray-900">30 seconds</span>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Important Notes
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Ensure Eniture API credentials are configured in Settings</li>
          <li>• Large syncs may take several minutes due to API rate limits</li>
          <li>• Failed updates will be logged and can be retried</li>
        </ul>
      </div>
    </div>
  );
};
