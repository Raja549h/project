import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface CustomNodeData {
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  description?: string;
  type: string;
}

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  let bgColor = 'bg-gray-800';
  let borderColor = 'border-gray-600';
  let pulse = false;

  if (data.status === 'running') {
    bgColor = 'bg-blue-900/80';
    borderColor = 'border-blue-500';
    pulse = true;
  } else if (data.status === 'completed') {
    bgColor = 'bg-green-900/80';
    borderColor = 'border-green-500';
  } else if (data.status === 'failed') {
    bgColor = 'bg-red-900/80';
    borderColor = 'border-red-500';
  } else if (data.status === 'paused') {
    bgColor = 'bg-yellow-900/80';
    borderColor = 'border-yellow-500';
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${bgColor} ${borderColor} ${pulse ? 'animate-pulse' : ''} text-white min-w-[150px] text-center`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-gray-500" />
      <div className="font-bold text-xs uppercase tracking-wider mb-1">{data.label}</div>
      {data.description && <div className="text-[10px] text-gray-300">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-500" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface AgentNetworkGraphProps {
  data: {
    nodes: any[];
    edges: any[];
    current_node: string;
  };
  onIntervene: (action: "pause" | "resume" | "cancel" | "override", newInstruction?: string) => void;
}

export const AgentNetworkGraph: React.FC<AgentNetworkGraphProps> = ({ data, onIntervene }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  // Auto-layout simple algorithm
  useEffect(() => {
    if (!data || !data.nodes) return;

    const newNodes: any[] = [];
    const newEdges: any[] = [];

    const workers = data.nodes.filter(n => n.type === 'worker');
    const workerCount = workers.length;
    const workerSpacing = 200;
    const startX = 250 - ((workerCount - 1) * workerSpacing) / 2;

    let workerIndex = 0;

    data.nodes.forEach(n => {
      let x = 250;
      let y = 0;

      if (n.id === 'start') { y = 0; }
      else if (n.id === 'meta_router') { y = 100; }
      else if (n.type === 'worker') {
        x = startX + (workerIndex * workerSpacing);
        y = 250;
        workerIndex++;
      }
      else if (n.id === 'synthesize') { y = 400; }
      else if (n.id === 'evaluate') { y = 500; }
      else { y = 600; }

      newNodes.push({
        id: n.id,
        position: { x, y },
        type: 'custom',
        data: {
          label: n.label,
          status: n.status,
          description: n.description,
          type: n.type
        }
      });
    });

    data.edges.forEach((e, idx) => {
      newEdges.push({
        id: `e-${idx}`,
        source: e.source,
        target: e.target,
        animated: data.nodes.find(n => n.id === e.target)?.status === 'running',
        style: { stroke: '#60a5fa', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#60a5fa',
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return (
    <div className="bg-gray-950/80 rounded-xl border border-blue-500/20 mb-4 shadow-lg overflow-hidden relative" style={{ height: 400 }}>
      <h3 className="text-blue-400 font-semibold text-sm p-3 border-b border-gray-800 flex items-center gap-2 bg-gray-900/80 absolute top-0 left-0 w-full z-10">
        <span className="relative flex h-2 w-2">
          {data?.current_node !== 'finish' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Swarm Topology Map (React Flow)
      </h3>
      
      <div className="w-full h-full pt-12">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="!bg-gray-800 !border-gray-700 !text-white" />
        </ReactFlow>
      </div>

      {menu && (
        <div
          style={{ top: menu.top, left: menu.left }}
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-300">
            Node: {menu.id}
          </div>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors"
            onClick={() => { onIntervene('pause'); setMenu(null); }}
          >
            Pause Execution
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-gray-700 transition-colors"
            onClick={() => { onIntervene('resume'); setMenu(null); }}
          >
            Resume Execution
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            onClick={() => { onIntervene('override'); setMenu(null); }}
          >
            Force Replan
          </button>
        </div>
      )}
    </div>
  );
};
