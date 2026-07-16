import { useProjectStore, type TaskStatus } from '@/stores/useProjectStore';
import { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

function ProjectBoard({ projectId }: { projectId: string }) {
  const projects = useProjectStore(s => s.projects);
  const addTask = useProjectStore(s => s.addTask);
  const moveTask = useProjectStore(s => s.moveTask);
  const completeMilestone = useProjectStore(s => s.completeMilestone);
  const project = projects.find(p => p.id === projectId)!;
  const [newTask, setNewTask] = useState('');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{project.name}</h3>
        <div className="text-xs text-gray-400">
          Milestones: {project.milestonesCompleted}/{project.milestones}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && newTask.trim() && (addTask(projectId, newTask.trim()), setNewTask(''))}
          placeholder="Add task..."
          className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm outline-none"
        />
        <button onClick={() => newTask.trim() && (addTask(projectId, newTask.trim()), setNewTask(''))} className="p-2 bg-xp/20 text-xp rounded-lg">
          <Plus size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COLUMNS.map(col => (
          <div key={col.status} className="bg-surface rounded-lg p-2 min-h-[120px]">
            <p className="text-xs font-semibold text-gray-400 mb-2">{col.label}</p>
            <div className="space-y-1">
              {project.tasks.filter(t => t.status === col.status).map(task => (
                <div key={task.id} className="bg-card p-2 rounded text-xs flex items-center justify-between gap-1">
                  <span className="text-gray-300 truncate">{task.title}</span>
                  <div className="flex gap-1 shrink-0">
                    {col.status !== 'todo' && (
                      <button onClick={() => moveTask(projectId, task.id, COLUMNS[COLUMNS.indexOf(col) - 1].status)} className="text-gray-500 hover:text-gray-300">
                        <ChevronLeft size={12} />
                      </button>
                    )}
                    {col.status !== 'done' && (
                      <button onClick={() => {
                        moveTask(projectId, task.id, COLUMNS[COLUMNS.indexOf(col) + 1].status);
                        if (col.status === 'in-progress') completeMilestone(projectId);
                      }} className="text-gray-500 hover:text-gray-300">
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, addProject, deleteProject } = useProjectStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [milestones, setMilestones] = useState(3);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Projects</h1>

      <div className="bg-card p-4 rounded-xl border border-border">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">New Project</h2>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="flex-1 bg-surface border border-border rounded-lg p-2 text-sm outline-none" />
          <input type="number" value={milestones} onChange={e => setMilestones(Number(e.target.value))} className="w-16 bg-surface border border-border rounded-lg p-2 text-sm text-center" />
          <button
            onClick={() => { if (name.trim()) { addProject({ name: name.trim(), description: desc.trim(), milestones }); setName(''); setDesc(''); } }}
            className="px-3 py-2 bg-xp/20 text-xp rounded-lg text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map(p => (
          <div key={p.id} className="bg-card p-4 rounded-xl border border-border relative">
            <button onClick={() => deleteProject(p.id)} className="absolute top-4 right-4 text-gray-500 hover:text-fitness">
              <Trash2 size={15} />
            </button>
            <ProjectBoard projectId={p.id} />
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
