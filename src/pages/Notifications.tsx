import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  ArrowLeft,
  CheckCheck,
  Trash2,
  Eye,
  FileCheck,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Shield,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { showToast } from '../components/Toast';

type NotificationType =
  | 'drawing_completed'
  | 'drawing_failed'
  | 'task_exception'
  | 'member_added'
  | 'member_removed'
  | 'role_changed'
  | 'system_notice';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  projectId?: string;
  projectName?: string;
  drawingId?: string;
  drawingName?: string;
  isRead: boolean;
  createdAt: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'n001',
    type: 'drawing_completed',
    title: '出图完成',
    content: '图纸「杆路图-A001」已成功生成DWG文件，可进行预览和下载。',
    projectId: 'p001',
    projectName: '北京市朝阳区通信线路改造项目',
    drawingId: 'f001',
    drawingName: '杆路图-A001',
    isRead: false,
    createdAt: '2024-06-08 15:30:00',
  },
  {
    id: 'n002',
    type: 'drawing_failed',
    title: '出图失败',
    content: '图纸「分纤点图-F001」AI处理过程中出现异常，原因：图像质量过低。',
    projectId: 'p001',
    projectName: '北京市朝阳区通信线路改造项目',
    drawingId: 'f005',
    drawingName: '分纤点图-F001',
    isRead: false,
    createdAt: '2024-06-08 14:20:00',
  },
  {
    id: 'n003',
    type: 'task_exception',
    title: '任务异常',
    content: '任务「光缆路由图-R001」在AI识别阶段出现异常，已重试2次。',
    projectId: 'p001',
    projectName: '北京市朝阳区通信线路改造项目',
    drawingId: 'f003',
    drawingName: '光缆路由图-R001',
    isRead: false,
    createdAt: '2024-06-08 11:00:00',
  },
  {
    id: 'n004',
    type: 'member_added',
    title: '成员添加',
    content: '「王强」已加入项目「北京市朝阳区通信线路改造项目」，角色为浏览员。',
    projectId: 'p001',
    projectName: '北京市朝阳区通信线路改造项目',
    isRead: true,
    createdAt: '2024-06-07 16:45:00',
  },
  {
    id: 'n005',
    type: 'role_changed',
    title: '角色变更',
    content: '您的角色已从「制图员」变更为「项目管理员」。',
    isRead: true,
    createdAt: '2024-06-07 10:30:00',
  },
  {
    id: 'n006',
    type: 'system_notice',
    title: '系统公告',
    content: '系统将于2024年6月15日凌晨2:00-4:00进行维护升级，期间系统不可用。',
    isRead: false,
    createdAt: '2024-06-06 09:00:00',
  },
  {
    id: 'n007',
    type: 'member_removed',
    title: '成员移除',
    content: '「孙丽」已从项目「上海市浦东新区光缆铺设项目」中移除。',
    projectId: 'p002',
    projectName: '上海市浦东新区光缆铺设项目',
    isRead: true,
    createdAt: '2024-06-05 14:00:00',
  },
  {
    id: 'n008',
    type: 'drawing_completed',
    title: '出图完成',
    content: '图纸「陆家嘴光缆分布图」已成功生成DWG文件。',
    projectId: 'p002',
    projectName: '上海市浦东新区光缆铺设项目',
    drawingId: 'f007',
    drawingName: '陆家嘴光缆分布图',
    isRead: true,
    createdAt: '2024-06-05 10:30:00',
  },
  {
    id: 'n009',
    type: 'task_exception',
    title: '任务异常',
    content: '任务「竣工总图」在预处理阶段出现异常，请检查原图质量。',
    projectId: 'p001',
    projectName: '北京市朝阳区通信线路改造项目',
    drawingId: 'f006',
    drawingName: '竣工总图',
    isRead: true,
    createdAt: '2024-06-04 16:15:00',
  },
  {
    id: 'n010',
    type: 'system_notice',
    title: '系统公告',
    content: 'AI识别引擎已升级至v2.5版本，识别准确率提升至95.6%。',
    isRead: true,
    createdAt: '2024-06-01 08:00:00',
  },
];

