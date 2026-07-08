import { useUserStore } from '@/stores/useUserStore';
import { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { username, avatar, setUsername, setAvatar, resetProgress } = useUserStore();
  const [nameInput, setNameInput] = useState(username);
  const [avatarInput, setAvatarInput] = useState(avatar);
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.endsWith('-storage')) {
        data[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-ascend-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        window.location.reload();
      } catch { }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const keys = Object.keys(localStorage).filter(k => k.endsWith('-storage'));
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <SettingsIcon className="text-xp" size={24} />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Profile</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Username</p>
            <div className="flex gap-2">
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm outline-none" />
              <button onClick={() => setUsername(nameInput)} className="px-3 py-2 bg-xp/20 text-xp rounded-lg text-sm">Save</button>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Avatar URL</p>
            <div className="flex gap-2">
              <input value={avatarInput} onChange={e => setAvatarInput(e.target.value)} className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm outline-none" />
              <button onClick={() => setAvatar(avatarInput)} className="px-3 py-2 bg-xp/20 text-xp rounded-lg text-sm">Save</button>
            </div>
          </div>
        </div>
      </div>



      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Data Management</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-deep/20 text-deep rounded-lg text-sm hover:bg-deep/30">
            <Download size={16} /> Export Data
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-intelligence/20 text-intelligence rounded-lg text-sm hover:bg-intelligence/30 cursor-pointer">
            <Upload size={16} /> Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-fitness/20">
        <h2 className="text-sm font-semibold text-fitness mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Danger Zone
        </h2>
        {!showReset ? (
          <button onClick={() => setShowReset(true)} className="px-4 py-2 bg-fitness/20 text-fitness rounded-lg text-sm hover:bg-fitness/30">
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-fitness">Are you sure? This will delete all your data!</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 bg-fitness text-white rounded-lg text-sm">Yes, Reset Everything</button>
              <button onClick={() => setShowReset(false)} className="px-4 py-2 bg-surface text-gray-400 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
