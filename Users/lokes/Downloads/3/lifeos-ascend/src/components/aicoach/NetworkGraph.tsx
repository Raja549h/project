import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  status: 'pending' | 'running' | 'completed';
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  current_node: string;
}

interface NetworkGraphProps {
  data: GraphData | null;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    let chartDefinition = 'graph TD\n';

    // Add nodes with styling based on status
    data.nodes.forEach(node => {
      let styleClass = '';
      if (node.status === 'completed') styleClass = 'style ' + node.id + ' fill:#166534,stroke:#22c55e,color:#fff\n';
      else if (node.status === 'running') styleClass = 'style ' + node.id + ' fill:#1e3a8a,stroke:#3b82f6,color:#fff,stroke-width:2px,stroke-dasharray: 5 5\n';
      else styleClass = 'style ' + node.id + ' fill:#374151,stroke:#6b7280,color:#9ca3af\n';

      chartDefinition += `    ${node.id}["${node.label}"]\n`;
      chartDefinition += `    ${styleClass}`;
    });

    // Add edges
    data.edges.forEach(edge => {
      chartDefinition += `    ${edge.source} --> ${edge.target}\n`;
    });

    const renderGraph = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), chartDefinition);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid rendering failed", err);
      }
    };

    renderGraph();
  }, [data]);

  if (!data) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-blue-500/20 mb-4 shadow-lg overflow-hidden">
      <h3 className="text-blue-400 font-semibold mb-2 text-sm flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {data.current_node !== 'finish' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Swarm Topology Map
      </h3>
      <div 
        ref={containerRef}
        className="w-full flex justify-center items-center overflow-x-auto p-4 bg-gray-950/50 rounded-lg min-h-[150px]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
