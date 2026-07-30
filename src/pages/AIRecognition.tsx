import { useState } from 'react';
import {
  Search,
  RefreshCw,
  Upload,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { drawings } from '../utils/mockData';

const recognitionTasks = [
  {
    id: 'r001',
    drawingId: 'd001',
    drawingName: '朝阳区-线路A01.jpg',
    projectName: '北京市朝阳区通信线路改造项目',
    status: 1,
    stage: 'drawing_parsing',
    stageText: '图纸解析',
    progress: 35,
    submitterName: '易裕丰',
    submittedAt: '2024-06-20 10:30:00',
    estimatedTime: '约2分钟',
  },
  {
    id: 'r002',
    drawingId: 'd002',
    drawingName: '朝阳区-线路A02.jpg',
    projectName: '北京市朝阳区通信线路改造项目',
    status: 2,
    stage: 'feature_extraction',
    stageText: '特征提取',
    progress: 72,
    submitterName: '张伟',
    submittedAt: '2024-06-20 11:15:00',
    estimatedTime: '约1分钟',
  },
  {
    id: 'r003',
    drawingId: 'd003',
    drawingName: '浦东新区-主干线B01.png',
    projectName: '上海市浦东新区光缆铺设项目',
    status: 3,
    stage: 'completed',
    stageText: '识别完成',
    progress: 100,
    submitterName: '李娜',
    submittedAt: '2024-06-20 09:00:00',
    completedAt: '2024-06-20 09:03:25',
  },
  {
    id: 'r004',
    drawingId: 'd004',
    drawingName: '天河区-5G基站C01.jpg',
    projectName: '广州市天河区5G基站配套项目',
    status: 4,
    stage: 'exception',
    stageText: '识别失败',
    progress: 0,
    submitterName: '王强',
    submittedAt: '2024-06-20 08:30:00',
    errorReason: '图纸模糊，无法识别关键特征',
    retryCount: 2,
  },
];

const recognitionResults = [
  {
    id: 'rr001',
    drawingId: 'd003',
    drawingName: '浦东新区-主干线B01.png',
    projectName: '上海市浦东新区光缆铺设项目',
    recognitionAccuracy: 98.5,
    detectedPoles: 45,
    detectedRoutes: 12,
    detectedManholes: 18,
    detectedLabels: 156,
    completedAt: '2024-06-20 09:03:25',
    status: 'success',
  },
  {
    id: 'rr002',
    drawingId: 'd005',
    drawingName: '朝阳区-线路A03.jpg',
    projectName: '北京市朝阳区通信线路改造项目',
    recognitionAccuracy: 95.2,
    detectedPoles: 38,
    detectedRoutes: 8,
    detectedManholes: 12,
    detectedLabels: 124,
    completedAt: '2024-06-19 16:45:12',
    status: 'success',
  },
];

export const AIRecognition = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'results'>('tasks');

  const filteredTasks = recognitionTasks.filter((task) => {
    const matchesKeyword =
      task.drawingName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === parseInt(statusFilter);
    return matchesKeyword && matchesStatus;
  });

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="tag tag-pending">待处理</span>
        );
      case 2:
        return (
          <span className="tag tag-processing flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            处理中
          </span>
        );
      case 3:
        return (
          <span className="tag tag-completed flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            已完成
          </span>
        );
      case 4:
        return (
          <span className="tag tag-exception flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            失败
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI识别中心</h1>
          <p className="text-gray-500 mt-1">AI智能识别草图中的关键信息，包括杆号、路由、分纤点等</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          上传草图识别
        </button>
      </div>

      <div className="card">
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            识别任务
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            识别结果
          </button>
        </div>

        {activeTab === 'tasks' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索图纸名称、项目名称..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">全部状态</option>
                  <option value="1">待处理</option>
                  <option value="2">处理中</option>
                  <option value="3">已完成</option>
                  <option value="4">失败</option>
                </select>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">草图名称</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">所属项目</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">当前阶段</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">进度</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">操作人</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">提交时间</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button className="font-medium text-primary-600 hover:text-primary-800 flex items-center gap-2">
                          {task.drawingName}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.projectName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                          {task.stageText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusTag(task.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.submitterName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{task.submittedAt}</td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-primary-600 hover:text-primary-800">
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'results' && (
          <div className="grid grid-cols-1 gap-4">
            {recognitionResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{result.drawingName}</h3>
                      <p className="text-sm text-gray-500">{result.projectName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tag tag-completed">识别成功</span>
                    <span className="text-sm text-gray-600">准确率: {result.recognitionAccuracy}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600">{result.detectedPoles}</p>
                    <p className="text-xs text-gray-500 mt-1">识别杆数</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{result.detectedRoutes}</p>
                    <p className="text-xs text-gray-500 mt-1">识别路由</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{result.detectedManholes}</p>
                    <p className="text-xs text-gray-500 mt-1">识别井数</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{result.detectedLabels}</p>
                    <p className="text-xs text-gray-500 mt-1">识别标注</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button className="btn-secondary flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    查看详情
                  </button>
                  <button className="btn-primary flex items-center gap-2">
                    提交生成
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
