import { useHabitStore, type HabitCategory } from '@/stores/useHabitStore';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES: HabitCategory[] = ['Study', 'Fitness', 'Health', 'Business', 'Mindset', 'Custom'];
const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Study: 'text-deep', Fitness: 'text-fitness', Health: 'text-business',
  Business: 'text-xp', Mindset: 'text-intelligence', Custom: 'text-gray-400',
};

export default function DailySystem() {
  const { habits, toggleComplete, addHabit, deleteHabit, getTodayCompletion } = useHabitStore();
  const today = new Date().toISOString().split('T')[0];
  const [newName, setNewName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Study');
  const completionPct = getTodayCompletion();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit({ name: newName.trim(), category });
    setNewName('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily System</h1>
        <div className="flex items-center gap-2 text-lg">
          <Sparkles className="text-xp" size={20} />
          <span className="text-xp font-semibold">{completionPct}%</span>
        </div>
      </div>

      {habits.length > 0 && (
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-xp rounded-full transition-all" style={{ width: `${completionPct}%` }} />
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New habit..."
          className="bg-surface border border-border rounded-lg p-2 flex-1 text-sm outline-none focus:border-xp/50"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value as HabitCategory)}
          className="bg-surface border border-border rounded-lg p-2 text-sm outline-none"
        >
          {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <button onClick={handleAdd} className="p-2 bg-xp text-black rounded-lg hover:bg-xp/90">
          <Plus size={18} />
        </button>
      </div>

      <div className="grid gap-2">
        {habits.map(habit => (
          <div key={habit.id} className="flex items-center justify-between bg-card p-3 rounded-xl border border-border hover:border-xp/20 transition-colors">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={habit.completedDates.includes(today)}
                onChange={() => toggleComplete(habit.id, today)}
                className="w-5 h-5 accent-xp cursor-pointer"
              />
              <div>
                <p className={`font-medium ${habit.completedDates.includes(today) ? 'line-through text-gray-500' : ''}`}>
                  {habit.name}
                </p>
                <p className="text-xs text-gray-500">
                  <span className={CATEGORY_COLORS[habit.category]}>{habit.category}</span>
                  {' '}&bull; Streak: {habit.streak}🔥
                </p>
              </div>
            </div>
            <button onClick={() => deleteHabit(habit.id)} className="text-gray-600 hover:text-fitness transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No habits yet</p>
            <p className="text-sm">Add your first habit to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
