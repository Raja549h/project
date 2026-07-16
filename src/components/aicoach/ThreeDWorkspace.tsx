import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAgentStreamStore } from '@/stores/useAgentStreamStore';

const AgentNode = ({ id, label, type, status, position }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && status === 'running') {
      const t = clock.getElapsedTime();
      meshRef.current.scale.setScalar(1 + Math.sin(t * 5) * 0.1);
    }
  });

  let color = '#4b5563'; // pending (gray)
  if (status === 'running') color = '#3b82f6'; // blue
  if (status === 'completed') color = '#22c55e'; // green
  if (status === 'failed') color = '#ef4444'; // red
  if (status === 'paused') color = '#eab308'; // yellow

  const radius = type === 'router' || type === 'judge' ? 1.5 : 1.0;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={status === 'running' ? 2 : 0.5} toneMapped={false} />
      </mesh>
      
      {/* Outer Glow for running nodes */}
      {status === 'running' && (
        <mesh>
          <sphereGeometry args={[radius * 1.3, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      <Html position={[0, radius + 0.5, 0]} center className="pointer-events-none">
        <div className="bg-gray-900/80 border border-gray-700 px-2 py-1 rounded text-[10px] text-white font-mono whitespace-nowrap backdrop-blur-sm">
          {label}
        </div>
      </Html>
    </group>
  );
};

export const ThreeDWorkspace: React.FC = () => {
  const { graphData } = useAgentStreamStore();

  const { nodes, edges } = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], edges: [] };

    const renderedNodes: any[] = [];
    const renderedEdges: any[] = [];
    const nodeMap = new Map();

    const workers = graphData.nodes.filter(n => n.type === 'worker');
    const workerCount = workers.length;
    const workerSpacing = 4;
    const startX = -((workerCount - 1) * workerSpacing) / 2;
    let workerIndex = 0;

    // Layout
    graphData.nodes.forEach(n => {
      let pos = [0, 0, 0];
      if (n.id === 'start') { pos = [0, 6, 0]; }
      else if (n.id === 'meta_router') { pos = [0, 3, 0]; }
      else if (n.type === 'worker') {
        pos = [startX + (workerIndex * workerSpacing), 0, 0];
        workerIndex++;
      }
      else if (n.id === 'synthesize') { pos = [0, -3, 0]; }
      else if (n.id === 'evaluate') { pos = [0, -6, 0]; }
      else { pos = [(Math.random() - 0.5) * 10, -8, (Math.random() - 0.5) * 5]; }

      const nodeObj = { ...n, position: pos };
      renderedNodes.push(nodeObj);
      nodeMap.set(n.id, nodeObj);
    });

    graphData.edges.forEach(e => {
      const sourceNode = nodeMap.get(e.source);
      const targetNode = nodeMap.get(e.target);
      if (sourceNode && targetNode) {
        renderedEdges.push({
          source: sourceNode.position,
          target: targetNode.position,
          active: targetNode.status === 'running' || sourceNode.status === 'running'
        });
      }
    });

    return { nodes: renderedNodes, edges: renderedEdges };
  }, [graphData]);

  if (!graphData) {
    return (
      <div className="w-full h-[500px] bg-gray-950 rounded-xl flex items-center justify-center border border-gray-800">
        <div className="text-gray-500 font-mono text-sm">Awaiting Swarm Initialization...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-gray-950 rounded-xl overflow-hidden border border-gray-800 relative shadow-2xl">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {edges.map((e, idx) => (
          <Line
            key={`edge-${idx}`}
            points={[e.source, e.target]}
            color={e.active ? '#60a5fa' : '#374151'}
            lineWidth={e.active ? 2 : 1}
            dashed={e.active}
            dashScale={50}
            dashSize={1}
          />
        ))}

        {nodes.map(n => (
          <AgentNode key={n.id} {...n} />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-blue-400 font-bold text-sm bg-gray-900/50 px-3 py-1 rounded backdrop-blur">3D Swarm Workspace</h3>
      </div>
    </div>
  );
};
