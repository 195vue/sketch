import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  Download,
  Eye,
  FileText,
  FolderKanban,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Grid3X3,
  List,
} from 'lucide-react';
import { projects, drawings } from '../utils/mockData';
import { DrawingStatusMap } from '../types';

export const DrawingsHome = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedDrawings, setSelectedDrawings] = useState<string[]>([]);

  const allDrawings = drawings;

  const filteredDrawings = allDrawings.filter((drawing) => {
    const matchKeyword =
      !searchKeyword ||
      drawing.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchProject = projectFilter === 'all' || drawing.projectId === projectFilter;
    const matchStatus = statusFilter === 'all' || drawing.status === parseInt(statusFilter);
    return matchKeyword && matchProject && matchStatus;
  });

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || '未知项目';
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <span className="tag tag-pending">{DrawingStatusMap[status]}</span>;
      case 2:
        return (
          <span className="tag tag-processing flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {DrawingStatusMap[status]}
          </span>
        );
      case 3:
        return (
          <span className="tag tag-completed flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {DrawingStatusMap[status]}
          </span>
        );
      case 4:
        return (
          <span className="tag tag-exception flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {DrawingStatusMap[status]}
          </span>
        );
      default:
        return null;
    }
  };

  const toggleDrawingSelection = (id: string) => {
    setSelectedDrawings((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleBatchExport = () => {
    if (selectedDrawings.length > 0) {
      alert(`将为 ${selectedDrawings.length} 张草图生成DWG图纸`);
      setSelectedDrawings([]);
    }
  };

  const stats = {
    total: allDrawings.length,
    completed: allDrawings.filter((d) => d.status === 3).length,
    processing: allDrawings.filter((d) => d.status === 2).length,
    pending: allDrawings.filter((d) => d.status === 1).length,
    exception: allDrawings.filter((d) => d.status === 4).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">图纸管理</h1>
          <p className="text-gray-500 mt-1">管理所有项目的图纸文件</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchExport}
            disabled={selectedDrawings.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            批量出图 ({selectedDrawings.length})
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            上传草图
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">图纸总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已完成</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">处理中</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">未出图</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">异常</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">{stats.exception}</p>
            </div>
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="网格视图"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="列表视图"
            >
              <List className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="1">未出图</option>
              <option value="2">处理中</option>
              <option value="3">已完成</option>
              <option value="4">异常</option>
            </select>
          </div>
          <span className="text-sm text-gray-500">
            共 {filteredDrawings.length} 个文件
          </span>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {filteredDrawings.map((drawing) => (
            <div
              key={drawing.id}
              className={`card p-4 cursor-pointer hover:shadow-md transition-all ${
                selectedDrawings.includes(drawing.id)
                  ? 'ring-2 ring-primary-500 ring-offset-2'
                  : ''
              }`}
              onClick={() => toggleDrawingSelection(drawing.id)}
            >
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://picsum.photos/400/225?random=${drawing.id}`}
                  alt={drawing.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between mb-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${drawing.projectId}/drawings/${drawing.id}/preview`);
                  }}
                  className="font-medium text-gray-800 hover:text-primary-600 truncate max-w-[80%]"
                >
                  {drawing.name}
                </button>
                <input
                  type="checkbox"
                  checked={selectedDrawings.includes(drawing.id)}
                  onChange={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">{drawing.format}</span>
                {getStatusTag(drawing.status)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FolderKanban className="w-3 h-3" />
                <span className="truncate">{getProjectName(drawing.projectId)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{drawing.uploadedAt}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/projects/${drawing.projectId}/drawings/${drawing.id}/preview`);
                  }}
                  className="flex-1 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  预览
                </button>
                {drawing.status === 3 && (
                  <button className="flex-1 py-1.5 text-xs bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors">
                    下载DWG
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDrawings(filteredDrawings.map((d) => d.id));
                        } else {
                          setSelectedDrawings([]);
                        }
                      }}
                      checked={
                        selectedDrawings.length === filteredDrawings.length &&
                        filteredDrawings.length > 0
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    文件名
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    所属项目
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    格式
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    上传人
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    上传时间
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="table-zebra">
                {filteredDrawings.map((drawing) => (
                  <tr
                    key={drawing.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDrawings.includes(drawing.id)}
                        onChange={() => toggleDrawingSelection(drawing.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(`/projects/${drawing.projectId}/drawings/${drawing.id}/preview`)
                        }
                        className="font-medium text-primary-600 hover:text-primary-800 flex items-center gap-2"
                      >
                        <FileTextIcon className="w-4 h-4" />
                        {drawing.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getProjectName(drawing.projectId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{drawing.format}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(drawing.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-6 py-4">{getStatusTag(drawing.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{drawing.uploaderName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{drawing.uploadedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            navigate(`/projects/${drawing.projectId}/drawings/${drawing.id}/preview`)
                          }
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="预览"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {drawing.status === 3 && (
                          <button className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors" title="下载DWG">
                            <Download className="w-4 h-4" />
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
              已选择 {selectedDrawings.length} 个文件
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
      )}
    </div>
  );
};

function FileTextIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}