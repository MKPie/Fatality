import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS, apiGet, apiPost } from '../api';

interface ConfigData {
  paths: {
    process_folder: string;
    final_folder: string;
  };
  sellercloud: {
    api_url: string;
    rest_endpoint: string;
    username: string;
    password: string;
    rate_limit_per_hour: number;
    delay_between_uploads: number;
  };
  shopify: {
    channel_name: string;
    store_url: string;
    api_token: string;
  };
  eniture: {
    api_key: string;
    api_url: string;
  };
  automation: {
    auto_scrape: boolean;
    auto_process: boolean;
    auto_upload: boolean;
    auto_publish: boolean;
    update_existing_files: boolean;
  };
  scraping: {
    variation_mode: string;
    model_column: string;
    prefix: string;
    start_row: number;
    end_row: number;
    save_interval: number;
  };
}

const DEFAULT_CONFIG: ConfigData = {
  paths: {
    process_folder: '/home/mkpie/vendor_data/process',
    final_folder: '/home/mkpie/vendor_data/final',
  },
  sellercloud: {
    api_url: 'https://an.api.sellercloud.com',
    rest_endpoint: 'https://an.api.sellercloud.com/rest',
    username: '',
    password: '',
    rate_limit_per_hour: 10800,
    delay_between_uploads: 120,
  },
  shopify: {
    channel_name: 'Shopify',
    store_url: '',
    api_token: '',
  },
  eniture: {
    api_key: '',
    api_url: 'https://s-web-api.eniture.com',
  },
  automation: {
    auto_scrape: true,
    auto_process: false,
    auto_upload: false,
    auto_publish: false,
    update_existing_files: true,
  },
  scraping: {
    variation_mode: 'None',
    model_column: 'Mfr Model',
    prefix: '',
    start_row: 1,
    end_row: 1000,
    save_interval: 5,
  },
};

export const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<ConfigData>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await apiGet<ConfigData>(API_ENDPOINTS.config);
      setConfig({ ...DEFAULT_CONFIG, ...data });
    } catch (err) {
      console.error('Failed to load config:', err);
      setMessage({ type: 'error', text: 'Failed to load configuration from server' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiPost(API_ENDPOINTS.config, { config });
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save config:', err);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof ConfigData, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const togglePassword = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Message Banner */}
      {message && (
        <div className={`flex items-center p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Paths Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
            <FolderOpen className="w-4 h-4 mr-2" />
            File Paths
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Process Folder</label>
            <input
              type="text"
              value={config.paths.process_folder}
              onChange={(e) => updateConfig('paths', 'process_folder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="/home/mkpie/vendor_data/process"
            />
            <p className="mt-1 text-xs text-gray-500">Location for CSV files to process</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Output Folder</label>
            <input
              type="text"
              value={config.paths.final_folder}
              onChange={(e) => updateConfig('paths', 'final_folder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="/home/mkpie/vendor_data/final"
            />
            <p className="mt-1 text-xs text-gray-500">Location where completed files are saved</p>
          </div>
        </div>
      </div>

      {/* Shopify Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Shopify Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
            <input
              type="text"
              value={config.shopify.store_url}
              onChange={(e) => updateConfig('shopify', 'store_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="your-store.myshopify.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
            <div className="relative">
              <input
                type={showPasswords['shopify_token'] ? 'text' : 'password'}
                value={config.shopify.api_token}
                onChange={(e) => updateConfig('shopify', 'api_token', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="shpat_xxxxx"
              />
              <button
                type="button"
                onClick={() => togglePassword('shopify_token')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords['shopify_token'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
            <input
              type="text"
              value={config.shopify.channel_name}
              onChange={(e) => updateConfig('shopify', 'channel_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Shopify"
            />
          </div>
        </div>
      </div>

      {/* Eniture Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Eniture Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
            <input
              type="text"
              value={config.eniture.api_url}
              onChange={(e) => updateConfig('eniture', 'api_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://s-web-api.eniture.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showPasswords['eniture_key'] ? 'text' : 'password'}
                value={config.eniture.api_key}
                onChange={(e) => updateConfig('eniture', 'api_key', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your Eniture API key"
              />
              <button
                type="button"
                onClick={() => togglePassword('eniture_key')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords['eniture_key'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SellerCloud Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">SellerCloud Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                value={config.sellercloud.api_url}
                onChange={(e) => updateConfig('sellercloud', 'api_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">REST Endpoint</label>
              <input
                type="text"
                value={config.sellercloud.rest_endpoint}
                onChange={(e) => updateConfig('sellercloud', 'rest_endpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={config.sellercloud.username}
                onChange={(e) => updateConfig('sellercloud', 'username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPasswords['sc_password'] ? 'text' : 'password'}
                  value={config.sellercloud.password}
                  onChange={(e) => updateConfig('sellercloud', 'password', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => togglePassword('sc_password')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords['sc_password'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (per hour)</label>
              <input
                type="number"
                value={config.sellercloud.rate_limit_per_hour}
                onChange={(e) => updateConfig('sellercloud', 'rate_limit_per_hour', parseInt(e.target.value) || 10800)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Uploads (sec)</label>
              <input
                type="number"
                value={config.sellercloud.delay_between_uploads}
                onChange={(e) => updateConfig('sellercloud', 'delay_between_uploads', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Automation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Automation Settings</h3>
        </div>
        <div className="p-6 space-y-3">
          {[
            { key: 'auto_scrape', label: 'Auto Scrape', desc: 'Automatically start scraping when files are added' },
            { key: 'auto_process', label: 'Auto Process', desc: 'Automatically process scraped data' },
            { key: 'auto_upload', label: 'Auto Upload', desc: 'Automatically upload to SellerCloud' },
            { key: 'auto_publish', label: 'Auto Publish', desc: 'Automatically publish to Shopify' },
            { key: 'update_existing_files', label: 'Update Existing Files', desc: 'Update files that already exist' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={config.automation[key as keyof typeof config.automation]}
                onChange={(e) => updateConfig('automation', key, e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Default Scraping Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Default Scraping Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Column</label>
              <input
                type="text"
                value={config.scraping.model_column}
                onChange={(e) => updateConfig('scraping', 'model_column', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Prefix</label>
              <input
                type="text"
                value={config.scraping.prefix}
                onChange={(e) => updateConfig('scraping', 'prefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Save Interval</label>
              <input
                type="number"
                value={config.scraping.save_interval}
                onChange={(e) => updateConfig('scraping', 'save_interval', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Variation Mode</label>
            <select
              value={config.scraping.variation_mode}
              onChange={(e) => updateConfig('scraping', 'variation_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="None">None</option>
              <option value="Auto">Auto</option>
              <option value="Gas Type">Gas Type</option>
              <option value="Electric">Electric</option>
              <option value="Low Voltage">Low Voltage</option>
              <option value="Check All">Check All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={saving}
          className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors
            ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};
