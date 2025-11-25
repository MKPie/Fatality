import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return '✗';
      case 'success': return '✓';
      case 'warning': return '⚠';
      default: return '•';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-700">
        <Terminal className="w-4 h-4 text-gray-400" />
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Console Output</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            Waiting for process to start...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 hover:bg-slate-800 px-2 py-1 rounded">
              <span className="text-gray-500 text-[10px] mt-0.5 flex-shrink-0 w-16">
                {log.timestamp}
              </span>
              <span className={`${getLogColor(log.type)} flex-shrink-0 mt-0.5`}>
                {getLogIcon(log.type)}
              </span>
              <span className="text-gray-300 flex-1 break-words">
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
