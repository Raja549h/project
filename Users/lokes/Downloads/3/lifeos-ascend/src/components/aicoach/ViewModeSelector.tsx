import React from 'react';
import { MessageSquare, Network, Box } from 'lucide-react';

export type ViewMode = 'chat' | 'network' | 'immersive' | 'analytics';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="bg-gray-900 rounded-full p-1 border border-gray-700 flex shadow-lg">
        <button
          onClick={() => onModeChange('chat')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentMode === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <MessageSquare size={16} /> Chat
        </button>
        <button
          onClick={() => onModeChange('network')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentMode === 'network' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <Network size={16} /> Node Map
        </button>
        <button
          onClick={() => onModeChange('immersive')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentMode === 'immersive' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <Box size={16} /> 3D Swarm
        </button>
        <button
          onClick={() => onModeChange('analytics')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentMode === 'analytics' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          <Box size={16} /> 3D Memory Hub
        </button>
      </div>
    </div>
  );
};
