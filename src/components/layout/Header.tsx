import { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { RoleMap } from '../../types';

export const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);

  const unreadCount = 3;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const previewNotifications = [
    { id: 'n1', type: 'drawing_completed', title: '出图完成', content: '图纸"干线-杆路图-A区"已生成DWG文件', time: '5分钟前', read: false },
    { id: 'n2', type: 'task_exception', title: '任务异常', content: '图纸"配线-光缆图-B区"处理失败，请查看原因', time: '30分钟前', read: false },
    { id: 'n3', type: 'member_added', title: '成员添加', content: '您被添加到项目"成都干线光缆工程"', time: '1小时前', read: false },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">AI竣工图智能生成系统</div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {user?.tenantName && (
            <span className="text-sm text-gray-600">
              当前租户: <span className="font-medium text-primary-800">{user.tenantName}</span>
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotificationPreview(!showNotificationPreview)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotificationPreview && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationPreview(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-medium text-gray-800">消息通知</span>
                  <button
                    onClick={() => {
                      setShowNotificationPreview(false);
                      navigate('/notifications');
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    查看全部
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {previewNotifications.map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => {
                        setShowNotificationPreview(false);
                        navigate('/notifications');
                      }}
                      className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">{notice.title}</span>
                            <span className="text-xs text-gray-400">{notice.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{notice.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowNotificationPreview(false);
                    navigate('/notifications');
                  }}
                  className="w-full p-3 text-sm text-primary-600 hover:bg-gray-50 border-t border-gray-100"
                >
                  还有更多通知，点击查看
                </button>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-700" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{RoleMap[user?.role || '']}</p>
            </div>
          </button>
          
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.tenantName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  个人中心
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/notifications');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  消息通知
                </button>
                {(user?.role === 'super_admin') && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/system/settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    系统设置
                  </button>
                )}
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-danger-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};