import { useState, useMemo } from 'react';
import {
  User,
  Lock,
  FileText,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { RoleMap, ActionTypeMap } from '../types';
import { showToast } from '../components/Toast';
import { operationLogs } from '../utils/mockData';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('info');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: '',
    phone: '',
    department: '技术部',
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [logDateRange, setLogDateRange] = useState({ start: '', end: '' });
  const [logStatusFilter, setLogStatusFilter] = useState('all');

  const tabs = [
    { id: 'info', label: '基本信息', icon: User },
    { id: 'password', label: '修改密码', icon: Lock },
    { id: 'logs', label: '我的日志', icon: FileText },
  ];

  const handleSaveProfile = () => {
    showToast('个人信息保存成功', 'success');
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: '弱', color: 'bg-danger-500' };
    if (score <= 2) return { level: 2, label: '中', color: 'bg-warning-500' };
    return { level: 3, label: '强', color: 'bg-success-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const isPasswordValid = useMemo(() => {
    if (!oldPassword || !newPassword || !confirmPassword) return false;
    if (newPassword.length < 8) return false;
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return false;
    if (newPassword !== confirmPassword) return false;
    if (oldPassword === newPassword) return false;
    return true;
  }, [oldPassword, newPassword, confirmPassword]);

  const handleChangePassword = () => {
    if (isPasswordValid) {
      showToast('密码修改成功', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const myLogs = useMemo(() => {
    if (!user) return [];
    return operationLogs.filter((log) => log.userId === user.id);
  }, [user]);

  const filteredLogs = useMemo(() => {
    return myLogs.filter((log) => {
      const matchStatus = logStatusFilter === 'all' || String(log.result) === logStatusFilter;
      const matchDate =
        (!logDateRange.start || log.createdAt >= logDateRange.start) &&
        (!logDateRange.end || log.createdAt <= logDateRange.end);
      return matchStatus && matchDate;
    });
  }, [myLogs, logStatusFilter, logDateRange]);

  const isMatch = confirmPassword && newPassword === confirmPassword;
  const isMismatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">个人中心</h1>
          <p className="text-gray-500 mt-1">管理您的账号信息和安全设置</p>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="flex gap-8">
              <div className="w-64 flex-shrink-0">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-800">{user?.name}</h3>
                  <span className="tag tag-completed mt-2">
                    {RoleMap[user?.role || ''] || '未知角色'}
                  </span>
                  {user?.tenantName && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      {user.tenantName}
                    </div>
                  )}
                  <div className="mt-6 w-full p-4 bg-gray-50 rounded-lg text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">登录账号</span>
                      <span className="font-medium text-gray-800">{user?.username}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">用户ID</span>
                      <span className="font-medium text-gray-800">{user?.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">基本信息</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      账号
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      readOnly
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="请输入邮箱地址"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      手机号
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="请输入手机号"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      所属部门
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      readOnly
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      系统角色
                    </label>
                    <input
                      type="text"
                      value={RoleMap[user?.role || ''] || ''}
                      readOnly
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      状态
                    </label>
                    <div className="input-field bg-gray-50 cursor-not-allowed flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success-500" />
                      <span className="text-gray-500">正常</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    保存修改
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    为了保障您的账号安全，建议定期修改密码。密码强度越高，账号越安全。
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  旧密码 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPwd ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入当前密码"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPwd(!showOldPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.level * 33.33}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.level === 1
                            ? 'text-danger-500'
                            : passwordStrength.level === 2
                            ? 'text-warning-500'
                            : 'text-success-500'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认新密码 <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isMatch && (
                  <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> 两次密码输入一致
                  </p>
                )}
                {isMismatch && (
                  <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> 两次密码输入不一致
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">密码要求：</span>
                  长度≥8位、包含字母和数字
                </p>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={!isPasswordValid}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                提交修改
              </button>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={logDateRange.start}
                  onChange={(e) => setLogDateRange({ ...logDateRange, start: e.target.value })}
                  className="input-field w-36"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={logDateRange.end}
                  onChange={(e) => setLogDateRange({ ...logDateRange, end: e.target.value })}
                  className="input-field w-36"
                />
                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="input-field w-28"
                >
                  <option value="all">全部状态</option>
                  <option value="1">成功</option>
                  <option value="0">失败</option>
                </select>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          操作类型
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          操作对象
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          结果
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          IP地址
                        </th>
                      </tr>
                    </thead>
                    <tbody className="table-zebra">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            暂无日志记录
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600">{log.createdAt}</td>
                            <td className="px-6 py-4">
                              <span className="tag tag-pending">
                                {ActionTypeMap[log.actionType] || log.actionType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{log.targetName}</td>
                            <td className="px-6 py-4">
                              {log.result === 1 ? (
                                <span className="tag tag-completed">成功</span>
                              ) : (
                                <span className="tag tag-exception">失败</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                              {log.ipAddress}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};