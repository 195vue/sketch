import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, EyeOff, Loader2, Shield, UserCheck, Edit3, EyeIcon, CheckCircle, Building } from 'lucide-react';
import { useStore } from '../store/useStore';

interface RoleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '平台方管理员，管理所有租户和系统配置',
    icon: <Shield className="w-5 h-5" />,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'tenant_admin',
    name: '租户管理员',
    description: '运营商管理员，管理本租户下的项目和人员',
    icon: <Building className="w-5 h-5" />,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'project_admin',
    name: '项目管理员',
    description: '本项目全权限：上传、出图、审核、下载等',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'auditor',
    name: '审核员',
    description: '专门负责审核图纸，可查看、下载，不可出图',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'cartographer',
    name: '制图员',
    description: '上传草图、AI出图、下载，不可审核',
    icon: <Edit3 className="w-5 h-5" />,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'browser',
    name: '浏览者',
    description: '仅可查看项目和图纸',
    icon: <EyeIcon className="w-5 h-5" />,
    color: 'from-gray-500 to-gray-600',
  },
];

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('super_admin');

  const navigate = useNavigate();
  const { login } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    login(username || 'admin', password || '123456', selectedRole);
    navigate('/projects');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 via-primary-700 to-accent-600 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">AI竣工图智能生成系统</h1>
            <p className="text-primary-200 text-sm">基于AI识别与规则引导的运营商线路竣工图智能生成平台</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">选择登录角色</label>
                <div className="grid grid-cols-5 gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        selectedRole === role.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={role.description}
                    >
                      <div
                        className={`w-8 h-8 mx-auto mb-1 rounded-full bg-gradient-to-br ${role.color} text-white flex items-center justify-center`}
                      >
                        {role.icon}
                      </div>
                      <span className={`text-xs font-medium block ${
                        selectedRole === role.id ? 'text-primary-600' : 'text-gray-600'
                      }`}>
                        {role.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <span className="font-medium">{roleOptions.find((r) => r.id === selectedRole)?.name}：</span>
                  {roleOptions.find((r) => r.id === selectedRole)?.description}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-800 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>提示：任意输入用户名和密码即可登录体验，请选择对应角色</p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          Copyright 2024 AI竣工图智能生成系统 All Rights Reserved
        </p>
      </div>
    </div>
  );
};
