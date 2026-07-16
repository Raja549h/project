import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

interface MemoryNode {
  id: number;
  content: string;
  tier: string;
  hotness: number;
  position: [number, number, number];
}

const MemoryParticle = ({ node }: { node: MemoryNode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  let color = '#3b82f6'; // WARM (blue)
  if (node.tier === 'HOT') color = '#ef4444'; // HOT (red)
  if (node.tier === 'COLD') color = '#9ca3af'; // COLD (gray)

  const size = Math.max(0.2, node.hotness * 0.5);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2 : 0.8} wireframe={node.tier === 'COLD'} />
      </mesh>
      
      {hovered && (
        <Html position={[0, size + 0.5, 0]} center zIndexRange={[100, 0]} className="pointer-events-none">
          <div className="bg-gray-900/90 border border-gray-600 p-2 rounded text-xs text-white shadow-xl min-w-[150px] backdrop-blur-md">
            <div className="font-bold border-b border-gray-700 pb-1 mb-1 flex justify-between">
              <span style={{ color }}>{node.tier}</span>
              <span className="text-gray-400">Heat: {node.hotness.toFixed(1)}</span>
            </div>
            <div className="text-gray-300 break-words">{node.content}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const AdvancedAnalytics: React.FC = () => {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbeddings = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:7860';
        const res = await fetch(`${backendUrl}/api/v1/memories/embeddings`);
        const data = await res.json();
        setMemories(data.memories || []);
      } catch (err) {
        console.error("Failed to fetch memory embeddings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmbeddings();
  }, []);

  if (loading) {
    return <div className="w-full h-[500px] bg-gray-950 rounded-xl flex items-center justify-center text-gray-500 font-mono">Initializing Neural Mapping...</div>;
  }

  return (
    <div className="w-full h-[500px] bg-gray-950 rounded-xl overflow-hidden border border-gray-800 relative shadow-2xl">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
        
        {/* Core memory hub ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[8, 8.1, 64]} />
          <meshBasicMaterial color="#374151" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        <group>
          {memories.map(m => (
            <MemoryParticle key={m.id} node={m} />
          ))}
        </group>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-teal-400 font-bold text-sm bg-gray-900/50 px-3 py-1 rounded backdrop-blur border border-teal-500/20">Memory Hub Vector Space</h3>
        <p className="text-[10px] text-gray-400 mt-1 ml-1 font-mono">3D Principal Component Projection</p>
      </div>
      <div className="absolute bottom-4 left-4 pointer-events-none flex gap-3 text-[10px] font-mono bg-gray-900/80 p-2 rounded backdrop-blur border border-gray-800">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> HOT</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> WARM</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span> COLD</span>
      </div>
    </div>
  );
};
