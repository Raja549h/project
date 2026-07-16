import { useSkillStore } from '@/stores/useSkillStore';
import { motion } from 'framer-motion';
import { Lock, Unlock, TreePine } from 'lucide-react';

const DOMAIN_CONFIG: Record<string, { color: string; label: string }> = {
  'deep-work': { color: '#3b82f6', label: 'Deep Work' },
  'fitness': { color: '#ef4444', label: 'Fitness' },
  'business': { color: '#22c55e', label: 'Business' },
  'intelligence': { color: '#a855f7', label: 'Intelligence' },
  'discipline': { color: '#f59e0b', label: 'Discipline' },
};

export default function SkillTree() {
  const { skillNodes, unlockNode, getProgressByDomain } = useSkillStore();
  const domains = Object.keys(DOMAIN_CONFIG);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skill Tree</h1>
        <TreePine className="text-business" size={24} />
      </div>

      <div className="grid grid-cols-5 gap-3">
        {domains.map(d => {
          const config = DOMAIN_CONFIG[d];
          const progress = getProgressByDomain(d);
          return (
            <div key={d} className="bg-card p-3 rounded-xl border border-border text-center">
              <p className="text-xs font-semibold mb-2" style={{ color: config.color }}>{config.label}</p>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: config.color }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}%</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {skillNodes.map((node, i) => {
          const config = DOMAIN_CONFIG[node.domain];
          const canUnlock = node.prerequisites.every(preqId =>
            skillNodes.find(n => n.id === preqId)?.unlocked
          );

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card p-4 rounded-xl border cursor-pointer transition-all ${
                node.unlocked ? 'border-xp/40' : 'border-border hover:border-xp/20'
              }`}
              onClick={() => unlockNode(node.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                {node.unlocked ? (
                  <Unlock size={14} className="text-business" />
                ) : (
                  <Lock size={14} className="text-gray-500" />
                )}
              </div>
              <p className="font-semibold text-sm mb-1">{node.name}</p>
              <p className="text-xs text-gray-500">
                {node.unlocked ? 'Unlocked' : `Cost: ${node.xpCost} XP`}
              </p>
              {!canUnlock && !node.unlocked && (
                <p className="text-xs text-fitness mt-1">Prerequisites needed</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
