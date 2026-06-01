import { useUserStore } from '@/stores/useUserStore';
import { ACHIEVEMENTS_LIST } from '@/stores/useAchievementsStore';
import { Trophy } from 'lucide-react';

export default function Achievements() {
  const achievements = useUserStore(s => s.achievements);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Trophy className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Achievements</h1>
        <span className="text-sm text-gray-400">({achievements.length}/{ACHIEVEMENTS_LIST.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ACHIEVEMENTS_LIST.map(a => {
          const unlocked = achievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition-all ${
                unlocked ? 'bg-card border-xp/40' : 'bg-surface border-border opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${unlocked ? 'text-gray-200' : 'text-gray-500'}`}>{a.name}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
              </div>
              {unlocked && (
                <div className="mt-2 text-xs text-xp">✓ Unlocked</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
