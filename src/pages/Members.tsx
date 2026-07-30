import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  User,
  Mail,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Building2,
  History,
  Eye,
  Download,
  Upload,
  Settings,
  AlertCircle,
  FileText,
  Zap,
} from 'lucide-react';
import { members, projects, operationLogs } from '../utils/mockData';
import { RoleMap, ActionTypeMap, PermissionMap, RolePermissionMap, type ProjectPermission, type ProjectRole, type OnlineStatusMap } from '../types';
import { showToast } from '../components/Toast';
import { useStore } from '../store/useStore';

interface OrgTreeNode {
  id: string;
  name: string;
  type: 'department' | 'user';
  children?: OrgTreeNode[];
}

const orgTree: OrgTreeNode[] = [
  {
    id: 'd1',
    name: '技术部',
    type: 'department',
    children: [
      { id: 'u1', name: '易裕丰', type: 'user' },
      { id: 'u2', name: '张伟', type: 'user' },
      { id: 'u3', name: '李娜', type: 'user' },
    ],
  },
  {
    id: 'd2',
    name: '工程部',
    type: 'department',
    children: [
      { id: 'u4', name: '王强', type: 'user' },
      { id: 'u5', name: '刘洋', type: 'user' },
      { id: 'u6', name: '陈静', type: 'user' },
    ],
  },
  {
    id: 'd3',
    name: '运维部',
    type: 'department',
    children: [
      { id: 'u7', name: '赵伟', type: 'user' },
      { id: 'u8', name: '孙丽', type: 'user' },
    ],
  },
];

const permissionsList = [
  { key: 'upload', label: '上传', icon: Upload },
  { key: 'generate', label: '出图', icon: Download },
  { key: 'review', label: '审核', icon: Shield },
  { key: 'download', label: '下载', icon: Download },
  { key: 'delete', label: '删除', icon: Trash2 },
  { key: 'view', label: '查看', icon: Eye },
  { key: 'configure', label: '配置', icon: Settings },
];

