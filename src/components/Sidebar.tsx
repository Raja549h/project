import { NavLink } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Home, CalendarCheck, BarChart3, TreePine, Brain, GraduationCap,
  Dumbbell, FolderKanban, Bot, FileText, ShieldCheck, Video,
  Palette, Lock, Settings, Sparkles, Sword, Trophy, BookOpen, ChevronDown, ChevronRight
} from 'lucide-react';

const navGroups = [
  {
    title: 'Core',
    items: [
      { to: '/', icon: Home, label: 'Dashboard' },
      { to: '/daily', icon: CalendarCheck, label: 'Daily System' },
      { to: '/deep-work', icon: Brain, label: 'Deep Work' },
      { to: '/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    title: 'Character Hub',
    items: [
      { to: '/skill-tree', icon: TreePine, label: 'Skill Tree' },
      { to: '/quests', icon: Sparkles, label: 'Quests' },
      { to: '/achievements', icon: Trophy, label: 'Achievements' },
      { to: '/battle-mode', icon: Sword, label: 'Battle Mode' },
    ]
  },
  {
    title: 'Mindset & Systems',
    items: [
      { to: '/confidence', icon: Video, label: 'Confidence Lab' },
      { to: '/environment', icon: Palette, label: 'Environment' },
      { to: '/digital-boundary', icon: Lock, label: 'Digital Boundary' },
      { to: '/reputation', icon: ShieldCheck, label: 'Reputation' },
    ]
  },
  {
    title: 'Specialized',
    items: [
      { to: '/fitness', icon: Dumbbell, label: 'Fitness Center' },
      { to: '/jee', icon: GraduationCap, label: 'JEE Command' },
      { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
      { to: '/masters', icon: BookOpen, label: 'UHM-OS Masters' },
    ]
  },
  {
    title: 'Reflections',
    items: [
      { to: '/life-audit', icon: FileText, label: 'Life Audit' },
      { to: '/yearly-review', icon: FileText, label: 'Yearly Review' },
    ]
  }
];

function NavGroup({ title, items }: { title: string, items: typeof navGroups[0]['items'] }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wider"
      >
        {title}
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-0.5"
          >
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-xp/10 text-xp' : 'text-gray-400 hover:bg-surface hover:text-gray-200'
                  }`
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const { username, level, xp, rank, currentStreak } = useUserStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }
    prevLevelRef.current = level;
  }, [level]);

  return (
    <>
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-3 h-screen overflow-y-hidden shrink-0">
        <div className="flex items-center gap-3 p-3 bg-surface rounded-xl shrink-0">
          <div className="w-10 h-10 rounded-full bg-xp/20 flex items-center justify-center text-xp font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-semibold">{username}</p>
            <p className="text-xs text-gray-400">Lv.{level} &bull; {rank}</p>
            <p className="text-xs text-xp">{xp.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 flex gap-2 px-1 shrink-0">
          <span>🔥 {currentStreak} Day Streak</span>
        </div>

        <nav className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {navGroups.map(group => (
            <NavGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </nav>

        <NavLink to="/settings" className="mt-auto shrink-0 flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-surface">
          <Settings size={17} /> Settings
        </NavLink>
      </aside>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <div className="text-7xl font-bold text-xp mb-2">LEVEL UP!</div>
              <div className="text-2xl text-gray-300">You are now level {level}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
