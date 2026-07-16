import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  milestones: number;
  milestonesCompleted: number;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'tasks' | 'milestonesCompleted'>) => void;
  addTask: (projectId: string, title: string) => void;
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => void;
  completeMilestone: (projectId: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          tasks: [],
          milestonesCompleted: 0,
        };
        set({ projects: [...get().projects, project] });
      },
      addTask: (projectId, title) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), title, status: 'todo' as TaskStatus }] }
              : p
          ),
        }));
      },
      moveTask: (projectId, taskId, newStatus) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map(t =>
                    t.id === taskId ? { ...t, status: newStatus } : t
                  ),
                }
              : p
          ),
        }));
      },
      completeMilestone: (projectId) => {
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, milestonesCompleted: p.milestonesCompleted + 1 }
              : p
          ),
        }));
        useUserStore.getState().addXP(50);
      },
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
    }),
    { name: 'projects-storage' }
  )
);