const tabs = [
  { key: 'all', label: '全部', type: null as NotificationType | null },
  { key: 'drawing_completed', label: '出图完成', type: 'drawing_completed' as NotificationType },
  { key: 'drawing_failed', label: '出图失败', type: 'drawing_failed' as NotificationType },
  { key: 'task_exception', label: '任务异常', type: 'task_exception' as NotificationType },
  { key: 'member_changed', label: '成员变更', type: null as NotificationType | null },
  { key: 'system_notice', label: '系统公告', type: 'system_notice' as NotificationType },
];

const getTypeConfig = (type: NotificationType) => {
  switch (type) {
    case 'drawing_completed':
      return {
        icon: FileCheck,
        iconBg: 'bg-success-100',
        iconColor: 'text-success-600',
        borderColor: 'border-l-success-500',
      };
    case 'drawing_failed':
      return {
        icon: AlertTriangle,
        iconBg: 'bg-danger-100',
        iconColor: 'text-danger-600',
        borderColor: 'border-l-danger-500',
      };
    case 'task_exception':
      return {
        icon: AlertTriangle,
        iconBg: 'bg-warning-100',
        iconColor: 'text-warning-600',
        borderColor: 'border-l-warning-500',
      };
    case 'member_added':
      return {
        icon: UserPlus,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-l-blue-500',
      };
    case 'member_removed':
      return {
        icon: UserMinus,
        iconBg: 'bg-warning-100',
        iconColor: 'text-warning-600',
        borderColor: 'border-l-warning-500',
      };
    case 'role_changed':
      return {
        icon: Shield,
        iconBg: 'bg-accent-100',
        iconColor: 'text-accent-600',
        borderColor: 'border-l-accent-500',
      };
    case 'system_notice':
      return {
        icon: Bell,
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        borderColor: 'border-l-primary-500',
      };
  }
};

const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return date.toDateString() === today.toDateString();
};

const isThisWeek = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
};

export const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const todayCount = notifications.filter((n) => isToday(n.createdAt)).length;
  const weekCount = notifications.filter((n) => isThisWeek(n.createdAt)).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'member_changed') {
      return n.type === 'member_added' || n.type === 'member_removed';
    }
    return n.type === activeTab;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('已全部标记为已读', 'success');
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('通知已删除', 'success');
  };

  const handleView = (notification: Notification) => {
    handleMarkRead(notification.id);

    switch (notification.type) {
      case 'drawing_completed':
        if (notification.projectId && notification.drawingId) {
          navigate(`/projects/${notification.projectId}/drawings/${notification.drawingId}/dwg-preview`);
        }
        break;
      case 'drawing_failed':
        if (notification.projectId) {
          navigate(`/projects/${notification.projectId}/drawings`);
        }
        break;
      case 'task_exception':
        navigate('/system/tasks');
        break;
      case 'member_added':
      case 'member_removed':
        if (notification.projectId) {
          navigate(`/projects/${notification.projectId}/members`);
        }
        break;
      case 'role_changed':
        navigate('/profile');
        break;
      case 'system_notice':
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
            <p className="text-gray-500 mt-1">查看系统消息和通知</p>
          </div>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <CheckCheck className="w-4 h-4" />
          全部标为已读
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">未读消息</p>
              <p className="text-3xl font-bold text-primary-800 mt-2">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-700" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">今日消息</p>
              <p className="text-3xl font-bold text-success-600 mt-2">{todayCount}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">本周消息</p>
              <p className="text-3xl font-bold text-accent-600 mt-2">{weekCount}</p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <BellOff className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-100 px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">暂无通知</p>
            <p className="text-gray-400 text-sm mt-1">当前分类下没有相关消息</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const config = getTypeConfig(notification.type);
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={`flex gap-4 p-4 border-l-4 ${config.borderColor} transition-colors ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50/40'
                  } hover:bg-gray-50`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {notification.createdAt}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {notification.content}
                    </p>

                    {(notification.projectName || notification.drawingName) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        {notification.projectName && (
                          <span className="inline-flex items-center gap-1">
                            <FolderKanban className="w-3 h-3" />
                            {notification.projectName}
                          </span>
                        )}
                        {notification.drawingName && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>{notification.drawingName}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleView(notification)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-danger-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};