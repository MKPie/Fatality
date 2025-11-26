import React, { useState, useRef } from 'react';
import { Upload, Play, FileSpreadsheet, FileText, Send } from 'lucide-react';
import { AppStatus } from '../types';

interface TagsViewProps {
  status: AppStatus;
  onStart: (files: { excel_file?: File; csv_file?: File; vendor_file?: File }, config: { mode: string; output_name?: string }) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({ status, onStart }) => {
  const [mode, setMode] = useState<'csv' | 'push'>('csv');
  
  // CSV Mode files
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState('tags_output.csv');
  
  // Push Mode file
  const [vendorFile, setVendorFile] = useState<File | null>(null);
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const vendorInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (mode === 'csv') {
      if (!excelFile || !csvFile) return;
      onStart(
        { excel_file: excelFile, csv_file: csvFile },
        { mode: 'process', output_name: outputName }
      );
    } else {
      if (!vendorFile) return;
      onStart(
        { vendor_file: vendorFile },
        { mode: 'push' }
      );
    }
  };

  const isProcessing = status === AppStatus.PROCESSING;
  const canStart = mode === 'csv' ? (excelFile && csvFile) : vendorFile;

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tag Update Mode</h3>
        </div>
        <div className="p-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('csv')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                mode === 'csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${mode === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${mode === 'csv' ? 'text-blue-900' : 'text-gray-700'}`}>
                Update Tags (CSV Output)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Match Excel to Shopify CSV, output new CSV
              </p>
            </button>
            <button
              onClick={() => setMode('push')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                mode === 'push' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Send className={`w-8 h-8 mx-auto mb-2 ${mode === 'push' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${mode === 'push' ? 'text-blue-900' : 'text-gray-700'}`}>
                Push to Shopify API
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Direct API push from vendor file
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* CSV Mode */}
      {mode === 'csv' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">File Selection (CSV Mode)</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Excel File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Excel File</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                  ${excelFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => excelInputRef.current?.click()}
              >
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {excelFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">{excelFile.name}</span>
                    <span className="text-xs text-green-500">({(excelFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Click to select Excel file</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Contains Mfr Model and tag columns (L-CS)</p>
            </div>

            {/* CSV File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shopify CSV File</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                  ${csvFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => csvInputRef.current?.click()}
              >
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {csvFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">{csvFile.name}</span>
                    <span className="text-xs text-green-500">({(csvFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Click to select Shopify CSV</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Shopify export with Variant SKU and Tags columns</p>
            </div>

            {/* Output Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output File Name</label>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="tags_output.csv"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Push Mode */}
      {mode === 'push' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">File Selection (Push Mode)</h3>
          </div>
          <div className="p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor File (Excel or CSV)</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${vendorFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => vendorInputRef.current?.click()}
              >
                <input
                  ref={vendorInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setVendorFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {vendorFile ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-green-600" />
                    <p className="text-sm text-green-700">{vendorFile.name}</p>
                    <p className="text-xs text-green-500">({(vendorFile.size / 1024).toFixed(1)} KB)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">Click to select vendor file</p>
                    <p className="text-xs text-gray-400">Excel or CSV with Mfr Model, Model Variant, and tag columns</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tags are built from columns H onwards. SKU = Mfr Model + Model Variant (unless "Original").
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>How it works:</strong>
          {mode === 'csv' ? (
            <> Matches Variant SKU in Shopify CSV to Mfr Model in Excel. Tags are built from columns L-CS as "Header: Value" pairs.</>
          ) : (
            <> Builds SKU from Mfr Model + Model Variant, searches Shopify by SKU, and pushes tags directly via GraphQL API.</>
          )}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStart}
          disabled={!canStart || isProcessing}
          className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors
            ${!canStart || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Play className="w-4 h-4 mr-2" />
          {mode === 'csv' ? 'Process Tags' : 'Push to Shopify'}
        </button>
      </div>
    </div>
  );
};
