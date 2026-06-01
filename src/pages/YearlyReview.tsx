import { useUserStore } from '@/stores/useUserStore';
import { useDeepWorkStore } from '@/stores/useDeepWorkStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useJeeStore } from '@/stores/useJeeStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useState } from 'react';
import { FileText } from 'lucide-react';

export default function YearlyReview() {
  const { level, xp, currentStreak } = useUserStore();
  const sessions = useDeepWorkStore(s => s.sessions);
  const habits = useHabitStore(s => s.habits);
  const { physics, chemistry, mathematics } = useJeeStore();
  const projects = useProjectStore(s => s.projects);
  const [lessons, setLessons] = useState('');

  const totalDW = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalQs = physics.questionsSolved + chemistry.questionsSolved + mathematics.questionsSolved;
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);
  const projectCount = projects.length;
  const totalMilestones = projects.reduce((sum, p) => sum + p.milestonesCompleted, 0);

  const aiSummary = `This year you reached Level ${level} with ${xp.toLocaleString()} total XP. You completed ${totalDW.toFixed(1)} hours of deep work, solved ${totalQs} JEE questions, and maintained a best streak of ${bestStreak} days. You worked on ${projectCount} projects with ${totalMilestones} milestones completed. Focus on consistency and deep work to accelerate next year.`;

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
        <h2 className="text-sm font-semibold text-gray-300 mb-3">AI Summary</h2>
        <p className="text-sm text-gray-400">{aiSummary}</p>
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
