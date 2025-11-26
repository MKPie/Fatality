import React, { useState, useRef } from 'react';
import { Upload, Play, FileText, Scale } from 'lucide-react';
import { AppStatus } from '../types';

interface WeightsViewProps {
  status: AppStatus;
  onStart: (files: { vendor_file: File; output_file: File }) => void;
}

export const WeightsView: React.FC<WeightsViewProps> = ({ status, onStart }) => {
  const [vendorFile, setVendorFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  
  const vendorInputRef = useRef<HTMLInputElement>(null);
  const outputInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (!vendorFile || !outputFile) return;
    onStart({ vendor_file: vendorFile, output_file: outputFile });
  };

  const isProcessing = status === AppStatus.PROCESSING;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
            <Scale className="w-4 h-4 mr-2" />
            Weight & Dimensions Update
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">
            Updates weight, dimensions, freight class, and quote method in your output CSV 
            by matching Variant SKU to Mfr Model in the vendor CSV.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-1">Vendor CSV columns used:</p>
              <ul className="text-gray-500 space-y-0.5">
                <li>• Mfr Model</li>
                <li>• Shipping Weight</li>
                <li>• Width, Depth, Height</li>
                <li>• Freight Class</li>
                <li>• Ship From Zip</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-1">Output CSV columns updated:</p>
              <ul className="text-gray-500 space-y-0.5">
                <li>• Weight (rounded up)</li>
                <li>• Length, Width, Height</li>
                <li>• Freight Class</li>
                <li>• Dropship Zipcode</li>
                <li>• Quote Method (S/L)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* File Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">File Selection</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Vendor CSV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendor CSV File (Source)</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${vendorFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => vendorInputRef.current?.click()}
            >
              <input
                ref={vendorInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setVendorFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {vendorFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{vendorFile.name}</span>
                  <span className="text-xs text-green-500">({(vendorFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Click to select vendor CSV</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">e.g., Cleveland Range-109.csv with weight/dimension data</p>
          </div>

          {/* Output CSV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output CSV File (To Update)</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${outputFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => outputInputRef.current?.click()}
            >
              <input
                ref={outputInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setOutputFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {outputFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{outputFile.name}</span>
                  <span className="text-xs text-green-500">({(outputFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Click to select output CSV</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">CSV with Variant SKU column to match and update</p>
          </div>
        </div>
      </div>

      {/* Logic Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Quote Method Logic:</strong> Weight &lt; 85 lbs = "S" (Small), Weight ≥ 85 lbs = "L" (LTL). 
          If Quote Method is "L" and Freight Class is empty, defaults to 175.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStart}
          disabled={!vendorFile || !outputFile || isProcessing}
          className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors
            ${!vendorFile || !outputFile || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Play className="w-4 h-4 mr-2" />
          Update Weights
        </button>
      </div>
    </div>
  );
};
