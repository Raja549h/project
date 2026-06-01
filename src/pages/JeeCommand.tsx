import { useJeeStore, type SubjectProgress } from '@/stores/useJeeStore';
import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';

const SUBJECTS: (keyof ReturnType<typeof useJeeStore.getState> & ('physics' | 'chemistry' | 'mathematics'))[] = [
  'physics', 'chemistry', 'mathematics'
];
const LABELS: Record<string, string> = { physics: 'Physics', chemistry: 'Chemistry', mathematics: 'Mathematics' };
const COLORS: Record<string, string> = { physics: 'text-deep', chemistry: 'text-business', mathematics: 'text-intelligence' };
const BG_COLORS: Record<string, string> = { physics: 'bg-deep', chemistry: 'bg-business', mathematics: 'bg-intelligence' };

function SubjectCard({ subject }: { subject: string }) {
  const data = useJeeStore((s: any) => s[subject]) as SubjectProgress;
  const addQuestions = useJeeStore(s => s.addQuestions);
  const addStudyHours = useJeeStore(s => s.addStudyHours);
  const completeChapter = useJeeStore(s => s.completeChapter);
  const [qCount, setQCount] = useState(10);
  const [correct, setCorrect] = useState(7);
  const [hours, setHours] = useState(1);
  const [chapter, setChapter] = useState('');

  const accuracy = data.questionsSolved > 0
    ? Math.round((data.correct / data.questionsSolved) * 100) : 0;

  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <h3 className={`font-semibold mb-3 ${COLORS[subject]}`}>{LABELS[subject]}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="bg-surface p-2 rounded-lg text-center">
          <p className="text-xs text-gray-400">Questions</p>
          <p className="font-semibold">{data.questionsSolved}</p>
        </div>
        <div className="bg-surface p-2 rounded-lg text-center">
          <p className="text-xs text-gray-400">Accuracy</p>
          <p className="font-semibold">{accuracy}%</p>
        </div>
        <div className="bg-surface p-2 rounded-lg text-center">
          <p className="text-xs text-gray-400">Study Hours</p>
          <p className="font-semibold">{data.studyHours.toFixed(1)}</p>
        </div>
        <div className="bg-surface p-2 rounded-lg text-center">
          <p className="text-xs text-gray-400">Chapters</p>
          <p className="font-semibold">{data.chaptersCompleted.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input type="number" value={qCount} onChange={e => setQCount(Number(e.target.value))} className="w-16 bg-surface border border-border rounded p-1 text-sm text-center" />
          <input type="number" value={correct} onChange={e => setCorrect(Number(e.target.value))} className="w-16 bg-surface border border-border rounded p-1 text-sm text-center" />
          <button onClick={() => addQuestions(subject as any, qCount, correct)} className="text-xs px-2 py-1 bg-xp/20 text-xp rounded-lg hover:bg-xp/30">
            Log Questions
          </button>
        </div>
        <div className="flex gap-2">
          <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-16 bg-surface border border-border rounded p-1 text-sm text-center" />
          <button onClick={() => addStudyHours(subject as any, hours)} className="text-xs px-2 py-1 bg-deep/20 text-deep rounded-lg">
            Add Hours
          </button>
        </div>
        <div className="flex gap-2">
          <input value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Chapter name" className="flex-1 bg-surface border border-border rounded p-1 text-sm" />
          <button onClick={() => { if (chapter.trim()) { completeChapter(subject as any, chapter.trim()); setChapter(''); } }} className="text-xs px-2 py-1 bg-business/20 text-business rounded-lg">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JeeCommand() {
  const getReadiness = useJeeStore(s => s.getReadiness);
  const readiness = getReadiness();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">JEE Command Center</h1>
        <div className="flex items-center gap-2">
          <BookOpen className="text-xp" size={20} />
          <span className="text-lg font-semibold text-xp">Readiness: {readiness}%</span>
        </div>
      </div>

      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-xp rounded-full transition-all" style={{ width: `${readiness}%` }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBJECTS.map(s => <SubjectCard key={s} subject={s} />)}
      </div>
    </div>
  );
}
