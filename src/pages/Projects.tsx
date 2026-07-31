import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  FileText,
  X,
  Grid3X3,
  List,
  Users2,
  FolderKanban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProjectStatusMap } from '../types';
import { showToast } from '../components/Toast';

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

export const Projects = () => {
  const navigate = useNavigate();
  const { projects, setCurrentProject, filteredProjects: getFilteredProjects, drawings } = useStore();
  const projectList = getFilteredProjects();

  const getPendingReviewCount = (projectId: string) => {
    return drawings.filter((d) => d.projectId === projectId && d.status === 5).length;
  };
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<string[]>(['d1', 'd2', 'd3']);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    managerName: '',
    startDate: '',
    endDate: '',
    remark: '',
  });

  useEffect(() => {
    setCurrentProject(null);
  }, [setCurrentProject]);

  const filteredProjects = projectList.filter((project) => {
    const matchKeyword =
      !searchKeyword ||
      project.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = statusFilter === 'all' || project.status === parseInt(statusFilter);
    return matchKeyword && matchStatus;
  });

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <span className="tag tag-processing">{ProjectStatusMap[status]}</span>;
      case 2:
        return <span className="tag tag-completed">{ProjectStatusMap[status]}</span>;
      case 3:
        return <span className="tag tag-pending">{ProjectStatusMap[status]}</span>;
      case 4:
        return <span className="tag tag-exception">{ProjectStatusMap[status]}</span>;
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setFormData({
      name: '',
      address: '',
      managerName: '',
      startDate: '',
      endDate: '',
      remark: '',
    });
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/projects/${projectId}`);
    }
  };

  const handleOpenEditModal = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      address: project.address,
      managerName: project.managerName,
      startDate: project.startDate,
      endDate: project.endDate,
      remark: project.remark || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`项目 "${formData.name}" 修改成功`, 'success');
    setShowEditModal(false);
    setEditingProject(null);
    setFormData({
      name: '',
      address: '',
      managerName: '',
      startDate: '',
      endDate: '',
      remark: '',
    });
  };

  const handleOpenDeleteModal = (project: any) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProject) {
      showToast(`项目 "${deletingProject.name}" 删除成功`, 'success');
    }
    setShowDeleteModal(false);
    setDeletingProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">项目管理</h1>
          <p className="text-gray-500 mt-1">管理您的通信线路工程项目</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建项目
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索项目"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input-field pl-8 w-full"
              />
            </div>
          </div>
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">全部状态</option>
              <option value="1">进行中</option>
              <option value="2">已完成</option>
              <option value="3">已归档</option>
              <option value="4">已作废</option>
            </select>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    项目名称
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    工程地址
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    工期
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    图纸数
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    成员数
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
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectProject(project.id)}
                        className="font-medium text-primary-600 hover:text-primary-800 flex items-center gap-2"
                      >
                        <FolderKanban className="w-4 h-4" />
                        {project.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {project.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.managerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {project.startDate} ~ {project.endDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {project.drawingCount}
                      {getPendingReviewCount(project.id) > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          {getPendingReviewCount(project.id)}待审
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      {project.memberCount}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusTag(project.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSelectProject(project.id)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(project)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(project)}
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
              共 {filteredProjects.length} 条记录
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                上一页
              </button>
              <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg font-medium">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                2
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                下一页
              </button>
              <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded-lg">
                <option>10条/页</option>
                <option>20条/页</option>
                <option>50条/页</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center cursor-pointer"
                onClick={() => handleSelectProject(project.id)}
              >
                <FolderKanban className="w-16 h-16 text-primary-300" />
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3
                    className="font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    {project.name}
                  </h3>
                  {getPendingReviewCount(project.id) > 0 && (
                    <span
                      className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium flex items-center gap-1 cursor-pointer hover:bg-amber-200"
                      onClick={() => handleSelectProject(project.id)}
                      title="有待审核图纸"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {getPendingReviewCount(project.id)}待审
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" />
                  {project.address}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {project.drawingCount} 张图纸
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.memberCount} 位成员
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4 border-t border-gray-100 flex items-center justify-center gap-3">
                <button
                  onClick={() => handleSelectProject(project.id)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                  title="查看详情"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEditModal(project)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(project)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-danger-100 hover:text-danger-600 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建项目</h2>
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
                  项目名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="请输入项目名称"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工程地址
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="请输入工程地址"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  负责人
                </label>
                <select
                  value={formData.managerName}
                  onChange={(e) =>
                    setFormData({ ...formData, managerName: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">请选择负责人</option>
                  <option value="易裕丰">易裕丰</option>
                  <option value="张伟">张伟</option>
                  <option value="李娜">李娜</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="请输入项目备注"
                  rows={3}
                  className="input-field resize-none"
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑项目</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="请输入项目名称"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工程地址
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="请输入工程地址"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  负责人
                </label>
                <select
                  value={formData.managerName}
                  onChange={(e) =>
                    setFormData({ ...formData, managerName: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">请选择负责人</option>
                  <option value="易裕丰">易裕丰</option>
                  <option value="张伟">张伟</option>
                  <option value="李娜">李娜</option>
                  <option value="王强">王强</option>
                  <option value="刘洋">刘洋</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) =>
                    setFormData({ ...formData, remark: e.target.value })
                  }
                  placeholder="请输入项目备注"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProject(null);
                  }}
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

      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">删除项目</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProject(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-danger-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-danger-800 mb-1">确认删除此项目？</h3>
                  <p className="text-sm text-danger-700">
                    项目名称：<span className="font-medium">{deletingProject.name}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">警告：</span>删除操作将：
                </p>
                <ul className="text-sm text-gray-500 space-y-1 pl-4 list-disc">
                  <li>永久删除项目的所有配置信息</li>
                  <li>删除项目下所有图纸数据（草图、DWG文件等）</li>
                  <li>清除项目成员关联关系</li>
                  <li>删除项目相关的操作日志</li>
                </ul>
                <p className="text-sm text-danger-600 pt-2 font-medium">
                  此操作不可恢复，请谨慎操作！
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProject(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-danger-600 text-white font-medium hover:bg-danger-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
