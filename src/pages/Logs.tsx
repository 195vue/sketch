import { useState } from 'react';
import {
  Search,
  Download,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Server,
  Globe,
} from 'lucide-react';
import { operationLogs } from '../utils/mockData';
import { ActionTypeMap } from '../types';
import { showToast } from '../components/Toast';

export const Logs = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showExportWarning, setShowExportWarning] = useState(false);
  const [selectedLog, setSelectedLog] = useState<typeof operationLogs[0] | null>(null);

  const filteredLogs = operationLogs.filter((log) => {
    const matchKeyword =
      !searchKeyword ||
      log.targetName.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchUser = userFilter === 'all' || log.userId === userFilter;
    const matchAction = actionFilter === 'all' || log.actionType === actionFilter;
    const matchDate =
      (!dateRange.start || log.createdAt >= dateRange.start) &&
      (!dateRange.end || log.createdAt <= dateRange.end);
    return matchKeyword && matchUser && matchAction && matchDate;
  });

  const getActionText = (actionType: string) => {
    return ActionTypeMap[actionType] || actionType;
  };

  const handleExport = () => {
    if (filteredLogs.length > 10000) {
      setShowExportWarning(true);
      return;
    }
    showToast('日志导出功能已触发，将按当前筛选条件导出CSV文件', 'success');
  };

  const users = [
    { id: 'u001', name: '易裕丰' },
    { id: 'u002', name: '张伟' },
    { id: 'u003', name: '李娜' },
  ];

  const actionTypes = [
    { value: 'upload', label: '上传草图' },
    { value: 'export', label: '提交出图' },
    { value: 'download', label: '下载DWG' },
    { value: 'add_member', label: '添加成员' },
    { value: 'update_settings', label: '配置变更' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">操作日志</h1>
          <p className="text-gray-500 mt-1">查看系统操作日志记录</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出日志
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索操作对象..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-40 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="input-field w-28"
          >
            <option value="all">全部操作人</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">全部操作类型</option>
            {actionTypes.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="input-field w-28"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="input-field w-28"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">日志总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{filteredLogs.length}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">操作成功</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {filteredLogs.filter((l) => l.result === 1).length}
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
              <p className="text-gray-500 text-sm">操作失败</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {filteredLogs.filter((l) => l.result === 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">涉及用户</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {new Set(filteredLogs.map((l) => l.userId)).size}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
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
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {log.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium text-primary-700">
                      {log.userName.charAt(0)}
                    </div>
                    {log.userName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="tag tag-pending">{getActionText(log.actionType)}</span>
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
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
          <span className="text-sm text-gray-500">
            共 {filteredLogs.length} 条日志记录
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

      {showExportWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">数据量较大</h3>
                <p className="text-sm text-gray-500">建议缩小筛选范围后导出</p>
              </div>
            </div>
            <button
              onClick={() => setShowExportWarning(false)}
              className="w-full btn-primary"
            >
              确认
            </button>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedLog.result === 1 ? 'bg-success-100' : 'bg-danger-100'
                }`}>
                  {selectedLog.result === 1 ? (
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-danger-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">日志详情</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="tag tag-pending">{getActionText(selectedLog.actionType)}</span>
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-500">日志ID: {selectedLog.id}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
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
                      <User className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">操作人</p>
                      <p className="font-medium text-gray-800">{selectedLog.userName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {selectedLog.userId}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">操作时间</p>
                      <p className="font-medium text-gray-800">{selectedLog.createdAt}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">IP地址</p>
                      <p className="font-medium text-gray-800 font-mono">{selectedLog.ipAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedLog.result === 1 ? 'bg-success-100' : 'bg-danger-100'
                    }`}>
                      {selectedLog.result === 1 ? (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-danger-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">操作结果</p>
                      <p className={`font-medium ${
                        selectedLog.result === 1 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {selectedLog.result === 1 ? '成功' : '失败'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">操作信息</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">操作类型</p>
                    <p className="text-sm font-medium text-gray-800">{getActionText(selectedLog.actionType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">操作对象</p>
                    <p className="text-sm font-medium text-gray-800">{selectedLog.targetName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">所属项目</p>
                    <p className="text-sm font-medium text-gray-800">{selectedLog.projectName || '-'}</p>
                  </div>
                </div>
              </div>

              {selectedLog.detail && (
                <div className="card p-6">
                  <h3 className="font-medium text-gray-800 mb-4">详细信息</h3>
                  <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {typeof selectedLog.detail === 'string' ? selectedLog.detail : JSON.stringify(selectedLog.detail, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.result === 0 && selectedLog.errorMessage && (
                <div className="card p-6 bg-danger-50 border-danger-200">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-danger-800 mb-2">错误信息</h3>
                      <p className="text-sm text-danger-700">{selectedLog.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="card p-6">
                <h3 className="font-medium text-gray-800 mb-4">请求信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">User-Agent</p>
                    <p className="text-sm text-gray-700 mt-1 truncate">Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">请求路径</p>
                    <p className="text-sm text-gray-700 mt-1">/api/drawings/upload</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">请求方法</p>
                    <p className="text-sm text-gray-700 mt-1">POST</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">响应时间</p>
                    <p className="text-sm text-gray-700 mt-1">256 ms</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-secondary"
              >
                关闭
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                导出单条日志
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};