import { useState } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronRight,
  FileText,
  Layers,
  Ruler,
} from 'lucide-react';

const generationTasks = [
  {
    id: 'g001',
    drawingId: 'd003',
    drawingName: '浦东新区-主干线B01',
    projectName: '上海市浦东新区光缆铺设项目',
    status: 2,
    stage: 'dwg_generation',
    stageText: 'DWG生成中',
    progress: 65,
    submitterName: '李娜',
    submittedAt: '2024-06-20 09:03:25',
    estimatedTime: '约3分钟',
  },
  {
    id: 'g002',
    drawingId: 'd005',
    drawingName: '朝阳区-线路A03',
    projectName: '北京市朝阳区通信线路改造项目',
    status: 3,
    stage: 'completed',
    stageText: '生成完成',
    progress: 100,
    submitterName: '易裕丰',
    submittedAt: '2024-06-19 16:45:12',
    completedAt: '2024-06-19 16:48:30',
  },
  {
    id: 'g003',
    drawingId: 'd006',
    drawingName: '天河区-5G基站C02',
    projectName: '广州市天河区5G基站配套项目',
    status: 4,
    stage: 'exception',
    stageText: '生成失败',
    progress: 0,
    submitterName: '王强',
    submittedAt: '2024-06-20 08:35:00',
    errorReason: 'DWG模板加载失败',
    retryCount: 1,
  },
];

const generatedDrawings = [
  {
    id: 'gd001',
    drawingId: 'd003',
    drawingName: '浦东新区-主干线B01',
    projectName: '上海市浦东新区光缆铺设项目',
    templateName: '通信线路竣工图模板A3',
    paperSize: 'A3',
    scale: '1:500',
    layerCount: 12,
    objectCount: 234,
    generatedAt: '2024-06-20 09:08:30',
    fileSize: '2.3 MB',
    status: 'success',
  },
  {
    id: 'gd002',
    drawingId: 'd005',
    drawingName: '朝阳区-线路A03',
    projectName: '北京市朝阳区通信线路改造项目',
    templateName: '通信线路竣工图模板A3',
    paperSize: 'A3',
    scale: '1:500',
    layerCount: 10,
    objectCount: 187,
    generatedAt: '2024-06-19 16:48:30',
    fileSize: '1.8 MB',
    status: 'success',
  },
];

export const DrawingGeneration = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'preview' | 'export'>('tasks');

  const filteredTasks = generationTasks.filter((task) => {
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
          <h1 className="text-2xl font-bold text-gray-800">图纸生成</h1>
          <p className="text-gray-500 mt-1">基于AI识别结果自动生成DWG格式的标准竣工图纸</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          批量导出
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
            生成任务
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            生成预览
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            图纸导出
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">图纸名称</th>
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
                        <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 text-green-600 rounded text-sm">
                          {task.stageText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full transition-all"
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

        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 gap-4">
            {generatedDrawings.map((drawing) => (
              <div key={drawing.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{drawing.drawingName}.dwg</h3>
                      <p className="text-sm text-gray-500">{drawing.projectName}</p>
                    </div>
                  </div>
                  <span className="tag tag-completed">已生成</span>
                </div>
                <div className="grid grid-cols-5 gap-4 p-4">
                  <div className="col-span-3 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-800">图纸预览</span>
                    </div>
                    <div className="aspect-[4/3] bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">DWG图纸预览区域</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">图层信息</span>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>图层数量: {drawing.layerCount} 个</p>
                        <p>图元数量: {drawing.objectCount} 个</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">图纸规格</span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>纸张大小: {drawing.paperSize}</p>
                        <p>比例尺: {drawing.scale}</p>
                        <p>模板: {drawing.templateName}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">生成时间: {drawing.generatedAt}</p>
                      <p className="text-xs text-gray-500">文件大小: {drawing.fileSize}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                  <button className="btn-secondary flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    在线预览
                  </button>
                  <button className="btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    下载图纸
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-800 mb-4">导出设置</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">导出格式</label>
                  <select className="input-field">
                    <option value="dwg">DWG (AutoCAD)</option>
                    <option value="dxf">DXF (交换格式)</option>
                    <option value="pdf">PDF (便携格式)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图纸版本</label>
                  <select className="input-field">
                    <option value="2024">AutoCAD 2024</option>
                    <option value="2020">AutoCAD 2020</option>
                    <option value="2018">AutoCAD 2018</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">压缩方式</label>
                  <select className="input-field">
                    <option value="zip">ZIP压缩</option>
                    <option value="none">不压缩</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-medium text-gray-800">待导出图纸列表</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {generatedDrawings.map((drawing, index) => (
                  <div key={drawing.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{drawing.drawingName}.dwg</p>
                        <p className="text-sm text-gray-500">{drawing.projectName} | {drawing.fileSize}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-600">全选 ({generatedDrawings.length} 项)</span>
                  </label>
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  导出选中 ({generatedDrawings.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
