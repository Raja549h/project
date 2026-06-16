import { NavLink } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Home, CalendarCheck, BarChart3, TreePine, Brain, GraduationCap,
  Dumbbell, FolderKanban, Bot, FileText, ShieldCheck, Video,
  Palette, Lock, Settings, Sparkles, Sword, Trophy, BookOpen
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/daily', icon: CalendarCheck, label: 'Daily System' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/skill-tree', icon: TreePine, label: 'Skill Tree' },
  { to: '/deep-work', icon: Brain, label: 'Deep Work' },
  { to: '/jee', icon: GraduationCap, label: 'JEE Command' },
  { to: '/fitness', icon: Dumbbell, label: 'Fitness Center' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/ai-coach', icon: Bot, label: 'AI Coach' },
  { to: '/life-audit', icon: FileText, label: 'Life Audit' },
  { to: '/reputation', icon: ShieldCheck, label: 'Reputation' },
  { to: '/confidence', icon: Video, label: 'Confidence Lab' },
  { to: '/environment', icon: Palette, label: 'Environment' },
  { to: '/digital-boundary', icon: Lock, label: 'Digital Boundary' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/quests', icon: Sparkles, label: 'Quests' },
  { to: '/battle-mode', icon: Sword, label: 'Battle Mode' },
  { to: '/masters', icon: BookOpen, label: 'UHM-OS Masters' },
  { to: '/yearly-review', icon: FileText, label: 'Yearly Review' },
];

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
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-3 h-screen overflow-y-auto shrink-0">
        <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
          <div className="w-10 h-10 rounded-full bg-xp/20 flex items-center justify-center text-xp font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-semibold">{username}</p>
            <p className="text-xs text-gray-400">Lv.{level} &bull; {rank}</p>
            <p className="text-xs text-xp">{xp.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 flex gap-2 px-1">
          <span>🔥 {currentStreak} Day Streak</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
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
        </nav>

        <NavLink to="/settings" className="mt-auto flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-gray-200 rounded-lg hover:bg-surface">
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
