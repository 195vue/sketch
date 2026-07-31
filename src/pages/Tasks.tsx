import { useState } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  RotateCcw,
  ChevronRight,
  X,
  FileText,
  User,
  Calendar,
  Zap,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { tasks, projects, tenants } from '../utils/mockData';
import { TaskStatusMap, TaskStageMap } from '../types';
import { showToast } from '../components/Toast';

export const Tasks = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null);

  const getTenantByProjectId = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;
    return tenants.find((t) => t.id === project.tenantId) || null;
  };

  const getTaskType = (task: typeof tasks[0]) => {
    if (task.stage === 'dwg_generation' || task.stage === 'preprocessing') {
      return 'drawing_generation';
    }
    return 'ai_recognition';
  };

  const filteredTasks = tasks.filter((task) => {
    const matchKeyword =
      !searchKeyword ||
      task.drawingName.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchProject = projectFilter === 'all' || task.projectId === projectFilter;
    const matchStatus = statusFilter === 'all' || task.status === parseInt(statusFilter);
    const matchTenant =
      tenantFilter === 'all' ||
      (() => {
        const tenant = getTenantByProjectId(task.projectId);
        return tenant?.id === tenantFilter;
      })();
    const matchTaskType =
      taskTypeFilter === 'all' || getTaskType(task) === taskTypeFilter;
    return matchKeyword && matchProject && matchStatus && matchTenant && matchTaskType;
  });

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="tag tag-pending flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {TaskStatusMap[status]}
          </span>
        );
      case 2:
        return (
          <span className="tag tag-processing flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {TaskStatusMap[status]}
          </span>
        );
      case 3:
        return (
          <span className="tag tag-completed flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {TaskStatusMap[status]}
          </span>
        );
      case 4:
        return (
          <span className="tag tag-exception flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {TaskStatusMap[status]}
          </span>
        );
      default:
        return null;
    }
  };

  const getStageText = (stage: string) => {
    return TaskStageMap[stage] || stage;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleResubmit = (taskId: string, retryCount: number) => {
    if (retryCount >= 3) {
      showToast('已超过重试次数上限', 'error');
      return;
    }
    if (confirm('确认重新提交该出图任务？将重新执行完整AI处理流程。')) {
      showToast('任务已重新提交', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">任务管理</h1>
          <p className="text-gray-500 mt-1">查看和管理所有出图任务</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索图纸名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="input-field w-28"
          >
            <option value="all">全部租户</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">全部项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            className="input-field w-24"
          >
            <option value="all">全部类型</option>
            <option value="ai_recognition">AI识别</option>
            <option value="drawing_generation">图纸生成</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-24"
          >
            <option value="all">全部状态</option>
            <option value="1">待处理</option>
            <option value="2">处理中</option>
            <option value="3">已完成</option>
            <option value="4">异常</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待处理</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {filteredTasks.filter((t) => t.status === 1).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">处理中</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {filteredTasks.filter((t) => t.status === 2).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已完成</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {filteredTasks.filter((t) => t.status === 3).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">异常</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {filteredTasks.filter((t) => t.status === 4).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger-600" />
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
                  图纸名称
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  所属项目
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  提交人
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  当前阶段
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  进度
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="table-zebra">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    task.status === 4 ? 'bg-danger-50/50' : ''
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary-600 flex items-center gap-2">
                      <FileIcon className="w-4 h-4" />
                      {task.drawingName}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.projectName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.submitterName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.submittedAt}
                  </td>
                  <td className="px-6 py-4">
                    {task.stage ? (
                      <span className="text-sm font-medium text-blue-600">
                        {getStageText(task.stage)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusTag(task.status)}
                  </td>
                  <td className="px-6 py-4">
                    {task.status === 2 || task.status === 4 ? (
                      <div className="w-32">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.status === 4
                                ? 'bg-danger-500'
                                : 'bg-primary-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{task.progress}%</p>
                      </div>
                    ) : task.status === 3 ? (
                      <span className="text-sm font-medium text-success-600">100%</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 4 && (
                        <>
                          <div className="relative group">
                            <button className="text-xs text-danger-600 hover:text-danger-800">
                              查看原因
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <p className="text-sm text-gray-700">{task.exceptionReason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleResubmit(task.id, task.retryCount)}
                            disabled={task.retryCount >= 3}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              task.retryCount >= 3
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                            }`}
                            title={task.retryCount >= 3 ? '已超过重试次数上限' : '重新提交'}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {task.status === 3 && (
                        <button className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            共 {filteredTasks.length} 条任务记录
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

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedTask.status === 4 ? 'bg-danger-100' :
                  selectedTask.status === 3 ? 'bg-success-100' :
                  selectedTask.status === 2 ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {selectedTask.status === 4 ? (
                    <AlertCircle className={`w-6 h-6 ${selectedTask.status === 4 ? 'text-danger-600' : ''}`} />
                  ) : selectedTask.status === 3 ? (
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  ) : selectedTask.status === 2 ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedTask.drawingName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusTag(selectedTask.status)}
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-500">任务ID: {selectedTask.id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">所属项目</p>
                      <p className="font-medium text-gray-800">{selectedTask.projectName}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">所属租户</p>
                      <p className="font-medium text-gray-800">
                        {getTenantByProjectId(selectedTask.projectId)?.name || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">提交人</p>
                      <p className="font-medium text-gray-800">{selectedTask.submitterName}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">提交时间</p>
                      <p className="font-medium text-gray-800">{selectedTask.submittedAt}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">当前阶段</p>
                      <p className="font-medium text-gray-800">{getStageText(selectedTask.stage)}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">任务类型</p>
                      <p className="font-medium text-gray-800">
                        {getTaskType(selectedTask) === 'ai_recognition' ? 'AI识别' : '图纸生成'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">处理进度</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">整体进度</span>
                      <span className="text-sm font-medium text-primary-600">{selectedTask.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedTask.status === 4 ? 'bg-danger-500' : 'bg-primary-600'
                        }`}
                        style={{ width: `${selectedTask.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{selectedTask.stages?.drawingParsing || 0}%</p>
                      <p className="text-xs text-gray-500 mt-1">图纸解析</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{selectedTask.stages?.featureExtraction || 0}%</p>
                      <p className="text-xs text-gray-500 mt-1">特征提取</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{selectedTask.stages?.dwgGeneration || 0}%</p>
                      <p className="text-xs text-gray-500 mt-1">DWG生成</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTask.status === 4 && (
                <div className="card p-6 bg-danger-50 border-danger-200">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-danger-800 mb-2">异常信息</h3>
                      <p className="text-sm text-danger-700 mb-3">{selectedTask.exceptionReason}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-danger-600 bg-danger-100 px-2 py-1 rounded">
                          重试次数: {selectedTask.retryCount}/3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">处理日志</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-600">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">任务创建</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedTask.submittedAt}</p>
                    </div>
                  </div>
                  {selectedTask.status >= 2 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">开始处理</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedTask.submittedAt}</p>
                      </div>
                    </div>
                  )}
                  {selectedTask.status >= 3 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-success-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">处理完成</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedTask.submittedAt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="btn-secondary"
              >
                关闭
              </button>
              {selectedTask.status === 3 && (
                <button className="btn-primary flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  查看图纸
                </button>
              )}
              {selectedTask.status === 4 && selectedTask.retryCount < 3 && (
                <button
                  onClick={() => {
                    if (confirm('确认重新提交该出图任务？将重新执行完整AI处理流程。')) {
                      showToast('任务已重新提交', 'success');
                      setSelectedTask(null);
                    }
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新提交
                </button>
              )}
              {selectedTask.status === 4 && selectedTask.retryCount >= 3 && (
                <button className="btn-secondary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  联系技术支持
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FileIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}