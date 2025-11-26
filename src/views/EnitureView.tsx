import React, { useState, useRef } from 'react';
import { Upload, Play, FileText, FileSpreadsheet, Truck } from 'lucide-react';
import { AppStatus } from '../types';

interface EnitureViewProps {
  status: AppStatus;
  onStart: (files: { lookup_file: File; weight_file: File }) => void;
}

export const EnitureView: React.FC<EnitureViewProps> = ({ status, onStart }) => {
  const [lookupFile, setLookupFile] = useState<File | null>(null);
  const [weightFile, setWeightFile] = useState<File | null>(null);
  
  const lookupInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (!lookupFile || !weightFile) return;
    onStart({ lookup_file: lookupFile, weight_file: weightFile });
  };

  const isProcessing = status === AppStatus.PROCESSING;

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            Eniture API Sync
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">
            Syncs weight and dimension data to the Eniture shipping API for accurate freight quotes.
            Uses ProductID to find Shopify products, then pushes weight/dimension data to Eniture.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-1">Lookup File columns:</p>
              <ul className="text-gray-500 space-y-0.5">
                <li>• <strong>ProductID</strong> - Variant SKU for Shopify lookup</li>
                <li>• <strong>ManufacturerSKU</strong> - Matches to weight file</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-700 mb-1">Weight CSV columns:</p>
              <ul className="text-gray-500 space-y-0.5">
                <li>• Mfr Model</li>
                <li>• Shipping Weight</li>
                <li>• Width, Depth, Height</li>
                <li>• Freight Class</li>
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
          {/* Lookup File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lookup File (ProductID + ManufacturerSKU)
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${lookupFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => lookupInputRef.current?.click()}
            >
              <input
                ref={lookupInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setLookupFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {lookupFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{lookupFile.name}</span>
                  <span className="text-xs text-green-500">({(lookupFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Click to select lookup file (Excel or CSV)</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Must have ProductID and ManufacturerSKU columns</p>
          </div>

          {/* Weight CSV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight CSV File</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${weightFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => weightInputRef.current?.click()}
            >
              <input
                ref={weightInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setWeightFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {weightFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700">{weightFile.name}</span>
                  <span className="text-xs text-green-500">({(weightFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-gray-500">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Click to select weight CSV</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">CSV with Mfr Model and weight/dimension columns</p>
          </div>
        </div>
      </div>

      {/* API Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Eniture API:</strong> Pushes to the configured Eniture endpoint with Shopify product/variant IDs.
          Quote Method is calculated automatically (S for &lt;85 lbs, L for ≥85 lbs).
          Valid freight classes: 50, 55, 60, 65, 70, 77.5, 85, 92.5, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500.
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStart}
          disabled={!lookupFile || !weightFile || isProcessing}
          className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors
            ${!lookupFile || !weightFile || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Play className="w-4 h-4 mr-2" />
          Sync to Eniture
        </button>
      </div>
    </div>
  );
};
