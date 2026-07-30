import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  Grid3X3,
  List,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Save,
  Zap,
  Image,
  FileImage,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { projects, drawings, directories } from '../utils/mockData';
import { DrawingStatusMap } from '../types';
import { showToast } from '../components/Toast';
import { useStore } from '../store/useStore';

interface DirectoryNode {
  id: string;
  projectId: string;
  parentId: string;
  name: string;
  createdAt: string;
  children?: DirectoryNode[];
}

export const Drawings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentProject, user, resubmitDrawing, reviewDrawing, updateDrawingStatus, drawings: storeDrawings, hasPermission } = useStore();
  const project = projects.find((p) => p.id === id);
  const projectDrawings = storeDrawings.filter((d) => d.projectId === id);
  const projectDirectories = directories.filter((d) => d.projectId === id);

  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDrawings, setSelectedDrawings] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showNewDirModal, setShowNewDirModal] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [editingDirId, setEditingDirId] = useState<string | null>(null);
  const [editingDirName, setEditingDirName] = useState('');
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
  const [editingDrawingName, setEditingDrawingName] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<string[]>(['d001', 'd002']);
  const [showAIEnhanceModal, setShowAIEnhanceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingDrawing, setRenamingDrawing] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterUploader, setFilterUploader] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingDrawing, setReviewingDrawing] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<'pass' | 'reject'>('pass');
  const [reviewComment, setReviewComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showBatchProcessModal, setShowBatchProcessModal] = useState(false);
  const [batchProcessStatus, setBatchProcessStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [batchCurrentIndex, setBatchCurrentIndex] = useState(-1);
  const [batchResults, setBatchResults] = useState<{id: string, name: string, status: 'pending' | 'processing' | 'success' | 'error', message?: string}[]>([]);
  
  // 单张AI处理状态
  const [showSingleProcessModal, setShowSingleProcessModal] = useState(false);
  const [singleProcessStatus, setSingleProcessStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [singleProcessDrawing, setSingleProcessDrawing] = useState<typeof drawings[0] | null>(null);
  const [singleProcessProgress, setSingleProcessProgress] = useState(0);
  const [singleProcessTime, setSingleProcessTime] = useState(0);
  const [singleProcessError, setSingleProcessError] = useState('');
  const [singleProcessResultUrl, setSingleProcessResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
    const filterParam = searchParams.get('filter');
    if (filterParam === 'pending_review') {
      setStatusFilter('5');
      setShowAdvancedFilter(true);
    }
  }, [project, setCurrentProject, searchParams]);

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
        return <span className="tag tag-pending">{DrawingStatusMap[status]}</span>;
      case 2:
        return (
          <span className="tag tag-processing flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {DrawingStatusMap[status]}
          </span>
        );
      case 5:
        return (
          <span className="tag flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-300">
            <Clock className="w-3 h-3" />
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
      case 6:
        return (
          <span className="tag flex items-center gap-1 bg-red-100 text-red-700 border border-red-300">
            <X className="w-3 h-3" />
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

  // 判断图纸是否可以批量出图：仅未出图(1)和已驳回(6)状态可以
  const canBatchProcess = (status: number) => status === 1 || status === 6;

  const toggleDrawingSelection = (id: string) => {
    const drawing = projectDrawings.find(d => d.id === id);
    if (!drawing || !canBatchProcess(drawing.status)) {
      showToast('仅未出图或已驳回状态的图纸可批量出图', 'warning');
      return;
    }
    setSelectedDrawings((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleStartUpload = () => {
    if (!uploadFileName) {
      showToast('请选择要上传的文件', 'error');
      return;
    }
    setShowUploadModal(false);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1000);
          setUploadFileName('');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const handleAIProcess = (drawingId: string) => {
    const drawing = projectDrawings.find((d) => d.id === drawingId);
    if (drawing) {
      setSingleProcessDrawing(drawing);
      setSingleProcessStatus('idle');
      setSingleProcessProgress(0);
      setSingleProcessTime(0);
      setSingleProcessError('');
      setSingleProcessResultUrl(null);
      setShowSingleProcessModal(true);
    }
  };

  const startSingleProcess = async () => {
    if (!singleProcessDrawing) return;
    
    setSingleProcessStatus('processing');
    setSingleProcessProgress(0);
    setSingleProcessError('');
    setSingleProcessTime(0);

    const startTime = Date.now();
    const duration = 3000 + Math.random() * 2000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 95);
      setSingleProcessProgress(pct);
      setSingleProcessTime(Math.floor(elapsed / 1000));
    }, 100);

    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) {
            resolve();
          } else {
            reject(new Error('AI处理服务暂时不可用，请稍后重试'));
          }
        }, duration);
      });

      clearInterval(progressInterval);
      setSingleProcessProgress(100);
      setSingleProcessResultUrl(singleProcessDrawing.sketchPath || `https://picsum.photos/seed/${singleProcessDrawing.id}/400/300`);
      
      // 更新图纸状态为"待审核"
      updateDrawingStatus(singleProcessDrawing.id, 5);
      
      setSingleProcessStatus('success');
      showToast('AI图纸生成完成，已提交审核！', 'success');
      
    } catch (error: any) {
      clearInterval(progressInterval);
      setSingleProcessStatus('error');
      setSingleProcessError(error.message || '处理失败，请重试');
      showToast('AI处理失败', 'error');
    }
  };

  const closeSingleProcessModal = () => {
    setShowSingleProcessModal(false);
    setSingleProcessStatus('idle');
    setSingleProcessDrawing(null);
    setSingleProcessProgress(0);
    setSingleProcessTime(0);
    setSingleProcessError('');
    setSingleProcessResultUrl(null);
  };

  const handleBatchExport = () => {
    // 过滤出可以批量出图的选中项
    const validSelected = selectedDrawings.filter(id => {
      const drawing = projectDrawings.find(d => d.id === id);
      return drawing && canBatchProcess(drawing.status);
    });
    if (validSelected.length === 0) {
      showToast('请选择未出图或已驳回状态的图纸', 'warning');
      return;
    }
    
    // 初始化批量处理结果
    const results = validSelected.map((id) => {
      const drawing = projectDrawings.find((d) => d.id === id);
      return {
        id,
        name: drawing?.name || '未知图纸',
        status: 'pending' as const,
      };
    });
    
    setBatchResults(results);
    setBatchCurrentIndex(-1);
    setBatchProcessStatus('idle');
    setShowBatchProcessModal(true);
  };

  const startBatchProcess = async () => {
    setBatchProcessStatus('processing');
    setBatchResults((prev) => prev.map((r) => ({ ...r, status: 'pending' as const })));
    
    const newResults = [...batchResults];
    
    for (let i = 0; i < newResults.length; i++) {
      setBatchCurrentIndex(i);
      
      // 更新当前项为处理中
      newResults[i] = { ...newResults[i], status: 'processing' };
      setBatchResults([...newResults]);
      
      // 模拟AI处理（3-5秒）
      const duration = 3000 + Math.random() * 2000;
      try {
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.05) {
              resolve();
            } else {
              reject(new Error('AI处理服务暂时不可用'));
            }
          }, duration);
        });
        
        // 处理成功，更新图纸状态为"待审核"
        updateDrawingStatus(newResults[i].id, 5);
        newResults[i] = { ...newResults[i], status: 'success' };
      } catch (error: any) {
        newResults[i] = { 
          ...newResults[i], 
          status: 'error',
          message: error.message || '处理失败'
        };
      }
      
      setBatchResults([...newResults]);
    }
    
    setBatchProcessStatus('completed');
    
    const successCount = newResults.filter((r) => r.status === 'success').length;
    const failCount = newResults.filter((r) => r.status === 'error').length;
    
    if (failCount === 0) {
      showToast(`全部 ${successCount} 张图纸AI处理完成，已提交审核`, 'success');
    } else {
      showToast(`完成 ${successCount} 张，失败 ${failCount} 张`, 'error');
    }
  };

  const closeBatchProcessModal = () => {
    setShowBatchProcessModal(false);
    setSelectedDrawings([]);
    setBatchProcessStatus('idle');
  };

  const handleRenameClick = (drawingId: string, currentName: string) => {
    setRenamingDrawing(drawingId);
    setRenameValue(currentName);
    setShowRenameModal(true);
  };

  const handleRenameConfirm = () => {
    if (renamingDrawing && renameValue.trim()) {
      showToast(`图纸已重命名为 "${renameValue}"`, 'success');
      setShowRenameModal(false);
      setRenamingDrawing(null);
      setRenameValue('');
    }
  };

  const handleRenameCancel = () => {
    setShowRenameModal(false);
    setRenamingDrawing(null);
    setRenameValue('');
  };

  const handleReviewClick = (drawingId: string) => {
    setReviewingDrawing(drawingId);
    setReviewResult('pass');
    setReviewComment('');
    setRejectReason('');
    setShowReviewModal(true);
  };

  const handleReviewConfirm = () => {
    if (reviewingDrawing) {
      if (reviewResult === 'reject' && !rejectReason.trim()) {
        showToast('请填写驳回原因', 'error');
        return;
      }
      reviewDrawing(reviewingDrawing, reviewResult, rejectReason);
      showToast(reviewResult === 'pass' ? '审核通过成功' : '图纸已驳回', 'success');
      setShowReviewModal(false);
      setReviewingDrawing(null);
      setReviewComment('');
      setRejectReason('');
    }
  };

  const handleResubmit = (drawingId: string) => {
    resubmitDrawing(drawingId);
    showToast('已重新提交AI处理', 'success');
  };

  const filteredDrawings = projectDrawings.filter((d) => {
    const matchDir = !selectedDirectory || d.directoryId === selectedDirectory;
    const matchKeyword =
      !searchKeyword || d.name.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === parseInt(statusFilter);
    const matchDateStart = !filterDateStart || d.uploadedAt >= filterDateStart;
    const matchDateEnd = !filterDateEnd || d.uploadedAt <= filterDateEnd + ' 23:59:59';
    const matchUploader = !filterUploader || d.uploaderName.includes(filterUploader);
    return matchDir && matchKeyword && matchStatus && matchDateStart && matchDateEnd && matchUploader;
  });

  // 过滤出可以批量出图的图纸
  const batchableDrawings = filteredDrawings.filter(d => canBatchProcess(d.status));

  const toggleDirExpand = (dirId: string) => {
    setExpandedDirs(prev =>
      prev.includes(dirId) ? prev.filter(id => id !== dirId) : [...prev, dirId]
    );
  };

  const renderDirTree = (dirs: DirectoryNode[], level: number = 0) => {
    return dirs.map(dir => {
      const hasChildren = dir.children && dir.children.length > 0;
      const isExpanded = expandedDirs.includes(dir.id);
      const isSelected = selectedDirectory === dir.id;

      return (
        <div key={dir.id}>
          <button
            onClick={() => {
              setSelectedDirectory(isSelected ? null : dir.id);
              if (hasChildren) toggleDirExpand(dir.id);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              isSelected ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span style={{ paddingLeft: `${level * 16}px` }} />
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )
            ) : (
              <span className="w-4" />
            )}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary-500" />
              ) : (
                <Folder className="w-4 h-4 text-primary-500" />
              )
            ) : (
              <Folder className="w-4 h-4 text-primary-500" />
            )}
            <span>{dir.name}</span>
          </button>
          {hasChildren && isExpanded && (
            <div className="ml-0">
              {renderDirTree(dir.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format.toUpperCase()) {
      case 'JPG':
      case 'PNG':
      case 'BMP':
        return <Image className="w-4 h-4 text-gray-400" />;
      case 'PDF':
        return <FileImage className="w-4 h-4 text-red-400" />;
      default:
        return <FileImage className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">图纸管理</h1>
          <p className="text-gray-500 mt-1">{project.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('generate') && (
            <button
              onClick={() => setShowAIEnhanceModal(true)}
              className="btn-accent flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              AI加强
            </button>
          )}
          {hasPermission('generate') && (
            <button
              onClick={handleBatchExport}
              disabled={batchableDrawings.length === 0 || selectedDrawings.filter(id => {
                const drawing = projectDrawings.find(d => d.id === id);
                return drawing && canBatchProcess(drawing.status);
              }).length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              批量出图 ({selectedDrawings.filter(id => {
                const drawing = projectDrawings.find(d => d.id === id);
                return drawing && canBatchProcess(drawing.status);
              }).length})
            </button>
          )}
          {hasPermission('upload') && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              上传草图
            </button>
          )}
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">正在上传草图...</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary-500" />
                目录结构
              </h3>
              <button
                onClick={() => setShowNewDirModal(true)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="新建目录"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              <button
                onClick={() => setSelectedDirectory(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedDirectory === null ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-primary-500" />
                <span>全部图纸</span>
              </button>
              {renderDirTree(projectDirectories)}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              {/* 状态Tab切换 */}
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 -mb-4">
                {[
                  { key: 'all', label: '全部' },
                  { key: '1', label: '未出图', count: projectDrawings.filter(d => d.status === 1).length },
                  { key: '2', label: '处理中', count: projectDrawings.filter(d => d.status === 2).length },
                  { key: '5', label: '待审核', count: projectDrawings.filter(d => d.status === 5).length, highlight: true },
                  { key: '3', label: '已完成', count: projectDrawings.filter(d => d.status === 3).length },
                  { key: '6', label: '已驳回', count: projectDrawings.filter(d => d.status === 6).length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      statusFilter === tab.key
                        ? tab.highlight
                          ? 'border-amber-500 text-amber-600'
                          : 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                        tab.highlight
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索图纸名称..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="input-field pl-10 w-48"
                    />
                  </div>
                  <button
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    className={`input-field flex items-center gap-2 cursor-pointer ${showAdvancedFilter ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
                  >
                    <Filter className="w-4 h-4" />
                    高级筛选
                    {showAdvancedFilter ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {(filterDateStart || filterDateEnd || filterUploader) && (
                    <button
                      onClick={() => {
                        setFilterDateStart('');
                        setFilterDateEnd('');
                        setFilterUploader('');
                      }}
                      className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      清除筛选
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
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

              {showAdvancedFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20">图纸状态</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="input-field flex-1 max-w-[200px]"
                    >
                      <option value="all">全部状态</option>
                      <option value="1">未出图</option>
                      <option value="2">处理中</option>
                      <option value="5">待审核</option>
                      <option value="3">已完成</option>
                      <option value="6">已驳回</option>
                      <option value="4">异常</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20">上传时间</label>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="date"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="input-field flex-1 max-w-[180px]"
                        placeholder="开始日期"
                      />
                      <span className="text-gray-400">至</span>
                      <input
                        type="date"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="input-field flex-1 max-w-[180px]"
                        placeholder="结束日期"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20">上传人</label>
                    <input
                      type="text"
                      value={filterUploader}
                      onChange={(e) => setFilterUploader(e.target.value)}
                      className="input-field flex-1 max-w-[300px]"
                      placeholder="输入上传人姓名"
                    />
                  </div>
                </div>
              )}
            </div>

            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedDrawings.length === batchableDrawings.length && batchableDrawings.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDrawings(batchableDrawings.map(d => d.id));
                            } else {
                              setSelectedDrawings([]);
                            }
                          }}
                          disabled={batchableDrawings.length === 0}
                          className="w-4 h-4 text-primary-600 disabled:opacity-40"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        图纸名称
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        格式
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        大小
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        上传者
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        上传时间
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
                            disabled={!canBatchProcess(drawing.status)}
                            className="w-4 h-4 text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={canBatchProcess(drawing.status) ? '' : '仅未出图或已驳回状态可批量出图'}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getFormatIcon(drawing.format)}
                            {editingDrawingId === drawing.id ? (
                              <input
                                type="text"
                                value={editingDrawingName}
                                onChange={(e) => setEditingDrawingName(e.target.value)}
                                className="input-field w-48"
                                autoFocus
                                onBlur={() => {
                                  setEditingDrawingId(null);
                                  setEditingDrawingName('');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingDrawingId(null);
                                  }
                                }}
                              />
                            ) : (
                              <span className="font-medium text-gray-800">{drawing.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{drawing.format}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(drawing.size / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{drawing.uploaderName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{drawing.uploadedAt}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {getStatusTag(drawing.status)}
                            {drawing.status === 6 && drawing.rejectReason && (
                              <span className="text-xs text-red-600 truncate max-w-[200px]" title={drawing.rejectReason}>
                                {drawing.rejectReason}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {hasPermission('view') && (
                            <button
                              onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/preview`)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="查看草图"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            )}
                            {drawing.status === 1 && hasPermission('generate') && (
                              <button
                                onClick={() => handleAIProcess(drawing.id)}
                                className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                                title="AI处理"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                            )}
                            {/* 待审核状态：仅审核员可查看AI图用于审核 */}
                            {drawing.status === 5 && drawing.dwgPath && hasPermission('review') && (
                              <button
                                onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/dwg-preview`)}
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="查看AI图（用于审核）"
                              >
                                <FileImage className="w-4 h-4" />
                              </button>
                            )}
                            {/* 已完成状态：有view权限即可查看 */}
                            {drawing.status === 3 && drawing.dwgPath && hasPermission('view') && (
                              <button
                                onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/dwg-preview`)}
                                className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                                title="查看AI处理后图纸"
                              >
                                <FileImage className="w-4 h-4" />
                              </button>
                            )}
                            {drawing.status === 5 && hasPermission('review') && (
                              <button
                                onClick={() => handleReviewClick(drawing.id)}
                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="审核"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {drawing.status === 6 && hasPermission('generate') && (
                              <button
                                onClick={() => handleResubmit(drawing.id)}
                                className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                                title="重新提交"
                              >
                                <Loader2 className="w-4 h-4" />
                              </button>
                            )}
                            {(hasPermission('generate') || hasPermission('upload')) && (
                              <button
                                onClick={() => handleRenameClick(drawing.id, drawing.name)}
                                className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                                title="重命名"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {drawing.status === 3 && hasPermission('download') && (
                              <button
                                onClick={() => showToast('开始下载DWG文件', 'success')}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="下载"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission('delete') && (
                              <button
                                onClick={() => showToast('草图已删除', 'success')}
                                className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                title="删除"
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
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  {filteredDrawings.map((drawing) => (
                    <div
                      key={drawing.id}
                      className="card overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-28 bg-gray-50 flex items-center justify-center">
                        <Image className="w-12 h-12 text-gray-300" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800 truncate mb-1">
                          {drawing.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {drawing.format} · {(drawing.size / 1024).toFixed(0)} KB
                        </p>
                        {drawing.status === 6 && drawing.rejectReason && (
                          <p className="text-xs text-red-600 mb-2 truncate" title={drawing.rejectReason}>
                            驳回原因：{drawing.rejectReason}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {getStatusTag(drawing.status)}
                          <div className="flex items-center gap-1">
                            {hasPermission('view') && (
                            <button
                              onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/preview`)}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                              title="查看草图"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            )}
                            {drawing.status === 1 && hasPermission('generate') && (
                              <button
                                onClick={() => handleAIProcess(drawing.id)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                                title="AI处理"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* 待审核状态：仅审核员可查看AI图用于审核 */}
                            {drawing.status === 5 && drawing.dwgPath && hasPermission('review') && (
                              <button
                                onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/dwg-preview`)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                                title="查看AI图（用于审核）"
                              >
                                <FileImage className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {/* 已完成状态：有view权限即可查看 */}
                            {drawing.status === 3 && drawing.dwgPath && hasPermission('view') && (
                              <button
                                onClick={() => navigate(`/projects/${id}/drawings/${drawing.id}/dwg-preview`)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-success-100 hover:text-success-600 transition-colors"
                                title="查看AI图"
                              >
                                <FileImage className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {drawing.status === 5 && hasPermission('review') && (
                              <button
                                onClick={() => handleReviewClick(drawing.id)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                                title="审核"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {drawing.status === 6 && hasPermission('generate') && (
                              <button
                                onClick={() => handleResubmit(drawing.id)}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                                title="重新提交"
                              >
                                <Loader2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRenameClick(drawing.id, drawing.name)}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-warning-100 hover:text-warning-600 transition-colors"
                              title="重命名"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {drawing.status === 3 && hasPermission('download') && (
                              <button
                                onClick={() => showToast('开始下载DWG文件', 'success')}
                                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                title="下载"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                共 {filteredDrawings.length} 条记录
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewDirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建目录</h2>
              <button
                onClick={() => setShowNewDirModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目录名称</label>
                <input
                  type="text"
                  value={newDirName}
                  onChange={(e) => setNewDirName(e.target.value)}
                  placeholder="请输入目录名称"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewDirModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newDirName.trim()) {
                      showToast(`目录 "${newDirName}" 创建成功`, 'success');
                      setShowNewDirModal(false);
                      setNewDirName('');
                    }
                  }}
                  className="btn-primary"
                >
                  确认创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">上传草图</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFileName('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所属目录</label>
                <select className="input-field">
                  <option value="">根目录</option>
                  {projectDirectories.map(dir => (
                    <option key={dir.id} value={dir.id}>{dir.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文件格式</label>
                <div className="grid grid-cols-3 gap-3">
                  {['JPG', 'PNG', 'PDF', 'BMP', 'TIFF', 'DWG(参考)'].map(format => (
                    <label
                      key={format}
                      className="flex items-center gap-2 p-3 rounded-lg border-2 border-gray-200 hover:border-primary-400 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={['JPG', 'PNG'].includes(format)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-primary-400 transition-colors cursor-pointer group"
                  onClick={() => setUploadFileName('朝阳路干线草图_20240615_v1.jpg')}
                >
                  <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4 group-hover:text-primary-400 transition-colors" />
                  {uploadFileName ? (
                    <div>
                      <p className="font-medium text-gray-800 mb-1">{uploadFileName}</p>
                      <p className="text-sm text-gray-500">文件大小：2.3 MB · 点击重新选择</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium mb-1">点击或拖拽文件到此处上传</p>
                      <p className="text-sm text-gray-400">支持多文件上传，单个文件不超过 50MB</p>
                    </div>
                  )}
                </div>
                {uploadFileName && (
                  <div className="mt-3 p-3 bg-primary-50 rounded-lg flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-800">{uploadFileName}</p>
                      <p className="text-xs text-primary-600">已选择，等待上传</p>
                    </div>
                    <button
                      onClick={() => setUploadFileName('')}
                      className="p-1 text-gray-400 hover:text-danger-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">图纸分类</label>
                  <select className="input-field">
                    <option value="1">干线图纸</option>
                    <option value="2">配线图纸</option>
                    <option value="3">引入图纸</option>
                    <option value="4">交接箱图纸</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上传人</label>
                  <input
                    type="text"
                    value="易裕丰"
                    readOnly
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注说明</label>
                <textarea
                  rows={2}
                  placeholder="请输入图纸备注说明信息（选填）"
                  className="input-field resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">上传后将自动触发：</p>
                    <ul className="space-y-0.5 list-disc pl-4">
                      <li>AI自动识别图纸中的标识和符号</li>
                      <li>提取关键信息（坐标、距离、设备类型等）</li>
                      <li>自动生成标准DWG格式文件</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFileName('');
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleStartUpload}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                开始上传
              </button>
            </div>
          </div>
        </div>
      )}

      {showAIEnhanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-500" />
                AI加强功能
              </h2>
              <button
                onClick={() => setShowAIEnhanceModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-accent-50 rounded-lg">
                <p className="text-sm text-accent-700">
                  通过上传标识数据（如图例、符号、标注规则等），可以增强AI模型的识别能力，提高图纸生成的准确性和质量。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标识图例文件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent-400 transition-colors cursor-pointer">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">点击或拖拽上传图例图片</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG、PDF 格式</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标注规则文件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent-400 transition-colors cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">点击或拖拽上传规则文件</p>
                  <p className="text-sm text-gray-400">支持 JSON、XML 格式</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">训练数据描述</label>
                <textarea
                  placeholder="请简要描述上传的数据内容，帮助AI模型更好地理解和学习..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">当前模型版本</p>
                  <p className="font-medium text-gray-800">v2.1.0 (已训练 12,580 张图纸)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">上次训练时间</p>
                  <p className="font-medium text-gray-800">2024-06-20 14:30:00</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAIEnhanceModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button className="btn-accent flex items-center gap-2">
                <Zap className="w-4 h-4" />
                开始训练
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary-500" />
                重命名图纸
              </h2>
              <button
                onClick={handleRenameCancel}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">图纸名称</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="请输入新的图纸名称"
                  className="input-field"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm();
                    if (e.key === 'Escape') handleRenameCancel();
                  }}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleRenameCancel}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleRenameConfirm}
                  disabled={!renameValue.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-500" />
                图纸审核
              </h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewingDrawing(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileImage className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {projectDrawings.find(d => d.id === reviewingDrawing)?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      上传人：{projectDrawings.find(d => d.id === reviewingDrawing)?.uploaderName} · 
                      {projectDrawings.find(d => d.id === reviewingDrawing)?.format} · 
                      {(projectDrawings.find(d => d.id === reviewingDrawing)?.size || 0 / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">DWG预览</p>
                <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-300" />
                  <span className="ml-3 text-gray-400">DWG预览区域</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">审核结果</label>
                <div className="flex items-center gap-4">
                  <label className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${reviewResult === 'pass' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="reviewResult"
                      value="pass"
                      checked={reviewResult === 'pass'}
                      onChange={() => setReviewResult('pass')}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium text-green-700">审核通过</span>
                  </label>
                  <label className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${reviewResult === 'reject' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="reviewResult"
                      value="reject"
                      checked={reviewResult === 'reject'}
                      onChange={() => setReviewResult('reject')}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-sm font-medium text-red-700">审核驳回</span>
                  </label>
                </div>
              </div>

              {reviewResult === 'reject' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    驳回原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请详细说明驳回原因，制图员需要根据此进行修改"
                    className="input-field resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    审核意见（选填）
                  </label>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="如有修改建议，请在此说明"
                    className="input-field resize-none"
                  />
                </div>
              )}

              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">审核后状态变更说明</p>
                    <ul className="space-y-0.5 list-disc pl-4">
                      <li>审核通过：图纸状态变为"已完成"，可下载DWG</li>
                      <li>审核驳回：图纸状态变为"已驳回"，需修改后重新提交</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewingDrawing(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleReviewConfirm}
                className={reviewResult === 'pass' ? 'btn-success' : 'btn-danger'}
              >
                确认{reviewResult === 'pass' ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 单张AI处理弹窗 */}
      {showSingleProcessModal && singleProcessDrawing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-500" />
                AI 智能图纸生成
              </h2>
              {singleProcessStatus !== 'processing' && (
                <button
                  onClick={closeSingleProcessModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5">
              {/* 草图信息 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {singleProcessDrawing.sketchPath ? (
                    <img src={singleProcessDrawing.sketchPath} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{singleProcessDrawing.name}</p>
                  <p className="text-xs text-gray-500">{singleProcessDrawing.format} · {singleProcessDrawing.size}MB</p>
                </div>
              </div>

              {/* 处理状态 */}
              {singleProcessStatus === 'idle' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    点击下方按钮，系统将调用AI模型对草图进行智能识别和处理
                  </p>
                  <button
                    onClick={startSingleProcess}
                    className="btn-primary flex items-center justify-center gap-2 w-full py-2.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    开始AI处理
                  </button>
                </div>
              )}

              {singleProcessStatus === 'processing' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">AI 处理中...</p>
                  <p className="text-xs text-gray-500 mb-4">正在调用AI模型识别草图，请稍候</p>
                  
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">处理进度</span>
                      <span className="font-medium text-primary-600">{Math.round(singleProcessProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-100"
                        style={{ width: `${singleProcessProgress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    已处理 {singleProcessTime}s
                  </p>
                </div>
              )}

              {singleProcessStatus === 'success' && (
                <div>
                  {/* 结果预览 */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                    {singleProcessResultUrl ? (
                      <img
                        src={singleProcessResultUrl}
                        alt="AI生成结果"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <FileImage className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-amber-800 text-sm">处理完成，等待审核</span>
                    </div>
                    <p className="text-xs text-amber-700">
                      DWG图纸已生成，当前状态为「待审核」。审核员确认通过后方可下载。
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeSingleProcessModal}
                      className="flex-1 btn-secondary py-2.5"
                    >
                      关闭
                    </button>
                    <button
                      onClick={() => {
                        closeSingleProcessModal();
                        navigate(`/projects/${id}/drawings?filter=5`);
                      }}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      前往审核
                    </button>
                  </div>
                </div>
              )}

              {singleProcessStatus === 'error' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">AI 处理失败</p>
                  <p className="text-xs text-gray-500 mb-4">{singleProcessError}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={closeSingleProcessModal}
                      className="btn-secondary"
                    >
                      关闭
                    </button>
                    <button
                      onClick={startSingleProcess}
                      className="btn-primary flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      重试
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 批量AI处理弹窗 */}
      {showBatchProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-500" />
                批量AI处理
              </h2>
              <button
                onClick={closeBatchProcessModal}
                disabled={batchProcessStatus === 'processing'}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* 待处理列表 */}
              {batchProcessStatus === 'idle' && (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      您选择了 <span className="font-bold text-blue-600">{batchResults.length}</span> 张图纸进行批量AI处理，处理完成后所有图纸状态将变为「待审核」
                    </p>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {batchResults.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <FileImage className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                        <span className="text-xs text-gray-400">待处理</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 处理中 */}
              {batchProcessStatus === 'processing' && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">处理进度</span>
                      <span className="text-sm text-primary-600">
                        {batchResults.filter((r) => r.status !== 'pending').length} / {batchResults.length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
                        style={{ width: `${(batchResults.filter((r) => r.status === 'success').length / batchResults.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {batchResults.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          item.status === 'processing'
                            ? 'bg-primary-50 border border-primary-200'
                            : item.status === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : item.status === 'error'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        {item.status === 'processing' && <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />}
                        {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                        <span className={`flex-1 text-sm truncate ${
                          item.status === 'processing'
                            ? 'text-primary-700 font-medium'
                            : item.status === 'success'
                            ? 'text-green-700'
                            : item.status === 'error'
                            ? 'text-red-700'
                            : 'text-gray-600'
                        }`}>{item.name}</span>
                        <span className="text-xs">
                          {item.status === 'processing' && '处理中...'}
                          {item.status === 'success' && '已完成'}
                          {item.status === 'error' && `失败：${item.message}`}
                          {item.status === 'pending' && '等待中'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 处理完成 */}
              {batchProcessStatus === 'completed' && (
                <>
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">批量处理完成</span>
                    </div>
                    <p className="text-sm text-green-700">
                      成功：<span className="font-bold">{batchResults.filter((r) => r.status === 'success').length}</span> 张，
                      失败：<span className="font-bold text-red-600">{batchResults.filter((r) => r.status === 'error').length}</span> 张
                    </p>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {batchResults.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.status === 'success'
                            ? 'bg-green-50'
                            : 'bg-red-50'
                        }`}
                      >
                        {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        <span className={`flex-1 text-sm truncate ${
                          item.status === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>{item.name}</span>
                        <span className={`text-xs ${
                          item.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.status === 'success' ? '已提交审核' : item.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              {batchProcessStatus === 'idle' && (
                <>
                  <button
                    onClick={closeBatchProcessModal}
                    className="btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={startBatchProcess}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    开始批量处理
                  </button>
                </>
              )}
              {batchProcessStatus === 'processing' && (
                <button
                  disabled
                  className="btn-primary flex items-center gap-2 opacity-70"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </button>
              )}
              {batchProcessStatus === 'completed' && (
                <>
                  <button
                    onClick={closeBatchProcessModal}
                    className="btn-secondary"
                  >
                    关闭
                  </button>
                  <button
                    onClick={() => {
                      closeBatchProcessModal();
                      navigate(`/projects/${id}/drawings?filter=5`);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    前往审核
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
