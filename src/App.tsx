import React, { useState, useEffect } from 'react';
import { Database, Tags, Scale, Settings, Activity, Box, LayoutDashboard } from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { ScrapingView } from './views/ScrapingView';
import { TagsView } from './views/TagsView';
import { WeightsView } from './views/WeightsView';
import { EnitureView } from './views/EnitureView';
import { SettingsView } from './views/SettingsView';
import { LogViewer } from './components/LogViewer';
import { AppStatus, TabId, LogEntry } from './types';
import { API_ENDPOINTS, apiPost, apiGet, connectLogStream } from './api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Connect to log stream on mount
  useEffect(() => {
    const es = connectLogStream(
      (log) => {
        const entry: LogEntry = {
          id: log.id?.toString() || Math.random().toString(36).substr(2, 9),
          timestamp: log.timestamp || new Date().toLocaleTimeString(),
          message: log.message,
          type: log.level === 'error' ? 'error' : 
                log.level === 'warning' ? 'warning' : 
                log.level === 'success' ? 'success' : 'info'
        };
        setLogs(prev => [...prev.slice(-99), entry]); // Keep last 100 logs
      },
      (error) => {
        console.error('Log stream error:', error);
      }
    );
    setEventSource(es);

    // Poll status periodically
    const statusInterval = setInterval(async () => {
      try {
        const statusData = await apiGet<{is_processing: boolean, progress: number, current_task: string}>(API_ENDPOINTS.status);
        if (statusData.is_processing) {
          setStatus(AppStatus.PROCESSING);
          setProgress(statusData.progress);
        } else if (status === AppStatus.PROCESSING) {
          setStatus(AppStatus.COMPLETED);
          setProgress(100);
        }
      } catch (e) {
        // Silently fail status checks
      }
    }, 2000);

    return () => {
      es.close();
      clearInterval(statusInterval);
    };
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, entry]);
  };

  // Unified processing handler - NOW WITH REAL API CALLS
  const handleProcess = async (taskName: string, payload: any, endpoint?: string) => {
    if (status === AppStatus.PROCESSING) return;
    
    setStatus(AppStatus.PROCESSING);
    setProgress(0);
    setLogs([]); 
    addLog(`Initializing ${taskName}...`, 'info');

    if (endpoint) {
      try {
        const formData = new FormData();
        
        // Append files and data from payload
        Object.keys(payload).forEach(key => {
          if (payload[key] instanceof File) {
            formData.append(key, payload[key]);
            addLog(`Attached file: ${payload[key].name} (${(payload[key].size/1024).toFixed(1)} KB)`, 'info');
          } else if (typeof payload[key] === 'object' && payload[key] !== null) {
            formData.append(key, JSON.stringify(payload[key]));
          } else if (payload[key] !== undefined && payload[key] !== null) {
            formData.append(key, String(payload[key]));
          }
        });
        
        addLog(`[API] Sending request to backend...`, 'info');
        
        // Determine full endpoint URL
        let fullEndpoint = endpoint;
        if (!endpoint.startsWith('http')) {
          // Map short endpoints to full URLs
          const endpointMap: Record<string, string> = {
            '/api/scrape': API_ENDPOINTS.scrapeFile,
            '/api/tags': API_ENDPOINTS.tagsProcess,
            '/api/tags/push': API_ENDPOINTS.tagsPush,
            '/api/weights': API_ENDPOINTS.weightsProcess,
            '/api/eniture': API_ENDPOINTS.enitureSync,
          };
          fullEndpoint = endpointMap[endpoint] || `${API_ENDPOINTS.status.replace('/api/status', '')}${endpoint}`;
        }
        
        const response = await fetch(fullEndpoint, {
          method: 'POST', 
          body: formData,
          credentials: 'include'
        })
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        addLog(`[API] Request accepted: ${JSON.stringify(result)}`, 'success');
        
        // Backend runs task in background, status polling will update progress
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`[API] Error: ${errorMessage}`, 'error');
        setStatus(AppStatus.ERROR);
        return;
      }
    }
  };

  const stopProcessing = async () => {
    if (status !== AppStatus.PROCESSING) return;
    
    try {
      await apiPost(API_ENDPOINTS.stop);
      addLog('Stop request sent to server.', 'warning');
    } catch (e) {
      addLog('Failed to send stop request.', 'error');
    }
    
    setStatus(AppStatus.IDLE);
    addLog('Process stopped by user.', 'error');
    setProgress(0);
  };

  const NavItem = ({ id, icon, label }: { id: TabId, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1
        ${activeTab === id 
          ? 'bg-blue-50 text-blue-700 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <span className={`${activeTab === id ? 'text-blue-600' : 'text-gray-400'} mr-3`}>
        {icon}
      </span>
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'scraping': 
        return <ScrapingView 
          status={status} 
          onStart={(file, config) => handleProcess('Web Scraper', { file, ...config }, '/api/scrape')} 
          onStop={stopProcessing} 
        />;
      case 'tags': 
        return <TagsView 
          status={status} 
          onStart={(files, config) => handleProcess('Tag Processor', { ...files, ...config }, '/api/tags')} 
        />;
      case 'weights': 
        return <WeightsView 
          status={status} 
          onStart={(files) => handleProcess('Weight Sync', files, '/api/weights')} 
        />;
      case 'eniture': 
        return <EnitureView 
          status={status} 
          onStart={(files) => handleProcess('Eniture Sync', files, '/api/eniture')} 
        />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  // Right panel (Logs) is hidden on Dashboard and Settings to give more space
  const showRightPanel = ['scraping', 'tags', 'weights', 'eniture'].includes(activeTab);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">VendorFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem id="dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          
          <div className="mt-8 px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Automation</div>
          <NavItem id="scraping" icon={<Database className="w-5 h-5" />} label="Scraping" />
          <NavItem id="tags" icon={<Tags className="w-5 h-5" />} label="Tag Updates" />
          <NavItem id="weights" icon={<Scale className="w-5 h-5" />} label="Weight Sync" />
          <NavItem id="eniture" icon={<Activity className="w-5 h-5" />} label="Eniture API" />
          
          <div className="mt-8 px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</div>
          <NavItem id="settings" icon={<Settings className="w-5 h-5" />} label="Configuration" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              MK
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">
                {status === AppStatus.PROCESSING ? '● Processing' : '● Online'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'dashboard' && 'System Dashboard'}
            {activeTab === 'scraping' && 'Scraping Automation'}
            {activeTab === 'tags' && 'Product Tagging'}
            {activeTab === 'weights' && 'Dimension Management'}
            {activeTab === 'eniture' && 'Eniture Sync'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-300
                 ${status === AppStatus.PROCESSING ? 'bg-blue-100 text-blue-800' : 
                   status === AppStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                   status === AppStatus.ERROR ? 'bg-red-100 text-red-800' :
                   'bg-gray-100 text-gray-800'}`}>
                 {status === AppStatus.PROCESSING ? '● Processing' : 
                  status === AppStatus.ERROR ? '● Error' : status}
               </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Views */}
          <div className={`flex-1 overflow-y-auto p-8 ${showRightPanel ? '' : 'max-w-7xl mx-auto w-full'}`}>
             {renderContent()}
          </div>

          {/* Right Panel: Logs & Status - Only visible on processing tabs */}
          {showRightPanel && (
            <div className="w-96 border-l border-gray-200 bg-white flex flex-col shadow-xl z-10 transition-all duration-300">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Activity Monitor</h3>
                
                <div className="mb-2 flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      status === AppStatus.ERROR ? 'bg-red-500' : 
                      status === AppStatus.COMPLETED ? 'bg-green-500' : 'bg-blue-600'
                    }`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-slate-900 overflow-hidden flex flex-col">
                 <LogViewer logs={logs} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
