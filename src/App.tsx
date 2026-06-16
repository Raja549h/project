import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DailySystem from './pages/DailySystem';
import Analytics from './pages/Analytics';
import SkillTree from './pages/SkillTree';
import DeepWork from './pages/DeepWork';
import JeeCommand from './pages/JeeCommand';
import FitnessCenter from './pages/FitnessCenter';
import Projects from './pages/Projects';
import AiCoach from './pages/AiCoach';
import YearlyReview from './pages/YearlyReview';
import LifeAudit from './pages/LifeAudit';
import Reputation from './pages/Reputation';
import ConfidenceLab from './pages/ConfidenceLab';
import EnvironmentDesigner from './pages/EnvironmentDesigner';
import DigitalBoundary from './pages/DigitalBoundary';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Quests from './pages/Quests';
import BattleMode from './pages/BattleMode';
import Masters from './pages/Masters';
import { useQuestsStore } from './stores/useQuestsStore';

export default function App() {
  const generateDaily = useQuestsStore(s => s.generateDaily);

  useEffect(() => {
    const quests = useQuestsStore.getState().dailyQuests;
    if (quests.length === 0) {
      generateDaily();
    }
  }, [generateDaily]);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-surface">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailySystem />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/skill-tree" element={<SkillTree />} />
            <Route path="/deep-work" element={<DeepWork />} />
            <Route path="/jee" element={<JeeCommand />} />
            <Route path="/fitness" element={<FitnessCenter />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/ai-coach" element={<AiCoach />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/yearly-review" element={<YearlyReview />} />
            <Route path="/life-audit" element={<LifeAudit />} />
            <Route path="/reputation" element={<Reputation />} />
            <Route path="/confidence" element={<ConfidenceLab />} />
            <Route path="/environment" element={<EnvironmentDesigner />} />
            <Route path="/digital-boundary" element={<DigitalBoundary />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/battle-mode" element={<BattleMode />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
