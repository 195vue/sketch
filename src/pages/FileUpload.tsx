import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { projects } from '../utils/mockData';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export const FileUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedProject, setSelectedProject] = useState('p001');
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (fileList: File[]) => {
    const newFiles: UploadFile[] = fileList.map((file) => {
      const isValidType = allowedTypes.includes(file.type);
      const isValidSize = file.size <= maxFileSize;

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: !isValidType ? 'error' : !isValidSize ? 'error' : 'pending',
        progress: 0,
        error: !isValidType
          ? '文件格式不支持，仅支持 JPG/PNG/BMP/PDF'
          : !isValidSize
          ? `文件大小超过50MB限制`
          : undefined,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFile = async (file: UploadFile) => {
    if (file.status !== 'pending') return;

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, status: 'uploading' } : f))
    );

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === file.id) {
            const newProgress = f.progress + Math.random() * 20;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'completed' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        })
      );
    }, 300);
  };

  const uploadAll = () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    pendingFiles.forEach((file) => uploadFile(file));
  };

  const handleUploadComplete = () => {
    const completedFiles = files.filter((f) => f.status === 'completed');
    if (completedFiles.length > 0) {
      setShowUploadSuccess(true);
    }
  };

  useEffect(() => {
    const allCompleted = files.length > 0 && files.every((f) => f.status === 'completed');
    if (allCompleted) {
      handleUploadComplete();
    }
  }, [files]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-primary-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">文件上传</h1>
          <p className="text-gray-500 mt-1">
            上传草图图片，系统将自动进行AI识别并生成标准竣工图纸
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="input-field"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {completedCount > 0 && (
            <button
              onClick={() => navigate('/ai/recognition')}
              className="btn-primary flex items-center gap-2"
            >
              查看识别结果
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.bmp,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {isDragging ? '释放文件以上传' : '拖拽文件到此处上传'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              或点击选择文件
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                支持格式: JPG / PNG / BMP / PDF
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              单文件最大支持 50MB，支持批量上传
            </p>
          </div>

          {files.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-6 mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    共 {files.length} 个文件
                  </span>
                  {pendingCount > 0 && (
                    <span className="tag tag-pending">{pendingCount} 待上传</span>
                  )}
                  {uploadingCount > 0 && (
                    <span className="tag tag-processing">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {uploadingCount} 上传中
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span className="tag tag-completed">{completedCount} 已完成</span>
                  )}
                  {errorCount > 0 && (
                    <span className="tag tag-exception">{errorCount} 错误</span>
                  )}
                </div>
                {pendingCount > 0 && (
                  <button onClick={uploadAll} className="btn-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    开始上传
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                    <div className="col-span-5">文件名</div>
                    <div className="col-span-2">大小</div>
                    <div className="col-span-3">进度</div>
                    <div className="col-span-1">状态</div>
                    <div className="col-span-1">操作</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {files.map((file) => (
                    <div key={file.id} className="px-4 py-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{file.type}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">
                          {formatFileSize(file.size)}
                        </div>
                        <div className="col-span-3">
                          {file.status === 'uploading' && (
                            <div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary-600 rounded-full transition-all"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {file.progress.toFixed(0)}%
                              </p>
                            </div>
                          )}
                          {file.status === 'pending' && (
                            <p className="text-xs text-gray-400">等待上传</p>
                          )}
                          {file.status === 'completed' && (
                            <p className="text-xs text-success-600">上传完成</p>
                          )}
                          {file.status === 'error' && (
                            <p className="text-xs text-danger-600">{file.error}</p>
                          )}
                        </div>
                        <div className="col-span-1">
                          {file.status === 'pending' && (
                            <span className="tag tag-pending">待上传</span>
                          )}
                          {file.status === 'uploading' && (
                            <span className="tag tag-processing">上传中</span>
                          )}
                          {file.status === 'completed' && (
                            <span className="tag tag-completed">已完成</span>
                          )}
                          {file.status === 'error' && (
                            <span className="tag tag-exception">错误</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="col-span-4 space-y-4">
          <div className="card p-4">
            <h3 className="font-medium text-gray-800 mb-4">上传流程</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">上传草图</p>
                  <p className="text-xs text-gray-500 mt-1">
                    选择项目后上传草图图片，支持JPG/PNG/BMP/PDF格式
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">AI智能识别</p>
                  <p className="text-xs text-gray-500 mt-1">
                    系统自动识别草图中的杆号、路由、分纤点等关键信息
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-green-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">生成竣工图</p>
                  <p className="text-xs text-gray-500 mt-1">
                    基于识别结果自动生成标准DWG格式竣工图纸
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-orange-600">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">下载导出</p>
                  <p className="text-xs text-gray-500 mt-1">
                    在线预览并下载生成的DWG图纸文件
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-gray-800 mb-4">文件格式要求</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-700">JPG/PNG/BMP</span>
                </div>
                <span className="text-xs text-gray-500">≤ 50MB</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">PDF</span>
                </div>
                <span className="text-xs text-gray-500">≤ 50MB</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              建议上传分辨率≥1920×1080的清晰图片，以获得最佳识别效果
            </p>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-gray-800 mb-4">最近上传</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    朝阳区-线路A01.jpg
                  </p>
                  <p className="text-xs text-gray-500">2.3 MB</p>
                </div>
                <span className="text-xs text-gray-400">10分钟前</span>
              </div>
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    浦东新区-主干线B01.pdf
                  </p>
                  <p className="text-xs text-gray-500">4.5 MB</p>
                </div>
                <span className="text-xs text-gray-400">30分钟前</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUploadSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">上传成功</h2>
              <p className="text-gray-500 mb-6">
                已成功上传 {completedCount} 个文件，系统正在进行AI识别处理
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowUploadSuccess(false)}
                  className="btn-secondary"
                >
                  继续上传
                </button>
                <button
                  onClick={() => {
                    setShowUploadSuccess(false);
                    navigate('/ai/recognition');
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  查看识别结果
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
