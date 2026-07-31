import { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Building2,
  Users,
  FolderKanban,
  X,
  Calendar,
  Globe,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { tenants } from '../utils/mockData';
import { showToast } from '../components/Toast';

export const Tenants = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<typeof tenants[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTenant, setConfigTenant] = useState<typeof tenants[0] | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState('labelRule');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<typeof tenants[0] | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
  });

  const filteredTenants = tenants.filter((tenant) => {
    const matchKeyword =
      !searchKeyword ||
      tenant.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = statusFilter === 'all' || tenant.status === parseInt(statusFilter);
    return matchKeyword && matchStatus;
  });

  const getStatusTag = (status: number) => {
    if (status === 1) {
      return <span className="tag tag-active">启用</span>;
    }
    return <span className="tag tag-inactive">停用</span>;
  };

  const handleToggleStatus = (tenantId: string, currentStatus: number) => {
    if (currentStatus === 1) {
      if (confirm('停用后该租户下所有用户将无法登录，确认停用？')) {
        alert('租户已停用');
      }
    } else {
      if (confirm('确认启用该租户？')) {
        alert('租户已启用');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setFormData({ name: '', contact: '', phone: '', email: '' });
    alert('租户创建成功');
  };

  const handleSaveConfig = () => {
    setShowConfigModal(false);
    showToast('租户配置保存成功', 'success');
  };

  const handleEditTenant = (tenant: typeof tenants[0]) => {
    setEditingTenant(tenant);
    setEditFormData({
      name: tenant.name,
      contact: tenant.contact,
      phone: tenant.phone,
      email: tenant.email,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditModal(false);
    setEditingTenant(null);
    showToast('租户信息更新成功', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">租户管理</h1>
          <p className="text-gray-500 mt-1">管理系统租户信息</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建租户
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索租户名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">全部状态</option>
            <option value="1">启用</option>
            <option value="0">停用</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">租户总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{tenants.length}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-700" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">启用租户</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {tenants.filter((t) => t.status === 1).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <ToggleRight className="w-5 h-5 text-success-700" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">停用租户</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {tenants.filter((t) => t.status === 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <ToggleLeft className="w-5 h-5 text-danger-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  租户名称
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  联系人
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  项目数
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  用户数
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="table-zebra">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4" onClick={() => setSelectedTenant(tenant)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-700" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-600 hover:text-primary-800">{tenant.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {tenant.phone}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {tenant.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                    <FolderKanban className="w-4 h-4 text-gray-400" />
                    {tenant.projectCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    {tenant.userCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusTag(tenant.status)}
                      <button
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          tenant.status === 1
                            ? 'text-success-600 hover:bg-success-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={tenant.status === 1 ? '停用' : '启用'}
                      >
                        {tenant.status === 1 ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tenant.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfigTenant(tenant);
                          setShowConfigModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="配置"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTenant(tenant);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" 
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors" title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            共 {filteredTenants.length} 条记录
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50">
              上一页
            </button>
            <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg font-medium">
              1
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
              下一页
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建租户</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  租户名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入租户名称"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="请输入联系人姓名"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入联系电话"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱地址"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedTenant.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusTag(selectedTenant.status)}
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-500">租户ID: {selectedTenant.id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">用户数量</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedTenant.userCount}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">项目数量</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedTenant.projectCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">联系信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">联系人</p>
                      <p className="font-medium text-gray-800">{selectedTenant.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">联系电话</p>
                      <p className="font-medium text-gray-800">{selectedTenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">邮箱地址</p>
                      <p className="font-medium text-gray-800">{selectedTenant.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">租户配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">数据隔离</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">独立数据库</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">存储空间</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">500 GB</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">最大用户数</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">无限制</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">API调用限制</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">1000次/分钟</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">时间信息</h3>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">创建时间</p>
                      <p className="text-sm font-medium text-gray-800">{selectedTenant.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">最后活跃</p>
                      <p className="text-sm font-medium text-gray-800">{selectedTenant.lastActive}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTenant(null)}
                className="btn-secondary"
              >
                关闭
              </button>
              <button
                onClick={() => handleToggleStatus(selectedTenant.id, selectedTenant.status)}
                className={`btn-primary flex items-center gap-2 ${
                  selectedTenant.status === 1 ? '' : 'bg-success-600 hover:bg-success-700'
                }`}
              >
                {selectedTenant.status === 1 ? (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    停用租户
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    启用租户
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfigModal && configTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-800">租户配置 - {configTenant.name}</h2>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-gray-100 px-6">
              {[
                { key: 'labelRule', label: '标注规则' },
                { key: 'layerStyle', label: '图层样式' },
                { key: 'drawingStandard', label: '出图规范' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveConfigTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeConfigTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeConfigTab === 'labelRule' && (
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">杆号规则配置</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          杆号前缀
                        </label>
                        <input
                          type="text"
                          placeholder="如：GZ"
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">杆塔编号前缀，如 GZ-001</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          编号起始值
                        </label>
                        <input
                          type="number"
                          placeholder="如：1"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          编号位数
                        </label>
                        <input
                          type="number"
                          placeholder="如：3"
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">编号数字位数，3位即 001</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          分隔符
                        </label>
                        <select className="input-field">
                          <option value="-">短横线 (-)</option>
                          <option value="_">下划线 (_)</option>
                          <option value="">无分隔符</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">路由编号规则</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          路由编号前缀
                        </label>
                        <input
                          type="text"
                          placeholder="如：RT"
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-1">路由编号前缀，如 RT-001</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          编号起始值
                        </label>
                        <input
                          type="number"
                          placeholder="如：1"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          编号位数
                        </label>
                        <input
                          type="number"
                          placeholder="如：3"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          分隔符
                        </label>
                        <select className="input-field">
                          <option value="-">短横线 (-)</option>
                          <option value="_">下划线 (_)</option>
                          <option value="">无分隔符</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">其他标注规则</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          台区编号前缀
                        </label>
                        <input
                          type="text"
                          placeholder="如：TQ"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          设备编号前缀
                        </label>
                        <input
                          type="text"
                          placeholder="如：SB"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigTab === 'layerStyle' && (
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">杆塔图层</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          图层名称
                        </label>
                        <input
                          type="text"
                          defaultValue="杆塔层"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          颜色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            defaultValue="#1E88E5"
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            defaultValue="#1E88E5"
                            className="input-field flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线型
                        </label>
                        <select className="input-field">
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线宽
                        </label>
                        <input
                          type="number"
                          defaultValue="2"
                          min="0.5"
                          max="10"
                          step="0.5"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">路由图层</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          图层名称
                        </label>
                        <input
                          type="text"
                          defaultValue="路由层"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          颜色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            defaultValue="#43A047"
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            defaultValue="#43A047"
                            className="input-field flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线型
                        </label>
                        <select className="input-field">
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线宽
                        </label>
                        <input
                          type="number"
                          defaultValue="2"
                          min="0.5"
                          max="10"
                          step="0.5"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">设备图层</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          图层名称
                        </label>
                        <input
                          type="text"
                          defaultValue="设备层"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          颜色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            defaultValue="#FB8C00"
                            className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            defaultValue="#FB8C00"
                            className="input-field flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线型
                        </label>
                        <select className="input-field">
                          <option value="solid">实线</option>
                          <option value="dashed">虚线</option>
                          <option value="dotted">点线</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          线宽
                        </label>
                        <input
                          type="number"
                          defaultValue="1.5"
                          min="0.5"
                          max="10"
                          step="0.5"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeConfigTab === 'drawingStandard' && (
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">图框模板</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          默认图框模板
                        </label>
                        <select className="input-field">
                          <option value="standard">标准图框</option>
                          <option value="wide">宽幅图框</option>
                          <option value="narrow">窄幅图框</option>
                          <option value="custom">自定义图框</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          图框比例
                        </label>
                        <select className="input-field">
                          <option value="1:500">1:500</option>
                          <option value="1:1000">1:1000</option>
                          <option value="1:2000">1:2000</option>
                          <option value="1:5000">1:5000</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">比例尺设置</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          默认比例尺
                        </label>
                        <select className="input-field">
                          <option value="1:500">1:500</option>
                          <option value="1:1000">1:1000</option>
                          <option value="1:2000">1:2000</option>
                          <option value="1:5000">1:5000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          可选比例尺
                        </label>
                        <select multiple className="input-field h-24">
                          <option value="1:200">1:200</option>
                          <option value="1:500" selected>1:500</option>
                          <option value="1:1000" selected>1:1000</option>
                          <option value="1:2000" selected>1:2000</option>
                          <option value="1:5000">1:5000</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">图纸规格</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          默认图纸规格
                        </label>
                        <select className="input-field">
                          <option value="A0">A0 (841 × 1189mm)</option>
                          <option value="A1">A1 (594 × 841mm)</option>
                          <option value="A2">A2 (420 × 594mm)</option>
                          <option value="A3">A3 (297 × 420mm)</option>
                          <option value="A4">A4 (210 × 297mm)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          允许使用规格
                        </label>
                        <select multiple className="input-field h-24">
                          <option value="A0" selected>A0</option>
                          <option value="A1" selected>A1</option>
                          <option value="A2" selected>A2</option>
                          <option value="A3">A3</option>
                          <option value="A4">A4</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveConfig}
                className="btn-primary"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingTenant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑租户</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingTenant(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  租户名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="请输入租户名称"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人
                </label>
                <input
                  type="text"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  placeholder="请输入联系人姓名"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="请输入联系电话"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="请输入邮箱地址"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingTenant(null); }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};