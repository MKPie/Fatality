cat > App.tsx << 'EOF'
import React, { useState } from 'react';
import { Database, Tags, Scale, Settings, Activity, Box, LayoutDashboard } from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { ScrapingView } from './views/ScrapingView';
import { TagsView } from './views/TagsView';
import { WeightsView } from './views/WeightsView';
import { EnitureView } from './views/EnitureView';
import { SettingsView } from './views/SettingsView';

enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

type TabId = 'dashboard' | 'scraping' | 'tags' | 'weights' | 'eniture' | 'settings';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, entry]);
  };

  const handleProcess = async (taskName: string, payload: any, endpoint?: string) => {
    if (status === AppStatus.PROCESSING) return;
    
    setStatus(AppStatus.PROCESSING);
    setProgress(0);
    setLogs([]); 
    addLog(`Initializing ${taskName}...`, 'info');

    if (endpoint) {
      const formData = new FormData();
      
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value instanceof File) {
          formData.append(key, value);
          addLog(`Attached file: ${value.name} (${(value.size/1024).toFixed(1)} KB)`, 'info');
        } else if (typeof value === 'object' && value !== null) {
          if (key === 'config') {
             Object.keys(value).forEach(confKey => {
                formData.append(confKey, value[confKey]);
             });
          } else {
             formData.append(key, JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        addLog(`[API] Sending request to ${apiUrl}${endpoint}...`, 'info');
        
        const response = await fetch(`${apiUrl}${endpoint}`, { 
          method: 'POST', 
          body: formData 
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.log) addLog(data.log, data.type || 'info');
              if (data.progress) setProgress(data.progress);
              if (data.status === 'complete') {
                setStatus(AppStatus.COMPLETED);
                addLog('Process finished successfully.', 'success');
              }
              if (data.status === 'error') {
                setStatus(AppStatus.ERROR);
                addLog(data.message || 'Unknown error occurred', 'error');
              }
            } catch (e) {
              addLog(line, 'info');
            }
          }
        }
      } catch (error: any) {
        console.error(error);
        addLog(`Error: ${error.message}`, 'error');
        setStatus(AppStatus.ERROR);
      }
    } else {
      setTimeout(() => {
         setStatus(AppStatus.COMPLETED);
         setProgress(100);
         addLog('Simulation complete', 'success');
      }, 2000);
    }
  };

  const stopProcessing = () => {
    if (status !== AppStatus.PROCESSING) return;
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
          onStart={(file: any, config: any) => handleProcess('Web Scraper', { file, config }, '/api/scrape')} 
          onStop={stopProcessing} 
        />;
      case 'tags': 
        return <TagsView 
          status={status} 
          onStart={(files: any, config: any) => handleProcess('Tag Processor', { ...files, ...config }, '/api/tags')} 
        />;
      case 'weights': 
        return <WeightsView 
          status={status} 
          onStart={(files: any) => handleProcess('Weight Sync', { source: files.source, target: files.target }, '/api/weights')} 
        />;
      case 'eniture': 
        return <EnitureView 
          status={status} 
          onStart={(files: any) => handleProcess('Eniture Sync', { lookup: files.lookup, weight: files.weight }, '/api/eniture')} 
        />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const showRightPanel = ['scraping', 'tags', 'weights', 'eniture'].includes(activeTab);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                 {status === AppStatus.PROCESSING ? '● Processing' : status}
               </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 overflow-y-auto p-8 ${showRightPanel ? '' : 'max-w-7xl mx-auto w-full'}`}>
             {renderContent()}
          </div>

          {showRightPanel && (
            <div className="w-96 border-l border-gray-200 bg-white flex flex-col shadow-xl z-10">
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
              
              <div className="flex-1 p-4 bg-slate-900 overflow-y-auto">
                <div className="space-y-1 font-mono text-xs">
                  {logs.map(log => (
                    <div key={log.id} className={`${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
EOF
