import { create } from 'zustand';
import { User, Project, Drawing, Task } from '../types';
import { currentUser, projects, drawings, tasks } from '../utils/mockData';

interface Store {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string, selectedRole?: string) => boolean;
  logout: () => void;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  exitProject: () => void;
  drawings: Drawing[];
  tasks: Task[];
  addDrawing: (drawing: Omit<Drawing, 'id'>) => void;
  updateDrawingStatus: (id: string, status: number) => void;
  reviewDrawing: (id: string, result: 'pass' | 'reject', rejectReason?: string) => void;
  resubmitDrawing: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskResubmit: (id: string) => void;
  filteredProjects: () => Project[];
  filteredDrawings: () => Drawing[];
  filteredTasks: () => Task[];
  hasPermission: (permission: string) => boolean;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  isLoggedIn: false,
  login: (username, password, selectedRole) => {
    let role = selectedRole || 'super_admin';
    if (username === 'user') {
      role = 'cartographer';
    }
    // 不同角色对应不同的租户和用户信息
    let loginUser: User;
    if (role === 'tenant_admin') {
      loginUser = {
        ...currentUser,
        id: 'u002',
        name: '李梦洁',
        username: username || 'tenant',
        role,
        tenantId: 't002',
        tenantName: '中国联通',
      };
    } else if (role === 'cartographer') {
      loginUser = {
        ...currentUser,
        id: 'u003',
        name: '张伟',
        username: username || 'user',
        role,
        tenantId: 't001',
        tenantName: '中国移动',
      };
    } else if (role === 'auditor') {
      loginUser = {
        ...currentUser,
        id: 'u004',
        name: '陈静',
        username: username || 'auditor',
        role,
        tenantId: 't001',
        tenantName: '中国移动',
      };
    } else {
      // super_admin, project_admin, browser
      loginUser = {
        ...currentUser,
        id: 'u001',
        name: '易裕丰',
        username: username || 'admin',
        role,
        tenantId: 't001',
        tenantName: '中国移动',
      };
    }
    set({ user: loginUser, isLoggedIn: true, currentProject: null });
    return true;
  },
  logout: () => {
    set({ user: null, isLoggedIn: false, currentProject: null });
  },
  exitProject: () => set({ currentProject: null }),
  projects,
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  drawings,
  tasks,
  addDrawing: (drawing) =>
    set((state) => ({
      drawings: [
        {
          ...drawing,
          id: `f${Date.now()}`,
        },
        ...state.drawings,
      ],
    })),
  updateDrawingStatus: (id, status) =>
    set((state) => ({
      drawings: state.drawings.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),
  reviewDrawing: (id, result, rejectReason) =>
    set((state) => {
      const { user } = get();
      return {
        drawings: state.drawings.map((d) =>
          d.id === id
            ? {
                ...d,
                status: result === 'pass' ? 3 : 6,
                reviewedAt: new Date().toISOString(),
                reviewerId: user?.id,
                reviewerName: user?.name,
                rejectReason: result === 'reject' ? rejectReason : undefined,
              }
            : d
        ),
      };
    }),
  resubmitDrawing: (id) =>
    set((state) => ({
      drawings: state.drawings.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 2,
              rejectReason: undefined,
              reviewedAt: undefined,
              reviewerId: undefined,
              reviewerName: undefined,
            }
          : d
      ),
    })),
  addTask: (task) =>
    set((state) => ({
      tasks: [
        {
          ...task,
          id: `task${Date.now()}`,
        },
        ...state.tasks,
      ],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  toggleTaskResubmit: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 1,
              stage: '',
              progress: 0,
              retryCount: t.retryCount + 1,
            }
          : t
      ),
    })),
  filteredProjects: () => {
    const { user } = get();
    if (!user) return [];
    if (user.role === 'super_admin') return projects;
    if (user.role === 'tenant_admin') return projects.filter(p => p.tenantId === user.tenantId);
    return projects;
  },
  filteredDrawings: () => {
    const { user } = get();
    if (!user) return [];
    return drawings;
  },
  filteredTasks: () => {
    const { user } = get();
    if (!user) return [];
    if (user.role === 'super_admin') return tasks;
    if (user.role === 'tenant_admin') return tasks.filter(t => {
      const proj = projects.find(p => p.id === t.projectId);
      return proj?.tenantId === user.tenantId;
    });
    return tasks;
  },
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (user.role === 'tenant_admin') {
      // 租户管理员：可管理本租户的项目、人员、查看日志，但不能管理系统配置
      const tenantAdminPermissions = ['view', 'download', 'configure'];
      return tenantAdminPermissions.includes(permission);
    }
    if (user.role === 'project_admin') {
      return ['upload', 'generate', 'review', 'download', 'delete', 'view', 'configure'].includes(permission);
    }
    if (user.role === 'cartographer') {
      return ['upload', 'generate', 'download', 'delete', 'view'].includes(permission);
    }
    if (user.role === 'auditor') {
      return ['review', 'download', 'view'].includes(permission);
    }
    if (user.role === 'browser') {
      return ['view'].includes(permission);
    }
    return false;
  },
}));