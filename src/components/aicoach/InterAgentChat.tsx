import React, { useEffect, useRef } from 'react';
import { Cpu, Server, Activity, ShieldCheck } from 'lucide-react';

interface InternalLog {
  agent: string;
  message: string;
}

interface InterAgentChatProps {
  logs: InternalLog[];
}

export const InterAgentChat: React.FC<InterAgentChatProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new log
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentIcon = (agent: string) => {
    if (agent === 'Meta-Router') return <Server size={14} className="text-blue-400" />;
    if (agent.startsWith('Worker')) return <Cpu size={14} className="text-green-400" />;
    if (agent === 'Constitutional Council') return <ShieldCheck size={14} className="text-purple-400" />;
    return <Activity size={14} className="text-gray-400" />;
  };

  if (!logs || logs.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 mb-4 shadow-lg flex flex-col max-h-48">
      <h3 className="text-gray-400 font-semibold mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
        <Activity size={14} />
        Swarm Internal Comms
      </h3>
      <div ref={containerRef} className="overflow-y-auto space-y-2 text-sm">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 bg-gray-800/50 p-2 rounded border border-gray-800 font-mono">
            <div className="mt-0.5 opacity-80 shrink-0">
              {getAgentIcon(log.agent)}
            </div>
            <div>
              <span className="font-bold text-gray-300 text-xs mr-2">[{log.agent}]</span>
              <span className="text-gray-400">{log.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
