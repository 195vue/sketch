import { useState } from 'react';
import {
  FolderKanban,
  FileText,
  ClipboardList,
  Settings,
  Users,
  FileSearch,
  LogOut,
  Image,
  ChevronRight,
  ChevronDown,
  Eye,
  Building2,
  Users2,
  Download,
  Zap,
  History,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useNavigate, useLocation, type Location as RouterLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface MenuItem {
  id: string;
  path?: string;
  icon: React.ElementType;
  label: string;
  children?: MenuItem[];
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, exitProject, currentProject, setCurrentProject } = useStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['projects']);

  const isSuperAdmin = user?.role === 'super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin';
  const isProjectAdmin = user?.role === 'project_admin';
  const hasSystemAccess = isSuperAdmin || isTenantAdmin;

  const dynamicMenuItems: MenuItem[] = currentProject
    ? [
        { id: 'drawings', path: `/projects/${currentProject.id}/drawings`, icon: Image, label: '图纸管理' },
        ...((isSuperAdmin || isTenantAdmin || isProjectAdmin) ? [
          { id: 'members', path: `/projects/${currentProject.id}/members`, icon: Users2, label: '项目成员管理' },
        ] : []),
      ]
    : [];

  const systemMenuItems: MenuItem[] = [
    ...(isSuperAdmin ? [
      { id: 'system-users', path: '/system/users', icon: Users, label: '公司人员管理' },
      { id: 'system-tenants', path: '/system/tenants', icon: Building2, label: '租户管理' },
      { id: 'system-tasks', path: '/system/tasks', icon: ClipboardList, label: '并发任务管理' },
      { id: 'system-logs', path: '/system/logs', icon: History, label: '系统日志' },
      { id: 'system-dictionary', path: '/system/dictionary', icon: BookOpen, label: '字典管理' },
      { id: 'system-settings', path: '/system/settings', icon: Settings, label: '系统设置' },
    ] : isTenantAdmin ? [
      { id: 'system-users', path: '/system/users', icon: Users, label: '公司人员管理' },
      { id: 'system-tasks', path: '/system/tasks', icon: ClipboardList, label: '并发任务管理' },
      { id: 'system-logs', path: '/system/logs', icon: History, label: '系统日志' },
    ] : []),
  ];

  const renderMenuItem = (
    item: MenuItem,
    level: number = 0
  ) => {
    const Icon = item.icon;
    const isActive = item.path
      ? location.pathname === item.path ||
        (location.pathname.startsWith(item.path) && item.path !== '/')
      : false;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);

    const handleClick = () => {
      if (hasChildren) {
        if (isExpanded) {
          setExpandedMenus(expandedMenus.filter((id) => id !== item.id));
        } else {
          setExpandedMenus([...expandedMenus, item.id]);
        }
      } else if (item.path) {
        navigate(item.path);
      }
    };

    const paddingLeft = level === 0 ? 'px-4' : 'px-4 pl-12';

    return (
      <li key={item.id}>
        <button
          onClick={handleClick}
          className={`w-full flex items-center gap-3 ${paddingLeft} py-2.5 rounded-lg transition-all ${
            isActive
              ? 'bg-primary-700 text-white'
              : 'text-primary-200 hover:bg-primary-700/50'
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium flex-1 text-left">{item.label}</span>
          {hasChildren && (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && (
          <ul className={`space-y-1 ml-4 mt-1`}>
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExitProject = () => {
    exitProject();
    navigate('/projects');
  };

  return (
    <aside className="w-64 bg-primary-800 min-h-screen flex flex-col text-white">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI竣工图系统</h1>
            <p className="text-primary-300 text-xs">智能生成平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          <li key="projects-group">
            <button
              onClick={() => {
                navigate('/projects');
                const expanded = expandedMenus.includes('projects');
                if (!expanded) {
                  setExpandedMenus([...expandedMenus, 'projects']);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                location.pathname === '/projects'
                  ? 'bg-primary-700 text-white'
                  : (location.pathname.startsWith('/projects/') && !location.pathname.match(/\/projects\/[^/]+\/(drawings|members)/))
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-700/50'
              }`}
            >
              <FolderKanban className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1 text-left">项目管理</span>
              {expandedMenus.includes('projects') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {expandedMenus.includes('projects') && dynamicMenuItems.length > 0 && (
              <ul className="space-y-1 ml-4 mt-1">
                {dynamicMenuItems.map(item => renderMenuItem(item, 1))}
              </ul>
            )}
          </li>

          {hasSystemAccess && (
            <li key="system-group">
              <button
                onClick={() => {
                  const expanded = expandedMenus.includes('system');
                  setExpandedMenus(expanded ? expandedMenus.filter(id => id !== 'system') : [...expandedMenus, 'system']);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/system')
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-700/50'
                }`}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium flex-1 text-left">系统管理</span>
                {expandedMenus.includes('system') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.includes('system') && (
                <ul className="space-y-1 ml-4 mt-1">
                  {systemMenuItems.map(item => renderMenuItem(item, 1))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700 space-y-2">
        {currentProject && (
          <button
            onClick={handleExitProject}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-primary-200 hover:bg-primary-700/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">退出项目</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-primary-200 hover:bg-primary-700/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </aside>
  );
};
