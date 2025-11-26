import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-slate-300';
    }
  };

  const getLogPrefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return '[ERROR]';
      case 'success':
        return '[SUCCESS]';
      case 'warning':
        return '[WARN]';
      default:
        return '[INFO]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto font-mono text-xs scrollbar-thin"
    >
      {logs.length === 0 ? (
        <div className="text-slate-500 text-center py-8">
          <p>No activity yet.</p>
          <p className="mt-1">Logs will appear here when processing starts.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex">
              <span className="text-slate-500 mr-2 flex-shrink-0">{log.timestamp}</span>
              <span className={`mr-2 flex-shrink-0 ${getLogColor(log.type)}`}>
                {getLogPrefix(log.type)}
              </span>
              <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
