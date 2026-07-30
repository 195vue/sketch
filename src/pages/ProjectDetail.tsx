import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  Clock,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Circle,
  X,
  AlertCircle,
  History,
  Activity,
  FolderKanban,
  Shield,
  FileStack,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import { projects, members, drawings, operationLogs } from '../utils/mockData';
import { ProjectStatusMap, ActionTypeMap } from '../types';
import { showToast } from '../components/Toast';
import { useStore } from '../store/useStore';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentProject } = useStore();
  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);
  const projectMembers = members.filter((m) => m.projectId === id);
  const projectDrawings = drawings.filter((d) => d.projectId === id);
  const projectLogs = operationLogs.filter((l) => l.projectId === id);

  const [isEditing, setIsEditing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLogDetail, setShowLogDetail] = useState<typeof operationLogs[0] | null>(null);
  const [currentStatus, setCurrentStatus] = useState(project?.status || 1);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    address: project?.address || '',
    managerName: project?.managerName || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    remark: project?.remark || '',
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">项目不存在</p>
      </div>
    );
  }

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

  const getStatusTransitions = (status: number) => {
    switch (status) {
      case 1:
        return [
          { value: 2, label: '已完成', description: '项目已完成全部工作' },
          { value: 4, label: '已作废', description: '项目不再继续，不可恢复' },
        ];
      case 2:
        return [
          { value: 3, label: '已归档', description: '项目归档后变为只读状态' },
          { value: 4, label: '已作废', description: '项目不再继续，不可恢复' },
        ];
      case 3:
        return [];
      case 4:
        return [];
      default:
        return [];
    }
  };

  const handleStatusChange = (newStatus: number) => {
    const transition = getStatusTransitions(currentStatus).find((t) => t.value === newStatus);
    if (!transition) return;

    let confirmMsg = '';
    if (newStatus === 3) {
      confirmMsg = '确认将项目归档？归档后项目将变为只读状态，无法进行任何编辑操作。';
    } else if (newStatus === 4) {
      confirmMsg = '确认将项目作废？作废后项目数据将被标记为不可访问，此操作不可恢复。';
    } else {
      confirmMsg = `确认将项目状态变更为"${transition.label}"？`;
    }

    if (confirm(confirmMsg)) {
      showToast(`项目状态已变更为：${ProjectStatusMap[newStatus]}`, 'success');
      setCurrentStatus(newStatus);
      setShowStatusModal(false);
    }
  };

  const handleSave = () => {
    showToast('项目信息已保存', 'success');
    setIsEditing(false);
  };

  const onlineCount = projectMembers.filter((m) => m.onlineStatus === 1).length;
  const completedDrawings = projectDrawings.filter((d) => d.status === 3).length;
  const abnormalDrawings = projectDrawings.filter((d) => d.status === 4).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">项目详情</h1>
          <p className="text-gray-500 mt-1">{project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑信息
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">图纸总数</p>
              <p className="text-lg font-bold text-primary-600">{projectDrawings.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">成员数量</p>
              <p className="text-lg font-bold text-indigo-600">{projectMembers.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-success-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已完成图纸</p>
              <p className="text-lg font-bold text-success-600">{completedDrawings}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-danger-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">异常图纸</p>
              <p className="text-lg font-bold text-danger-600">{abnormalDrawings}</p>
            </div>
          </div>
        </div>
      </div>

      {currentStatus === 3 && (
        <div className="card p-4 bg-warning-50 border-warning-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning-800">项目已归档</p>
              <p className="text-sm text-warning-600">归档后项目变为只读状态，所有数据不可修改</p>
            </div>
          </div>
        </div>
      )}

      {currentStatus === 4 && (
        <div className="card p-4 bg-danger-50 border-danger-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-danger-800">项目已作废</p>
              <p className="text-sm text-danger-600">项目数据已被标记为不可访问，此操作不可恢复</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">项目编号</p>
              <p className="text-lg font-bold text-gray-800 font-mono">{project.id}</p>
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
              <p className="text-lg font-bold text-success-600">{onlineCount}/{projectMembers.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">图纸进度</p>
              <p className="text-lg font-bold text-blue-600">{completedDrawings}/{projectDrawings.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">创建时间</p>
              <p className="text-lg font-bold text-gray-800">{project.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            项目基本信息
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">项目名称</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-800 font-medium">{project.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">工程地址</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-800 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {project.address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">项目负责人</label>
              {isEditing ? (
                <select className="input-field">
                  <option>{project.managerName}</option>
                  <option>张伟</option>
                  <option>李娜</option>
                  <option>王强</option>
                </select>
              ) : (
                <p className="text-gray-800 font-medium">{project.managerName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">项目状态</label>
              <div className="flex items-center gap-3">
                {getStatusTag(currentStatus)}
                {currentStatus !== 3 && currentStatus !== 4 && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    变更状态
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">计划工期</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field flex-1"
                  />
                  <span className="flex items-center text-gray-400">-</span>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field flex-1"
                  />
                </div>
              ) : (
                <p className="text-gray-800 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {project.startDate} ~ {project.endDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">租户信息</label>
              <p className="text-gray-800 font-medium">中国移动</p>
            </div>
          </div>
          {project.remark && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-500 mb-2">备注说明</label>
              {isEditing ? (
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  rows={4}
                  className="input-field resize-none"
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-gray-600">{project.remark}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" />
            项目操作日志
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  时间
                </th>
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
                  IP地址
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  详情
                </th>
              </tr>
            </thead>
            <tbody className="table-zebra">
              {projectLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.createdAt}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.userName}</td>
                  <td className="px-6 py-4">
                    <span className="tag tag-pending">{ActionTypeMap[log.actionType] || log.actionType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.targetName}</td>
                  <td className="px-6 py-4">
                    {log.result === 1 ? (
                      <span className="tag tag-completed">成功</span>
                    ) : (
                      <span className="tag tag-exception">失败</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowLogDetail(log)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {projectLogs.length} 条记录</span>
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

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">变更项目状态</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">当前状态</p>
              <div className="flex items-center gap-2">
                {getStatusTag(currentStatus)}
                <span className="text-gray-700 font-medium">{ProjectStatusMap[currentStatus]}</span>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">可变更状态</p>
              <div className="space-y-2">
                {getStatusTransitions(currentStatus).length > 0 ? (
                  getStatusTransitions(currentStatus).map((transition) => (
                    <button
                      key={transition.value}
                      onClick={() => handleStatusChange(transition.value)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{transition.label}</span>
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{transition.description}</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>当前状态无可用的状态变更</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">日志详情</h2>
              <button
                onClick={() => setShowLogDetail(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">操作人</p>
                  <p className="font-medium text-gray-800">{showLogDetail.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">操作类型</p>
                  <p className="font-medium text-gray-800">
                    {ActionTypeMap[showLogDetail.actionType] || showLogDetail.actionType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">操作对象</p>
                  <p className="font-medium text-gray-800">{showLogDetail.targetName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">操作结果</p>
                  <p className={`font-medium ${showLogDetail.result === 1 ? 'text-success-600' : 'text-danger-600'}`}>
                    {showLogDetail.result === 1 ? '成功' : '失败'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">IP地址</p>
                  <p className="font-medium text-gray-800 font-mono">{showLogDetail.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">操作时间</p>
                  <p className="font-medium text-gray-800">{showLogDetail.createdAt}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-2">详细信息</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">项目：</span>
                      <span className="text-gray-800">{showLogDetail.projectName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">对象类型：</span>
                      <span className="text-gray-800">{showLogDetail.targetType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">对象ID：</span>
                      <span className="text-gray-800 font-mono">{showLogDetail.targetId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">用户ID：</span>
                      <span className="text-gray-800 font-mono">{showLogDetail.userId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowLogDetail(null)} className="btn-secondary">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};