export const Members = () => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);
  const projectMembers = members.filter((m) => m.projectId === id);
  const projectLogs = operationLogs.filter((l) => l.projectId === id);
  const { setCurrentProject, hasPermission, user } = useStore();

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'permissions' | 'logs'>('members');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>(['d1', 'd2', 'd3']);
  const [editingMember, setEditingMember] = useState<typeof members[0] | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, ProjectPermission[]>>(() => {
    const matrix: Record<string, ProjectPermission[]> = {};
    Object.keys(RolePermissionMap).forEach(role => {
      matrix[role] = [...RolePermissionMap[role as ProjectRole]];
    });
    return matrix;
  });
  const [showPermEditModal, setShowPermEditModal] = useState(false);
  const [editingPermRole, setEditingPermRole] = useState<ProjectRole | null>(null);

  const filteredMembers = projectMembers.filter((member) => {
    const matchesKeyword =
      member.userName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      member.userId.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesKeyword && matchesRole;
  });

  const getRoleTag = (role: string) => {
    const roleText = RoleMap[role] || role;
    const colors: Record<string, string> = {
      project_admin: 'bg-primary-100 text-primary-600',
      cartographer: 'bg-blue-100 text-blue-600',
      auditor: 'bg-green-100 text-green-600',
      browser: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role] || colors.browser}`}>
        {roleText}
      </span>
    );
  };

  const getStatusIcon = (onlineStatus: number) => {
    return onlineStatus === 1 ? (
      <CheckCircle className="w-4 h-4 text-success-500" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-300" />
    );
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((mId) => mId !== memberId) : [...prev, memberId]
    );
  };

  const handleOpenAddModal = () => {
    setSelectedUsers([]);
    setShowAddModal(true);
  };

  const handleOpenRoleModal = (member: typeof members[0]) => {
    setEditingMember(member);
    setEditingRole(member.role);
    setEditingPermissions([...member.permissions]);
    setShowRoleModal(true);
  };

  const handleToggleOrg = (orgId: string) => {
    setExpandedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((i) => i !== orgId) : [...prev, orgId]
    );
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
    );
  };

  const handleTogglePermission = (perm: string) => {
    setEditingPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleConfirmAddMembers = () => {
    if (selectedUsers.length > 0) {
      showToast(`成功将 ${selectedUsers.length} 名成员添加到项目`, 'success');
    }
    setShowAddModal(false);
    setSelectedUsers([]);
  };

  const handleSaveRole = () => {
    if (editingMember) {
      showToast(`成员 "${editingMember.userName}" 的角色已更新为 ${RoleMap[editingRole]}`, 'success');
    }
    setShowRoleModal(false);
    setEditingMember(null);
  };

  const handleBatchRemove = () => {
    if (selectedMembers.length > 0) {
      if (confirm(`确认移除选中的 ${selectedMembers.length} 名成员？`)) {
        showToast(`已移除 ${selectedMembers.length} 名成员`, 'success');
        setSelectedMembers([]);
      }
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('确认移除该成员？')) {
      showToast('成员已移除', 'success');
    }
  };

  const getPermissionIcon = (perm: ProjectPermission) => {
    const iconMap: Record<ProjectPermission, React.ReactNode> = {
      upload: <Upload className="w-4 h-4 text-gray-500" />,
      generate: <Zap className="w-4 h-4 text-gray-500" />,
      review: <CheckCircle className="w-4 h-4 text-gray-500" />,
      download: <Download className="w-4 h-4 text-gray-500" />,
      delete: <Trash2 className="w-4 h-4 text-gray-500" />,
      view: <Eye className="w-4 h-4 text-gray-500" />,
      configure: <Settings className="w-4 h-4 text-gray-500" />,
    };
    return iconMap[perm];
  };

  const getPermissionDescription = (perm: ProjectPermission) => {
    const descMap: Record<ProjectPermission, string> = {
      upload: '上传草图到项目指定目录',
      generate: '提交草图进行AI出图处理',
      review: '审核AI生成的图纸，通过或驳回',
      download: '下载生成的DWG图纸文件',
      delete: '删除草图或图纸文件',
      view: '查看、预览项目图纸',
      configure: '修改项目权限和配置',
    };
    return descMap[perm];
  };

  const renderOrgTree = (nodes: OrgTreeNode[]) => {
    return nodes.map((node) => (
      <li key={node.id}>
        {node.type === 'department' ? (
          <>
            <button
              onClick={() => handleToggleOrg(node.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
            >
              {expandedOrgs.includes(node.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Building2 className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-gray-700">{node.name}</span>
            </button>
            {expandedOrgs.includes(node.id) && node.children && (
              <ul className="ml-4 mt-1">
                {renderOrgTree(node.children)}
              </ul>
            )}
          </>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={selectedUsers.includes(node.id)}
              onChange={() => handleToggleUser(node.id)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{node.name}</span>
          </label>
        )}
      </li>
    ));
  };

  const onlineCount = projectMembers.filter((m) => m.onlineStatus === 1).length;
  const adminCount = projectMembers.filter((m) => m.role === 'project_admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">项目成员管理</h1>
          <p className="text-gray-500 mt-1">{project?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('configure') && (
          <button
            onClick={handleBatchRemove}
            disabled={selectedMembers.length === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            批量移除 ({selectedMembers.length})
          </button>
          )}
          {hasPermission('configure') && (
          <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加成员
          </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">总成员数</p>
              <p className="text-2xl font-bold text-gray-800">{projectMembers.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">在线成员</p>
              <p className="text-2xl font-bold text-success-600">{onlineCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">管理员</p>
              <p className="text-2xl font-bold text-blue-600">{adminCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">操作日志</p>
              <p className="text-2xl font-bold text-orange-600">{projectLogs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'members' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          成员列表
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'permissions' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          权限配置
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'logs' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          操作日志
        </button>
      </div>

      {activeTab === 'permissions' ? (
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">项目角色权限矩阵</h3>
                <p className="text-sm text-gray-500 mt-1">配置每个项目角色的默认权限，修改后将影响新分配该角色的成员</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const matrix: Record<string, ProjectPermission[]> = {};
                    Object.keys(RolePermissionMap).forEach(role => {
                      matrix[role] = [...RolePermissionMap[role as ProjectRole]];
                    });
                    setPermissionMatrix(matrix);
                    showToast('已恢复默认权限配置', 'info');
                  }}
                  className="btn-secondary text-sm"
                >
                  恢复默认
                </button>
                <button
                  onClick={() => showToast('权限配置已保存', 'success')}
                  className="btn-primary text-sm"
                >
                  保存配置
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-50 sticky left-0 z-10">
                      权限 \ 角色
                    </th>
                    {Object.entries(RoleMap).filter(([key]) => 
                      ['project_admin', 'cartographer', 'auditor', 'browser'].includes(key)
                    ).map(([key, value]) => (
                      <th key={key} className="text-center py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-50 min-w-[100px]">
                        {value}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(PermissionMap) as ProjectPermission[]).map((perm) => (
                    <tr key={perm} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700 font-medium bg-gray-50 sticky left-0 z-10">
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(perm)}
                          {PermissionMap[perm]}
                        </div>
                      </td>
                      {Object.keys(RolePermissionMap).filter(role =>
                        ['project_admin', 'cartographer', 'auditor', 'browser'].includes(role)
                      ).map((role) => {
                        const hasPerm = permissionMatrix[role]?.includes(perm);
                        return (
                          <td key={role} className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={hasPerm || false}
                              onChange={() => {
                                setPermissionMatrix(prev => {
                                  const current = prev[role] || [];
                                  const updated = hasPerm
                                    ? current.filter(p => p !== perm)
                                    : [...current, perm];
                                  return { ...prev, [role]: updated };
                                });
                              }}
                              className="w-4 h-4 text-primary-600 rounded cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-4">权限说明</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PermissionMap).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getPermissionIcon(key as ProjectPermission)}
                    <span className="font-medium text-gray-700">{value}</span>
                  </div>
                  <p className="text-sm text-gray-500">{getPermissionDescription(key as ProjectPermission)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-warning-50 border border-warning-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-warning-800 mb-1">权限变更提示</h4>
                <ul className="text-sm text-warning-700 space-y-1 list-disc pl-4">
                  <li>修改角色默认权限后，仅对新分配该角色的成员生效</li>
                  <li>已存在的成员权限需在成员列表中单独修改</li>
                  <li>关闭关键权限（如删除、配置）前请仔细评估影响范围</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'logs' ? (
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索操作日志..."
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作人
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
                    时间
                  </th>
                </tr>
              </thead>
              <tbody className="table-zebra">
                {projectLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ActionTypeMap[log.actionType] || log.actionType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.targetName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.result === 1 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                      }`}>
                        {log.result === 1 ? '成功' : '失败'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'members' ? (
        <div className="card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索姓名、账号..."
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
                {Object.entries(RoleMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers(filteredMembers.map((m) => m.id));
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                      className="w-4 h-4 text-primary-600"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">姓名</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">账号</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">角色</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">权限</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">当前操作</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">加入时间</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="w-4 h-4 text-primary-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-800">{member.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.userId}</td>
                    <td className="px-6 py-4">{getRoleTag(member.role)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((perm) => {
                          const permConfig = permissionsList.find((p) => p.key === perm);
                          return (
                            <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {permConfig?.label || perm}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`relative flex h-2.5 w-2.5`}>
                          {member.onlineStatus === 1 && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            member.onlineStatus === 1 ? 'bg-success-500' :
                            member.onlineStatus === 2 ? 'bg-warning-500' : 'bg-gray-300'
                          }`}></span>
                        </span>
                        <span className={`text-sm ${
                          member.onlineStatus === 1 ? 'text-success-600' :
                          member.onlineStatus === 2 ? 'text-warning-600' : 'text-gray-400'
                        }`}>
                          {member.onlineStatus === 1 ? '在线' : member.onlineStatus === 2 ? '忙碌' : '离线'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.currentAction || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.joinedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('configure') && (
                        <button
                          onClick={() => handleOpenRoleModal(member)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="角色分配"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        )}
                        {hasPermission('configure') && (
                        <button
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        )}
                        {hasPermission('configure') && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="移除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">添加项目成员</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  公司组织架构
                </h3>
                <ul className="space-y-1 max-h-80 overflow-y-auto">
                  {renderOrgTree(orgTree)}
                </ul>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  已选择成员 ({selectedUsers.length})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedUsers.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">请从左侧选择成员</p>
                  ) : (
                    selectedUsers.map((userId) => {
                      const findUser = (nodes: OrgTreeNode[]): OrgTreeNode | null => {
                        for (const node of nodes) {
                          if (node.id === userId) return node;
                          if (node.children) {
                            const found = findUser(node.children);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      const user = findUser(orgTree);
                      return (
                        <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{user?.name}</span>
                          </div>
                          <button
                            onClick={() => handleToggleUser(userId)}
                            className="text-gray-400 hover:text-danger-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-600">
                    新添加的成员默认角色为「浏览员」，如需修改角色请在成员列表中操作
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddMembers}
                className="btn-primary"
                disabled={selectedUsers.length === 0}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">角色与权限设置</h2>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">成员信息</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{editingMember.userName}</p>
                    <p className="text-sm text-gray-500">{editingMember.userId}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">项目角色</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(RoleMap).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        editingRole === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={key}
                        checked={editingRole === key}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className={`font-medium ${editingRole === key ? 'text-primary-700' : 'text-gray-700'}`}>
                        {value}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">权限细分</label>
                <div className="grid grid-cols-3 gap-3">
                  {permissionsList.map((perm) => {
                    const Icon = perm.icon;
                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          editingPermissions.includes(perm.key)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes(perm.key)}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <Icon className={`w-4 h-4 ${editingPermissions.includes(perm.key) ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${editingPermissions.includes(perm.key) ? 'text-primary-700' : 'text-gray-600'}`}>
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSaveRole} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};