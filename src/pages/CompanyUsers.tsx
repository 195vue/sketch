import { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Building2,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Save,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { RoleMap, SystemRoles, getAssignableSystemRoles } from '../types';
import { showToast } from '../components/Toast';
import { useStore } from '../store/useStore';

interface OrgTreeNode {
  id: string;
  name: string;
  type: 'department' | 'user';
  parentId?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: number;
  children?: OrgTreeNode[];
}

const orgTree: OrgTreeNode[] = [
  {
    id: 'd1',
    name: '技术部',
    type: 'department',
    children: [
      { id: 'u1', name: '易裕丰', type: 'user', email: 'yiyufeng@example.com', phone: '13800138001', role: 'super_admin', status: 1 },
      { id: 'u2', name: '张伟', type: 'user', email: 'zhangwei@example.com', phone: '13800138002', role: 'tenant_admin', status: 1 },
      { id: 'u3', name: '李娜', type: 'user', email: 'lina@example.com', phone: '13800138003', role: 'project_admin', status: 0 },
    ],
  },
  {
    id: 'd2',
    name: '工程部',
    type: 'department',
    children: [
      { id: 'u4', name: '王强', type: 'user', email: 'wangqiang@example.com', phone: '13800138004', role: 'cartographer', status: 1 },
      { id: 'u5', name: '刘洋', type: 'user', email: 'liuyang@example.com', phone: '13800138005', role: 'cartographer', status: 1 },
      { id: 'u6', name: '陈静', type: 'user', email: 'chenjing@example.com', phone: '13800138006', role: 'auditor', status: 1 },
    ],
  },
  {
    id: 'd3',
    name: '运维部',
    type: 'department',
    children: [
      { id: 'u7', name: '赵伟', type: 'user', email: 'zhaowei@example.com', phone: '13800138007', role: 'browser', status: 0 },
      { id: 'u8', name: '孙丽', type: 'user', email: 'sunli@example.com', phone: '13800138008', role: 'browser', status: 1 },
    ],
  },
];

export const CompanyUsers = () => {
  const { user } = useStore();
  const assignableRoles = getAssignableSystemRoles(user?.role || '');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>(['d1', 'd2', 'd3']);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'browser',
    department: 'd1',
  });
  const [editingUser, setEditingUser] = useState<OrgTreeNode | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleEditingUser, setRoleEditingUser] = useState<OrgTreeNode | null>(null);
  const [selectedSystemRole, setSelectedSystemRole] = useState('');

  const getAllUsers = (nodes: OrgTreeNode[]): OrgTreeNode[] => {
    let users: OrgTreeNode[] = [];
    for (const node of nodes) {
      if (node.type === 'user') {
        users.push(node);
      }
      if (node.children) {
        users = [...users, ...getAllUsers(node.children)];
      }
    }
    return users;
  };

  const allUsers = getAllUsers(orgTree);

  const filteredUsers = allUsers.filter((user) => {
    const matchesKeyword =
      user.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.phone?.includes(searchKeyword);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === parseInt(statusFilter);
    const matchesDept = !selectedDept || findUserDept(user.id) === selectedDept;
    return matchesKeyword && matchesRole && matchesStatus && matchesDept;
  });

  const findUserDept = (userId: string): string | null => {
    for (const dept of orgTree) {
      if (dept.children?.some((u) => u.id === userId)) {
        return dept.id;
      }
    }
    return null;
  };

  const getDeptName = (deptId: string): string => {
    const dept = orgTree.find((d) => d.id === deptId);
    return dept?.name || '-';
  };

  const getRoleTag = (role: string | undefined) => {
    if (!role) return null;
    const roleText = RoleMap[role] || role;
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-600',
      tenant_admin: 'bg-indigo-100 text-indigo-600',
      project_admin: 'bg-blue-100 text-blue-600',
      cartographer: 'bg-green-100 text-green-600',
      auditor: 'bg-yellow-100 text-yellow-600',
      browser: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role] || colors.browser}`}>
        {roleText}
      </span>
    );
  };

  const getStatusIcon = (status: number | undefined) => {
    return status === 1 ? (
      <CheckCircle className="w-4 h-4 text-success-500" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-300" />
    );
  };

  const handleToggleOrg = (orgId: string) => {
    setExpandedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((i) => i !== orgId) : [...prev, orgId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`用户 "${formData.name}" 创建成功`, 'success');
    setShowModal(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'browser',
      department: 'd1',
    });
  };

  const handleOpenEditModal = (user: OrgTreeNode) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.id,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'browser',
      department: findUserDept(user.id) || 'd1',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    showToast(`用户 "${editingUser?.name}" 信息已更新`, 'success');
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (user: OrgTreeNode) => {
    const newStatus = user.status === 1 ? 0 : 1;
    showToast(`用户 "${user.name}" 已${newStatus === 1 ? '启用' : '停用'}`, 'success');
  };

  const handleDeleteUser = (user: OrgTreeNode) => {
    if (confirm(`确认删除用户 "${user.name}"？`)) {
      showToast('用户已删除', 'success');
    }
  };

  const handleOpenRoleModal = (user: OrgTreeNode) => {
    setRoleEditingUser(user);
    setSelectedSystemRole(user.role === 'super_admin' || user.role === 'tenant_admin' ? user.role : 'user');
    setShowRoleModal(true);
  };

  const handleSaveRole = () => {
    if (!roleEditingUser || !selectedSystemRole) return;
    showToast(`用户 "${roleEditingUser.name}" 角色已更新为${RoleMap[selectedSystemRole]}`, 'success');
    setShowRoleModal(false);
    setRoleEditingUser(null);
    setSelectedSystemRole('');
  };

  const renderOrgTree = (nodes: OrgTreeNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        {node.type === 'department' ? (
          <>
            <button
              onClick={() => {
                handleToggleOrg(node.id);
                setSelectedDept(selectedDept === node.id ? null : node.id);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedDept === node.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span style={{ paddingLeft: `${level * 12}px` }} />
              {expandedOrgs.includes(node.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Building2 className="w-4 h-4 text-primary-500" />
              <span>{node.name}</span>
              <span className="ml-auto text-xs text-gray-400">
                {node.children?.filter((c) => c.type === 'user').length}人
              </span>
            </button>
            {expandedOrgs.includes(node.id) && node.children && (
              <div className="ml-0">
                {renderOrgTree(node.children, level + 1)}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => handleOpenEditModal(node)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <span style={{ paddingLeft: `${level * 12}px` }} />
            <span className="w-4" />
            <User className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-left">{node.name}</span>
            {getStatusIcon(node.status)}
          </button>
        )}
      </div>
    ));
  };

  const totalUserCount = allUsers.length;
  const activeUserCount = allUsers.filter((u) => u.status === 1).length;
  const adminCount = allUsers.filter((u) => u.role === 'super_admin' || u.role === 'tenant_admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">公司人员管理</h1>
          <p className="text-gray-500 mt-1">管理公司组织架构和用户账号</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建用户
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">用户总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalUserCount}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-700" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">启用用户</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{activeUserCount}</p>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-700" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">管理员</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{adminCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                组织架构
              </h3>
              <button
                onClick={() => setSelectedDept(null)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  selectedDept === null ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                全部
              </button>
            </div>
            <div className="p-2">
              {renderOrgTree(orgTree)}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索姓名、邮箱、电话..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field w-40"
                >
                  <option value="all">全部角色</option>
                  {SystemRoles.map(({ key, label }) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field w-36"
                >
                  <option value="all">全部状态</option>
                  <option value="1">启用</option>
                  <option value="0">停用</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      账号
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      所属部门
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      联系方式
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="table-zebra">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getDeptName(findUserDept(user.id) || '')}
                      </td>
                      <td className="px-6 py-4">{getRoleTag(user.role)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.email && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {user.email}
                            </span>
                          )}
                          {user.phone && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className={`text-sm ${user.status === 1 ? 'text-success-600' : 'text-gray-400'}`}>
                            {user.status === 1 ? '启用' : '停用'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="角色设置"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className="p-2 rounded-lg transition-colors"
                            title={user.status === 1 ? '停用' : '启用'}
                          >
                            {user.status === 1 ? (
                              <ToggleRight className="w-5 h-5 text-success-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="删除"
                          >
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
                共 {filteredUsers.length} 条记录
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
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建用户</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">账号 *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所属部门 *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                    required
                  >
                    {orgTree.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">角色 *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    {assignableRoles.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
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

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑用户</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">账号</label>
                  <input
                    type="text"
                    value={formData.username}
                    className="input-field"
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱 *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所属部门</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                  >
                    {orgTree.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">角色 *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    {assignableRoles.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && roleEditingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                角色设置
              </h2>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{roleEditingUser.name}</span>
                    {getRoleTag(roleEditingUser.role)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {getDeptName(findUserDept(roleEditingUser.id) || '')} · {roleEditingUser.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">系统级角色</label>
              <div className="space-y-2">
                {assignableRoles.map((role) => (
                  <label
                    key={role.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSystemRole === role.key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="systemRole"
                      value={role.key}
                      checked={selectedSystemRole === role.key}
                      onChange={(e) => setSelectedSystemRole(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{role.label}</div>
                      <div className="text-sm text-gray-500">
                        {role.key === 'super_admin' ? '拥有系统所有权限，可管理全部功能' :
                         role.key === 'tenant_admin' ? '拥有租户管理权限，可管理租户内用户和数据' : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {assignableRoles.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">您当前没有可分配的角色权限</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowRoleModal(false)} className="btn-secondary">
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};