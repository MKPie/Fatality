import React, { useState, useRef } from 'react';
import { Tags, Upload, X, Info } from 'lucide-react';
import { AppStatus, TagConfig } from '../types';

interface TagsViewProps {
  status: AppStatus;
  onStart: (files: { master: File; vendor: File }, config: TagConfig) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({ status, onStart }) => {
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [vendorFile, setVendorFile] = useState<File | null>(null);
  const [pushToShopify, setPushToShopify] = useState(false);

  const masterInputRef = useRef<HTMLInputElement>(null);
  const vendorInputRef = useRef<HTMLInputElement>(null);
  const isProcessing = status === AppStatus.PROCESSING;

  const handleStart = () => {
    if (!masterFile || !vendorFile) {
      alert('Please select both Master and Vendor files');
      return;
    }
    onStart({ master: masterFile, vendor: vendorFile }, { pushToShopify });
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
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isProcessing ? 'text-gray-400' : 'text-blue-500'}`} />
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
          <Tags className="w-7 h-7 mr-3 text-green-600" />
          Product Tag Management
        </h2>
        <p className="text-gray-600">
          Update Shopify product tags based on master and vendor product data
        </p>
      </div>

      {/* File Uploads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Master Product File"
            file={masterFile}
            setFile={setMasterFile}
            inputRef={masterInputRef}
            accept=".xlsx,.xls,.csv"
          />
          <FileUpload
            label="Vendor Product File"
            file={vendorFile}
            setFile={setVendorFile}
            inputRef={vendorInputRef}
            accept=".xlsx,.xls,.csv"
          />
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Master File:</strong> Contains your complete product catalog with SKUs and current tags<br />
            <strong>Vendor File:</strong> Contains vendor product data to match and update tags
          </p>
        </div>
      </div>

      {/* Shopify Integration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopify Integration</h3>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Push Tags to Shopify</label>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                Enable to automatically update tags via Shopify API after processing
              </div>
            </div>
          </div>
          <button
            onClick={() => !isProcessing && setPushToShopify(!pushToShopify)}
            disabled={isProcessing}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              pushToShopify ? 'bg-green-600' : 'bg-gray-300'
            } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                pushToShopify ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {pushToShopify && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Tags will be pushed to Shopify API after processing
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={!masterFile || !vendorFile || isProcessing}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            !masterFile || !vendorFile || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isProcessing ? 'Processing Tags...' : 'Start Tag Update'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-2">How It Works</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Matches products between Master and Vendor files by SKU/Model</li>
          <li>• Updates product tags based on vendor data and mapping rules</li>
          <li>• Optionally pushes updated tags to Shopify via API</li>
          <li>• Generates report showing all tag changes and API results</li>
        </ul>
      </div>
    </div>
  );
};
