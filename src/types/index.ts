export interface Tenant {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  status: number;
  projectCount: number;
  userCount: number;
  createdAt: string;
  lastActive: string;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  managerId: string;
  managerName: string;
  startDate: string;
  endDate: string;
  status: number;
  remark: string;
  drawingCount: number;
  memberCount: number;
  createdAt: string;
}

export interface Member {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  role: string;
  permissions: string[];
  joinedAt: string;
  onlineStatus: number;
  currentAction?: string;
}

export interface Directory {
  id: string;
  projectId: string;
  parentId: string;
  name: string;
  createdAt: string;
  children?: Directory[];
}

export interface Drawing {
  id: string;
  projectId: string;
  directoryId: string;
  name: string;
  originalName: string;
  format: string;
  size: number;
  status: number;
  uploaderId: string;
  uploaderName: string;
  uploadedAt: string;
  sketchPath?: string;
  dwgPath?: string;
  generatedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
  reviewerName?: string;
  rejectReason?: string;
}

export interface Task {
  id: string;
  drawingId: string;
  drawingName: string;
  projectId: string;
  projectName: string;
  status: number;
  stage: string;
  progress: number;
  submitterId: string;
  submitterName: string;
  submittedAt: string;
  startedAt?: string;
  completedAt?: string;
  exceptionReason?: string;
  retryCount: number;
  stages?: {
    drawingParsing?: number;
    featureExtraction?: number;
    dwgGeneration?: number;
  };
}

export interface OperationLog {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  actionType: string;
  targetType: string;
  targetId: string;
  targetName: string;
  result: number;
  ipAddress: string;
  createdAt: string;
  detail?: string | Record<string, unknown>;
  errorMessage?: string;
}

export interface AnnotationSettings {
  poleNumberPrefix: string;
  poleNumberStart: number;
  poleNumberStep: number;
  routeNumberPrefix: string;
  routeNumberStart: number;
  fiberDistributionFormat: string;
  layingMethodFormat: string;
}

export interface LayerSettings {
  layers: LayerConfig[];
}

export interface LayerConfig {
  name: string;
  color: string;
  lineType: string;
  lineWidth: string;
  fontStyle: string;
}

export interface ExportSettings {
  frameTemplate: string;
  scale: string;
  legendItems: string[];
  paperSize: string;
}

export interface SystemSettings {
  maxUploadSize: number;
  taskTimeout: number;
  logRetentionDays: number;
  loginFailedLockCount: number;
  lockDuration: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  tenantId?: string;
  tenantName?: string;
}

export interface DashboardStats {
  projectCount: number;
  drawingCount: number;
  monthlyExportCount: number;
  pendingTaskCount: number;
  successRate: number;
  exceptionRate: number;
}

export const RoleMap: Record<string, string> = {
  'super_admin': '超级管理员',
  'tenant_admin': '租户管理员',
  'project_admin': '项目管理员',
  'cartographer': '制图员',
  'auditor': '审核员',
  'browser': '浏览员',
};

export const ProjectStatusMap: Record<number, string> = {
  1: '进行中',
  2: '已完成',
  3: '已归档',
  4: '已作废',
};

export const DrawingStatusMap: Record<number, string> = {
  1: '未出图',
  2: '处理中',
  5: '待审核',
  3: '已完成',
  6: '已驳回',
  4: '异常',
};

export const TaskStatusMap: Record<number, string> = {
  1: '待处理',
  2: '处理中',
  3: '已完成',
  4: '异常',
};

export const TaskStageMap: Record<string, string> = {
  'preprocessing': '预处理中',
  'ai_recognition': 'AI识别中',
  'vectorization': '矢量化中',
  'annotation': '标注中',
  'dwg_generation': 'DWG生成中',
};

export const ActionTypeMap: Record<string, string> = {
  'login': '登录',
  'logout': '登出',
  'upload': '上传草图',
  'export': '提交出图',
  'download': '下载DWG',
  'delete': '删除文件',
  'add_member': '添加成员',
  'remove_member': '移除成员',
  'change_role': '角色变更',
  'update_project': '项目修改',
  'update_settings': '配置变更',
  'rename': '重命名文件',
  'config_permission': '权限配置',
  'create_tenant': '创建租户',
  'toggle_tenant': '启停用租户',
  'review_pass': '审核通过',
  'review_reject': '审核驳回',
};

export type ProjectPermission = 'upload' | 'generate' | 'review' | 'download' | 'delete' | 'view' | 'configure';

export const PermissionMap: Record<ProjectPermission, string> = {
  upload: '上传草图',
  generate: '提交出图',
  review: '审核图纸',
  download: '下载DWG',
  delete: '删除文件',
  view: '查看图纸',
  configure: '配置权限',
};

export type ProjectRole = 'project_admin' | 'cartographer' | 'auditor' | 'browser';

export const RolePermissionMap: Record<ProjectRole, ProjectPermission[]> = {
  project_admin: ['upload', 'generate', 'review', 'download', 'delete', 'view', 'configure'],
  cartographer: ['upload', 'generate', 'download', 'delete', 'view'],
  auditor: ['review', 'download', 'view'],
  browser: ['view'],
};

export const OnlineStatusMap: Record<number, string> = {
  0: '离线',
  1: '在线',
  2: '忙碌',
};

export interface TenantConfig {
  id: string;
  tenantId: string;
  annotationSettings: AnnotationSettings;
  layerSettings: LayerConfig[];
  exportSettings: ExportSettings;
  updatedAt: string;
}