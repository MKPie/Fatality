import React, { useState } from 'react';
import { Settings, Save, Key, Chrome, Globe, Info, Eye, EyeOff } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [showShopifyKey, setShowShopifyKey] = useState(false);
  const [showEnitureToken, setShowEnitureToken] = useState(false);
  const [headlessMode, setHeadlessMode] = useState(true);
  const [autoRetry, setAutoRetry] = useState(true);

  const [settings, setSettings] = useState({
    // Shopify Settings
    shopifyStoreName: 'your-store',
    shopifyApiKey: '',
    shopifyAccessToken: '',
    
    // Eniture Settings
    enitureApiUrl: 'https://api.eniture.com',
    enitureApiToken: '',
    enitureTimeout: '30',
    
    // ChromeDriver Settings
    chromedriverPath: '/usr/bin/chromedriver',
    headless: true,
    maxRetries: '3',
    pageTimeout: '30'
  });

  const handleSave = () => {
    // In real app, this would save to backend
    alert('Settings saved successfully!');
  };

  const ConfigSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const ConfigRow = ({ 
    label, 
    value, 
    onChange, 
    type = 'text',
    placeholder = '',
    tooltip = '',
    showPassword = false,
    togglePassword = () => {}
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    tooltip?: string;
    showPassword?: boolean;
    togglePassword?: () => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-2 flex-1">
        <label className="text-sm font-medium text-gray-700 w-48">{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 flex-1">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder={placeholder}
        />
        {type === 'password' && (
          <button
            onClick={togglePassword}
            className="p-2 hover:bg-gray-100 rounded"
            type="button"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const ToggleRow = ({ 
    label, 
    value, 
    onChange, 
    tooltip = '' 
  }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    tooltip?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="w-7 h-7 mr-3 text-gray-600" />
          System Configuration
        </h2>
        <p className="text-gray-600">
          Manage API credentials, automation settings, and system preferences
        </p>
      </div>

      {/* Shopify Settings */}
      <ConfigSection title="Shopify API Configuration">
        <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
          <Globe className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-800">
            Configure your Shopify store connection for tag updates
          </span>
        </div>
        <div className="space-y-0">
          <ConfigRow
            label="Store Name"
            value={settings.shopifyStoreName}
            onChange={(value) => setSettings({ ...settings, shopifyStoreName: value })}
            placeholder="your-store"
            tooltip="Your Shopify store name (e.g., 'my-store' from my-store.myshopify.com)"
          />
          <ConfigRow
            label="API Key"
            value={settings.shopifyApiKey}
            onChange={(value) => setSettings({ ...settings, shopifyApiKey: value })}
            type="password"
            placeholder="Enter API Key"
            tooltip="Shopify API Key from your private app"
            showPassword={showShopifyKey}
            togglePassword={() => setShowShopifyKey(!showShopifyKey)}
          />
          <ConfigRow
            label="Access Token"
            value={settings.shopifyAccessToken}
            onChange={(value) => setSettings({ ...settings, shopifyAccessToken: value })}
            type="password"
            placeholder="Enter Access Token"
            tooltip="Shopify Admin API access token"
            showPassword={showShopifyKey}
            togglePassword={() => setShowShopifyKey(!showShopifyKey)}
          />
        </div>
      </ConfigSection>

      {/* Eniture API Settings */}
      <ConfigSection title="Eniture API Configuration">
        <div className="flex items-center space-x-2 mb-4 p-3 bg-orange-50 rounded-lg">
          <Key className="w-5 h-5 text-orange-600" />
          <span className="text-sm text-orange-800">
            Configure Eniture freight shipping API connection
          </span>
        </div>
        <div className="space-y-0">
          <ConfigRow
            label="API URL"
            value={settings.enitureApiUrl}
            onChange={(value) => setSettings({ ...settings, enitureApiUrl: value })}
            placeholder="https://api.eniture.com"
            tooltip="Eniture API endpoint URL"
          />
          <ConfigRow
            label="API Token"
            value={settings.enitureApiToken}
            onChange={(value) => setSettings({ ...settings, enitureApiToken: value })}
            type="password"
            placeholder="Enter API Token"
            tooltip="Your Eniture API authentication token"
            showPassword={showEnitureToken}
            togglePassword={() => setShowEnitureToken(!showEnitureToken)}
          />
          <ConfigRow
            label="Timeout (seconds)"
            value={settings.enitureTimeout}
            onChange={(value) => setSettings({ ...settings, enitureTimeout: value })}
            type="number"
            placeholder="30"
            tooltip="API request timeout in seconds"
          />
        </div>
      </ConfigSection>

      {/* ChromeDriver Settings */}
      <ConfigSection title="Web Scraping Configuration">
        <div className="flex items-center space-x-2 mb-4 p-3 bg-purple-50 rounded-lg">
          <Chrome className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-purple-800">
            Configure Selenium ChromeDriver for web scraping
          </span>
        </div>
        <div className="space-y-0">
          <ConfigRow
            label="ChromeDriver Path"
            value={settings.chromedriverPath}
            onChange={(value) => setSettings({ ...settings, chromedriverPath: value })}
            placeholder="/usr/bin/chromedriver"
            tooltip="Full path to ChromeDriver executable"
          />
          <ConfigRow
            label="Page Timeout (seconds)"
            value={settings.pageTimeout}
            onChange={(value) => setSettings({ ...settings, pageTimeout: value })}
            type="number"
            placeholder="30"
            tooltip="Maximum time to wait for pages to load"
          />
          <ConfigRow
            label="Max Retries"
            value={settings.maxRetries}
            onChange={(value) => setSettings({ ...settings, maxRetries: value })}
            type="number"
            placeholder="3"
            tooltip="Number of retry attempts for failed operations"
          />
          <ToggleRow
            label="Headless Mode"
            value={headlessMode}
            onChange={setHeadlessMode}
            tooltip="Run browser in background without visible window"
          />
          <ToggleRow
            label="Auto Retry on Failure"
            value={autoRetry}
            onChange={setAutoRetry}
            tooltip="Automatically retry failed scraping operations"
          />
        </div>
      </ConfigSection>

      {/* System Information */}
      <ConfigSection title="System Information">
        <div className="space-y-3">
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-600">Backend Version:</span>
            <span className="font-medium text-gray-900">v1.0.0</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-600">Frontend Version:</span>
            <span className="font-medium text-gray-900">v1.0.0</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-600">Python Version:</span>
            <span className="font-medium text-gray-900">3.11+</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium text-gray-900">2024-11-24</span>
          </div>
        </div>
      </ConfigSection>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Security Notice
        </h4>
        <p className="text-sm text-yellow-800">
          API keys and tokens are stored securely on the backend. Never share these credentials or commit them to version control.
        </p>
      </div>
    </div>
  );
};
