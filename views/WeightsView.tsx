import React, { useState, useRef } from 'react';
import { Scale, Upload, X, Info } from 'lucide-react';
import { AppStatus } from '../types';

interface WeightsViewProps {
  status: AppStatus;
  onStart: (files: { vendor: File; output?: File }) => void;
}

export const WeightsView: React.FC<WeightsViewProps> = ({ status, onStart }) => {
  const [vendorFile, setVendorFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);

  const vendorInputRef = useRef<HTMLInputElement>(null);
  const outputInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = status === AppStatus.PROCESSING;

  const handleStart = () => {
    if (!vendorFile) {
      alert('Please select a Vendor file');
      return;
    }
    onStart({ vendor: vendorFile, output: outputFile || undefined });
  };

  const FileUpload = ({ 
    label, 
    file, 
    setFile, 
    inputRef, 
    accept,
    optional = false
  }: { 
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    accept: string;
    optional?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {optional && (
          <span className="text-xs text-gray-500 italic">(Optional)</span>
        )}
      </div>
      <div
        onClick={() => !isProcessing && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          isProcessing
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isProcessing ? 'text-gray-400' : 'text-purple-500'}`} />
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
          <Scale className="w-7 h-7 mr-3 text-purple-600" />
          Weight & Dimension Management
        </h2>
        <p className="text-gray-600">
          Synchronize product weights and dimensions from vendor data
        </p>
      </div>

      {/* File Uploads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Vendor Weight File"
            file={vendorFile}
            setFile={setVendorFile}
            inputRef={vendorInputRef}
            accept=".xlsx,.xls,.csv"
          />
          <FileUpload
            label="Output Template"
            file={outputFile}
            setFile={setOutputFile}
            inputRef={outputInputRef}
            accept=".xlsx,.xls,.csv"
            optional={true}
          />
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Vendor File:</strong> Contains weight and dimension data from vendor<br />
            <strong>Output Template:</strong> Optional template for output format. If not provided, a default format will be used.
          </p>
        </div>
      </div>

      {/* Sync Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Data Fields</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Weight, Length, Width, Height, and Volume will be synchronized
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Weight • Dimensions • Volume
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Update Mode</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Match products by SKU and update dimension data
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              SKU Matching
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Output Format</label>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Results will be exported in Excel format
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
              Excel (.xlsx)
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={!vendorFile || isProcessing}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            !vendorFile || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? 'Syncing Weights...' : 'Start Weight Sync'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-900 mb-2">How It Works</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Reads weight and dimension data from vendor file</li>
          <li>• Matches products by SKU or model number</li>
          <li>• Updates weight, length, width, height, and volume fields</li>
          <li>• Generates updated Excel file with all dimension data</li>
        </ul>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="space-y-2">
          {vendorFile && (
            <p className="text-sm text-gray-600">
              ✓ Ready to sync: <span className="font-medium">{vendorFile.name}</span>
            </p>
          )}
          {outputFile && (
            <p className="text-sm text-gray-600">
              ✓ Using template: <span className="font-medium">{outputFile.name}</span>
            </p>
          )}
          {!vendorFile && (
            <p className="text-sm text-gray-500 italic">
              Waiting for vendor file upload...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
