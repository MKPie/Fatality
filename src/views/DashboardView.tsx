import React, { useState, useEffect } from 'react';
import { Activity, Database, Tags, Scale, Truck, CheckCircle, AlertCircle, Clock, Server } from 'lucide-react';
import { API_ENDPOINTS, apiGet } from '../api';

interface StatusInfo {
  is_processing: boolean;
  current_task: string;
  progress: number;
  total: number;
}

export const DashboardView: React.FC = () => {
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiConnection();
    const interval = setInterval(checkApiConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkApiConnection = async () => {
    try {
      const data = await apiGet<StatusInfo>(API_ENDPOINTS.status);
      setStatus(data);
      setApiConnected(true);
    } catch (err) {
      setApiConnected(false);
      setStatus(null);
    }
  };

  const features = [
    {
      icon: Database,
      title: 'Web Scraping',
      description: 'Scrape product data from Katom.com with automatic variation detection',
      color: 'blue',
    },
    {
      icon: Tags,
      title: 'Tag Updates',
      description: 'Update Shopify product tags from vendor Excel files',
      color: 'purple',
    },
    {
      icon: Scale,
      title: 'Weight Sync',
      description: 'Sync weight and dimensions from vendor CSVs',
      color: 'green',
    },
    {
      icon: Truck,
      title: 'Eniture API',
      description: 'Push shipping data to Eniture for freight quotes',
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
  };

  return (
    <div className="space-y-6">
      {/* API Status Banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${
        apiConnected === null ? 'bg-gray-100' :
        apiConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          <Server className={`w-5 h-5 ${
            apiConnected === null ? 'text-gray-400' :
            apiConnected ? 'text-green-600' : 'text-red-600'
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              apiConnected === null ? 'text-gray-600' :
              apiConnected ? 'text-green-800' : 'text-red-800'
            }`}>
              {apiConnected === null ? 'Checking backend connection...' :
               apiConnected ? 'Backend Connected' : 'Backend Disconnected'}
            </p>
            {apiConnected && status && (
              <p className="text-xs text-green-600">
                {status.is_processing 
                  ? `Processing: ${status.current_task} (${status.progress}%)`
                  : 'Ready for tasks'}
              </p>
            )}
            {apiConnected === false && (
              <p className="text-xs text-red-600">
                Make sure the backend is running and tunnel is active
              </p>
            )}
          </div>
        </div>
        {apiConnected !== null && (
          apiConnected ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )
        )}
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to VendorFlow</h2>
        <p className="text-blue-100 text-sm">
          Automate your vendor product management with web scraping, Shopify integration, 
          and shipping API synchronization.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const colors = colorClasses[feature.color];
          return (
            <div key={feature.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${colors.text}`}>{feature.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            System Status
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className={`text-3xl font-bold ${apiConnected ? 'text-green-600' : 'text-gray-400'}`}>
                {apiConnected ? '●' : '○'}
              </div>
              <p className="text-sm text-gray-500 mt-1">API Status</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {status?.is_processing ? status.progress : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Current Progress</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700">
                <Clock className="w-8 h-8 mx-auto text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {status?.is_processing ? status.current_task : 'Idle'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
            <span>Configure your API credentials in <strong>Settings</strong></span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
            <span>Upload a vendor CSV and start <strong>Scraping</strong></span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
            <span>Update <strong>Tags</strong> and <strong>Weights</strong> from your data</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
            <span>Sync shipping data to <strong>Eniture API</strong></span>
          </li>
        </ol>
      </div>
    </div>
  );
};
