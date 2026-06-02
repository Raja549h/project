import { useUserStore } from '@/stores/useUserStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useJeeStore } from '@/stores/useJeeStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useAiConfigStore } from '@/stores/useAiConfigStore';
import { chatCompletion, hasValidKey } from '@/lib/ai';
import { useState, useEffect } from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function YearlyReview() {
  const { level, xp, currentStreak } = useUserStore();
  const sessions = useDeepWorkStore(s => s.sessions);
  const habits = useHabitStore(s => s.habits);
  const { physics, chemistry, mathematics } = useJeeStore();
  const projects = useProjectStore(s => s.projects);
  const hasKey = hasValidKey();
  const [lessons, setLessons] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const totalDW = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalQs = physics.questionsSolved + chemistry.questionsSolved + mathematics.questionsSolved;
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);
  const projectCount = projects.length;
  const totalMilestones = projects.reduce((sum, p) => sum + p.milestonesCompleted, 0);

  const generateSummary = async () => {
    setLoading(true);
    const prompt = `Generate a 3-4 sentence yearly review summary for a LifeOS ASCEND user with these stats:
- Level ${level}, ${xp} total XP
- ${totalDW.toFixed(1)} hours of deep work
- ${totalQs} JEE questions solved
- Best streak: ${bestStreak} days
- ${projectCount} projects completed with ${totalMilestones} milestones
- Current streak: ${currentStreak} days

Provide an encouraging, insightful assessment and 1-2 focus areas for next year.`;

    try {
      const summary = await chatCompletion([
        { role: 'system', content: 'You are a life coach writing a yearly review. Be encouraging and specific.' },
        { role: 'user', content: prompt },
      ], { maxTokens: 300 });
      setAiSummary(summary);
    } catch {
      setAiSummary('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasKey && !aiSummary) generateSummary();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <FileText className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Yearly Review</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Level</p>
          <p className="text-2xl font-bold text-xp">{level}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Total XP</p>
          <p className="text-2xl font-bold text-deep">{xp.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Deep Work</p>
          <p className="text-2xl font-bold text-intelligence">{totalDW.toFixed(1)}h</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Best Streak</p>
          <p className="text-2xl font-bold text-fitness">{bestStreak}d</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Questions Solved</p>
          <p className="text-2xl font-bold text-business">{totalQs}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Projects</p>
          <p className="text-2xl font-bold text-deep">{projectCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Milestones</p>
          <p className="text-2xl font-bold text-xp">{totalMilestones}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-fitness">{currentStreak}d</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">AI Summary</h2>
          {hasKey && (
            <button onClick={generateSummary} disabled={loading} className="text-xs px-2 py-1 bg-intelligence/20 text-intelligence rounded-lg">
              <Sparkles size={12} className="inline mr-1" />{loading ? 'Generating...' : 'Regenerate'}
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-gray-400 animate-pulse">Generating your yearly summary...</p>
        ) : aiSummary ? (
          <p className="text-sm text-gray-400">{aiSummary}</p>
        ) : (
          <p className="text-sm text-gray-500">Add your Groq API key in Settings to get an AI-generated yearly summary.</p>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Lessons Learned</h2>
        <textarea
          value={lessons}
          onChange={e => setLessons(e.target.value)}
          placeholder="What did you learn this year?"
          className="w-full bg-surface border border-border rounded-lg p-3 text-sm outline-none min-h-[120px] resize-y"
        />
      </div>
    </div>
  );
}
