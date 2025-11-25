import React, { useEffect, useRef } from 'react';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { LogEntry } from './types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0" />;
      default:
        return <Activity className="w-3 h-3 text-blue-400 flex-shrink-0" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 scrollbar-thin">
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Logs will appear here during processing</p>
          </div>
        </div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-2 py-1 hover:bg-slate-800/50 px-2 rounded">
            {getLogIcon(log.type)}
            <span className="text-gray-500 text-[10px] w-16 flex-shrink-0">{log.timestamp}</span>
            <span className={`flex-1 ${getLogColor(log.type)} break-words`}>{log.message}</span>
          </div>
        ))
      )}
      <div ref={logEndRef} />
    </div>
  );
};
