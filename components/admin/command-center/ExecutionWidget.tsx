'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Database, Globe, FileText, Terminal, Code, ChevronDown, ChevronUp, RotateCcw, CheckCircle2, AlertCircle, Loader2, GitBranch, Server, Brain } from 'lucide-react';
import type { ExecutionWidget as WidgetData, WidgetType } from './command-center.types';
import './transitions.css';

interface ExecutionWidgetCardProps {
  widget: WidgetData;
  onToggle: (id: string) => void;
  onRetry?: (id: string) => void;
}

function getWidgetIcon(type: WidgetType) {
  switch (type) {
    case 'crm': return Database;
    case 'search': return Globe;
    case 'files': return FileText;
    case 'terminal': return Terminal;
    case 'sql': return Code;
    default: return Server;
  }
}

export function ExecutionWidgetCard({ widget, onToggle, onRetry }: ExecutionWidgetCardProps) {
  const Icon = getWidgetIcon(widget.type);
  const isCollapsed = widget.status === 'collapsed';
  
  return (
    <div className="cc-widget-card border border-border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col">
      <div 
        className={cn(
          "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
          !isCollapsed && "border-b border-border/50 bg-muted/20"
        )}
        onClick={() => onToggle(widget.id)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-muted rounded-md text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">{widget.title}</span>
        </div>
        <div className="flex items-center space-x-3">
          {widget.status === 'active' && (
            <div className="flex items-center space-x-1.5 text-blue-500 text-xs font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Running</span>
            </div>
          )}
          {widget.status === 'complete' && (
            <div className="flex items-center space-x-1.5 text-green-500 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Done</span>
            </div>
          )}
          {widget.status === 'error' && (
            <div className="flex items-center space-x-1.5 text-red-500 text-xs font-medium">
              <AlertCircle className="h-3 w-3" />
              <span>Failed</span>
            </div>
          )}
          
          <button 
            className="p-1 hover:bg-background rounded text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(widget.id);
            }}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3 bg-background/50 text-sm overflow-x-auto max-h-[300px] overflow-y-auto">
          {widget.status === 'error' && onRetry && (
            <div className="mb-3">
              <button 
                onClick={() => onRetry(widget.id)}
                className="flex items-center space-x-2 text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Retry Execution</span>
              </button>
            </div>
          )}
          
          {widget.type === 'crm' && widget.data && Array.isArray(widget.data) ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase text-muted-foreground">
                <tr>
                  {Object.keys(widget.data[0] || {}).map((key) => (
                    <th key={key} className="px-3 py-2 font-medium">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {widget.data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-3 py-2 text-foreground/80">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : widget.type === 'search' && widget.data && Array.isArray(widget.data) ? (
            <div className="space-y-2">
              {widget.data.map((item, i) => (
                <div key={i} className="p-2 border border-border/50 rounded bg-background hover:border-border transition-colors">
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium text-xs truncate block">
                    {item.title || item.url}
                  </a>
                  {item.snippet && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.snippet}</p>}
                </div>
              ))}
            </div>
          ) : widget.type === 'files' && widget.data && Array.isArray(widget.data) ? (
            <div className="space-y-1.5">
              {widget.data.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs truncate">{file.name || file}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-xs bg-muted/30 p-2 rounded-md overflow-x-auto text-foreground/80 font-mono">
              {typeof widget.data === 'object' ? JSON.stringify(widget.data, null, 2) : String(widget.data || 'No data available')}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function ExecutionWidgetList({ widgets, onToggle, onRetry }: {
  widgets: WidgetData[];
  onToggle: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  if (!widgets.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {widgets.map(w => <ExecutionWidgetCard key={w.id} widget={w} onToggle={onToggle} onRetry={onRetry} />)}
    </div>
  );
}
