import React from 'react';
import type { PendingAction } from '../../hooks/useAgentStream';

interface AgentObservabilityProps {
  isStreaming: boolean;
  isPaused: boolean;
  pendingActions: PendingAction[];
  onApprove: (decision: 'approve' | 'reject') => void;
  onIntervene: (action: 'override', instruction: string) => void;
}

export const AgentObservability: React.FC<AgentObservabilityProps> = ({
  isStreaming,
  isPaused,
  pendingActions,
  onApprove,
  onIntervene
}) => {
  const [overrideText, setOverrideText] = React.useState('');

  if (!isStreaming && !isPaused) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/30 mb-4 shadow-lg shadow-blue-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-400 font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Swarm Intelligence {isPaused ? '(Paused)' : '(Active)'}
        </h3>
      </div>

      {isPaused && pendingActions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/30">
          <h4 className="text-yellow-400 text-sm font-medium mb-2">⚠️ Human Approval Required</h4>
          <p className="text-gray-300 text-sm mb-3">The agent wants to execute the following actions:</p>
          <ul className="space-y-2 mb-4">
            {pendingActions.map((action, idx) => (
              <li key={idx} className="bg-gray-700/50 p-2 rounded text-xs text-gray-200">
                <span className="font-mono text-blue-300">{action.store}.{action.action}</span>
                <pre className="mt-1 text-gray-400">{JSON.stringify(action.payload, null, 2)}</pre>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button 
              onClick={() => onApprove('approve')}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={() => onApprove('reject')}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Reject
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h5 className="text-gray-400 text-xs mb-2">Or Override Plan:</h5>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={overrideText}
                onChange={(e) => setOverrideText(e.target.value)}
                placeholder="New instruction..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={() => {
                  if (overrideText) {
                    onIntervene('override', overrideText);
                    setOverrideText('');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm transition-colors"
              >
                Force Replan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
