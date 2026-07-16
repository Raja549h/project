import { useQuestsStore, type Quest } from '@/stores/useQuestsStore';
import { Sparkles, RefreshCw } from 'lucide-react';

function QuestSection({ title, quests, type }: { title: string; quests: Quest[]; type: 'daily' | 'weekly' | 'monthly' }) {
  const claimReward = useQuestsStore(s => s.claimReward);

  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h2 className="text-sm font-semibold text-gray-300 mb-3">{title}</h2>
      <div className="space-y-2">
        {quests.map(q => (
          <div key={q.id} className="bg-surface p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-sm">{q.title}</p>
              <span className="text-xs text-xp">+{q.xpReward} XP</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{q.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-xp rounded-full transition-all"
                  style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{q.progress}/{q.target}</span>
              {q.completed && !q.claimed && (
                <button
                  onClick={() => claimReward(q.id, type)}
                  className="text-xs px-2 py-1 bg-xp text-black rounded-lg font-medium"
                >
                  Claim
                </button>
              )}
              {q.claimed && <span className="text-xs text-business">✓ Claimed</span>}
            </div>
          </div>
        ))}
        {quests.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No quests available</p>}
      </div>
    </div>
  );
}

export default function Quests() {
  const { dailyQuests, weeklyQuests, monthlyQuests, generateDaily, generateWeekly, generateMonthly } = useQuestsStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-xp" size={24} />
          <h1 className="text-2xl font-bold">Quest System</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={generateDaily} className="text-xs px-2 py-1 bg-surface text-gray-400 rounded-lg hover:bg-card"><RefreshCw size={14} className="inline mr-1" />Daily</button>
          <button onClick={generateWeekly} className="text-xs px-2 py-1 bg-surface text-gray-400 rounded-lg hover:bg-card"><RefreshCw size={14} className="inline mr-1" />Weekly</button>
          <button onClick={generateMonthly} className="text-xs px-2 py-1 bg-surface text-gray-400 rounded-lg hover:bg-card"><RefreshCw size={14} className="inline mr-1" />Monthly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuestSection title="Daily Quests" quests={dailyQuests} type="daily" />
        <QuestSection title="Weekly Quests" quests={weeklyQuests} type="weekly" />
        <QuestSection title="Monthly Quests" quests={monthlyQuests} type="monthly" />
      </div>
    </div>
  );
}
