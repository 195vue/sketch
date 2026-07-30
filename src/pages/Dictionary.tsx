import { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Settings,
  List,
  ArrowLeft,
} from 'lucide-react';
import { showToast } from '../components/Toast';

interface DictType {
  id: string;
  code: string;
  name: string;
  description: string;
  itemCount: number;
  status: 'enabled' | 'disabled';
  updatedAt: string;
  isSystem: boolean;
}

interface DictItem {
  id: string;
  typeCode: string;
  label: string;
  value: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
}

const initialDictTypes: DictType[] = [
  { id: '1', code: 'project_status', name: '项目状态', description: '项目的生命周期状态', itemCount: 4, status: 'enabled', updatedAt: '2024-06-10 09:30', isSystem: true },
  { id: '2', code: 'drawing_status', name: '图纸状态', description: '图纸的审核与发布状态', itemCount: 5, status: 'enabled', updatedAt: '2024-06-09 14:20', isSystem: true },
  { id: '3', code: 'task_status', name: '任务状态', description: 'AI 出图任务的执行状态', itemCount: 5, status: 'enabled', updatedAt: '2024-06-08 16:45', isSystem: true },
  { id: '4', code: 'task_stage', name: '任务阶段', description: '项目流程中的阶段划分', itemCount: 6, status: 'enabled', updatedAt: '2024-06-07 11:15', isSystem: true },
  { id: '5', code: 'drawing_category', name: '图纸类别', description: '不同类型的竣工图纸分类', itemCount: 4, status: 'enabled', updatedAt: '2024-06-06 10:00', isSystem: true },
  { id: '6', code: 'file_format', name: '文件格式', description: '系统支持的文件格式', itemCount: 5, status: 'enabled', updatedAt: '2024-06-05 15:30', isSystem: true },
  { id: '7', code: 'laying_method', name: '敷设方式', description: '光缆的敷设方式', itemCount: 5, status: 'enabled', updatedAt: '2024-06-04 09:00', isSystem: true },
  { id: '8', code: 'annotation_type', name: '标注类型', description: '图纸上的标注类型', itemCount: 6, status: 'enabled', updatedAt: '2024-06-03 14:00', isSystem: true },
  { id: '9', code: 'online_status', name: '在线状态', description: '用户在线状态', itemCount: 3, status: 'enabled', updatedAt: '2024-06-02 11:30', isSystem: true },
  { id: '10', code: 'notification_type', name: '通知类型', description: '系统通知消息的类型', itemCount: 4, status: 'enabled', updatedAt: '2024-06-01 10:15', isSystem: true },
  { id: '11', code: 'user_status', name: '用户状态', description: '用户账号状态', itemCount: 3, status: 'enabled', updatedAt: '2024-05-31 16:00', isSystem: true },
  { id: '12', code: 'permission', name: '权限标识', description: '系统操作权限标识', itemCount: 6, status: 'enabled', updatedAt: '2024-05-30 09:45', isSystem: true },
  { id: '13', code: 'budget_type', name: '预算类型', description: '项目预算分类', itemCount: 3, status: 'enabled', updatedAt: '2024-05-29 14:30', isSystem: false },
  { id: '14', code: 'region_code', name: '行政区划', description: '项目所在地区编码', itemCount: 10, status: 'disabled', updatedAt: '2024-05-28 10:00', isSystem: false },
];

const initialDictItems: DictItem[] = [
  { id: '1', typeCode: 'project_status', label: '规划中', value: 'planning', sort: 1, status: 'enabled', remark: '项目初始规划阶段' },
  { id: '2', typeCode: 'project_status', label: '进行中', value: 'in_progress', sort: 2, status: 'enabled', remark: '项目执行阶段' },
  { id: '3', typeCode: 'project_status', label: '已完成', value: 'completed', sort: 3, status: 'enabled', remark: '项目已交付' },
  { id: '4', typeCode: 'project_status', label: '已取消', value: 'cancelled', sort: 4, status: 'disabled', remark: '项目已终止' },
  { id: '5', typeCode: 'drawing_status', label: '待审核', value: 'pending_review', sort: 1, status: 'enabled', remark: '' },
  { id: '6', typeCode: 'drawing_status', label: '审核中', value: 'reviewing', sort: 2, status: 'enabled', remark: '' },
  { id: '7', typeCode: 'drawing_status', label: '已通过', value: 'approved', sort: 3, status: 'enabled', remark: '' },
  { id: '8', typeCode: 'drawing_status', label: '已驳回', value: 'rejected', sort: 4, status: 'enabled', remark: '需重新修改' },
  { id: '9', typeCode: 'drawing_status', label: '已发布', value: 'published', sort: 5, status: 'enabled', remark: '' },
  { id: '10', typeCode: 'task_status', label: '等待中', value: 'pending', sort: 1, status: 'enabled', remark: '' },
  { id: '11', typeCode: 'task_status', label: '处理中', value: 'processing', sort: 2, status: 'enabled', remark: '' },
  { id: '12', typeCode: 'task_status', label: '成功', value: 'success', sort: 3, status: 'enabled', remark: '' },
  { id: '13', typeCode: 'task_status', label: '失败', value: 'failed', sort: 4, status: 'enabled', remark: '' },
  { id: '14', typeCode: 'task_status', label: '已取消', value: 'cancelled', sort: 5, status: 'disabled', remark: '' },
  { id: '15', typeCode: 'task_stage', label: '草图上传', value: 'sketch_upload', sort: 1, status: 'enabled', remark: '' },
  { id: '16', typeCode: 'task_stage', label: 'AI 识别', value: 'ai_recognition', sort: 2, status: 'enabled', remark: '' },
  { id: '17', typeCode: 'task_stage', label: '标注生成', value: 'annotation', sort: 3, status: 'enabled', remark: '' },
  { id: '18', typeCode: 'task_stage', label: '图纸合成', value: 'composition', sort: 4, status: 'enabled', remark: '' },
  { id: '19', typeCode: 'task_stage', label: '审核阶段', value: 'review', sort: 5, status: 'enabled', remark: '' },
  { id: '20', typeCode: 'task_stage', label: '完成', value: 'finish', sort: 6, status: 'enabled', remark: '' },
  { id: '21', typeCode: 'drawing_category', label: '杆路图', value: 'pole_line', sort: 1, status: 'enabled', remark: '' },
  { id: '22', typeCode: 'drawing_category', label: '光缆图', value: 'cable', sort: 2, status: 'enabled', remark: '' },
  { id: '23', typeCode: 'drawing_category', label: '分纤图', value: 'fiber_distribution', sort: 3, status: 'enabled', remark: '' },
  { id: '24', typeCode: 'drawing_category', label: '系统图', value: 'system', sort: 4, status: 'enabled', remark: '' },
  { id: '25', typeCode: 'file_format', label: 'DWG', value: 'dwg', sort: 1, status: 'enabled', remark: 'AutoCAD 格式' },
  { id: '26', typeCode: 'file_format', label: 'PDF', value: 'pdf', sort: 2, status: 'enabled', remark: '' },
  { id: '27', typeCode: 'file_format', label: 'DXF', value: 'dxf', sort: 3, status: 'enabled', remark: '' },
  { id: '28', typeCode: 'file_format', label: 'PNG', value: 'png', sort: 4, status: 'enabled', remark: '' },
  { id: '29', typeCode: 'file_format', label: 'SVG', value: 'svg', sort: 5, status: 'disabled', remark: '' },
  { id: '30', typeCode: 'laying_method', label: '架空', value: 'overhead', sort: 1, status: 'enabled', remark: '' },
  { id: '31', typeCode: 'laying_method', label: '直埋', value: 'direct_buried', sort: 2, status: 'enabled', remark: '' },
  { id: '32', typeCode: 'laying_method', label: '管道', value: 'pipe', sort: 3, status: 'enabled', remark: '' },
  { id: '33', typeCode: 'laying_method', label: '桥架', value: 'tray', sort: 4, status: 'enabled', remark: '' },
  { id: '34', typeCode: 'laying_method', label: '其他', value: 'other', sort: 5, status: 'disabled', remark: '' },
  { id: '35', typeCode: 'annotation_type', label: '杆号', value: 'pole_number', sort: 1, status: 'enabled', remark: '' },
  { id: '36', typeCode: 'annotation_type', label: '光缆型号', value: 'cable_model', sort: 2, status: 'enabled', remark: '' },
  { id: '37', typeCode: 'annotation_type', label: '分纤点', value: 'fiber_point', sort: 3, status: 'enabled', remark: '' },
  { id: '38', typeCode: 'annotation_type', label: '接头盒', value: 'joint_box', sort: 4, status: 'enabled', remark: '' },
  { id: '39', typeCode: 'annotation_type', label: '拉线', value: 'stay_wire', sort: 5, status: 'enabled', remark: '' },
  { id: '40', typeCode: 'annotation_type', label: '地线', value: 'ground_wire', sort: 6, status: 'disabled', remark: '' },
  { id: '41', typeCode: 'online_status', label: '在线', value: 'online', sort: 1, status: 'enabled', remark: '' },
  { id: '42', typeCode: 'online_status', label: '忙碌', value: 'busy', sort: 2, status: 'enabled', remark: '' },
  { id: '43', typeCode: 'online_status', label: '离线', value: 'offline', sort: 3, status: 'disabled', remark: '' },
  { id: '44', typeCode: 'notification_type', label: '系统通知', value: 'system', sort: 1, status: 'enabled', remark: '' },
  { id: '45', typeCode: 'notification_type', label: '任务提醒', value: 'task', sort: 2, status: 'enabled', remark: '' },
  { id: '46', typeCode: 'notification_type', label: '审核通知', value: 'review', sort: 3, status: 'enabled', remark: '' },
  { id: '47', typeCode: 'notification_type', label: '告警通知', value: 'alert', sort: 4, status: 'disabled', remark: '' },
  { id: '48', typeCode: 'user_status', label: '正常', value: 'active', sort: 1, status: 'enabled', remark: '' },
  { id: '49', typeCode: 'user_status', label: '已禁用', value: 'disabled', sort: 2, status: 'enabled', remark: '' },
  { id: '50', typeCode: 'user_status', label: '已锁定', value: 'locked', sort: 3, status: 'disabled', remark: '' },
  { id: '51', typeCode: 'permission', label: '上传', value: 'upload', sort: 1, status: 'enabled', remark: '' },
  { id: '52', typeCode: 'permission', label: '出图', value: 'generate', sort: 2, status: 'enabled', remark: '' },
  { id: '53', typeCode: 'permission', label: '下载', value: 'download', sort: 3, status: 'enabled', remark: '' },
  { id: '54', typeCode: 'permission', label: '删除', value: 'delete', sort: 4, status: 'enabled', remark: '' },
  { id: '55', typeCode: 'permission', label: '查看', value: 'view', sort: 5, status: 'enabled', remark: '' },
  { id: '56', typeCode: 'permission', label: '配置', value: 'configure', sort: 6, status: 'disabled', remark: '' },
  { id: '57', typeCode: 'budget_type', label: '年度预算', value: 'annual', sort: 1, status: 'enabled', remark: '' },
  { id: '58', typeCode: 'budget_type', label: '项目预算', value: 'project', sort: 2, status: 'enabled', remark: '' },
  { id: '59', typeCode: 'budget_type', label: '临时预算', value: 'temporary', sort: 3, status: 'disabled', remark: '' },
  { id: '60', typeCode: 'region_code', label: '北京市', value: '110000', sort: 1, status: 'enabled', remark: '' },
];

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primary-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const Dictionary = () => {
  const [dictTypes, setDictTypes] = useState<DictType[]>(initialDictTypes);
  const [dictItems, setDictItems] = useState<DictItem[]>(initialDictItems);

  const [typeSearch, setTypeSearch] = useState('');
  const [typeStatusFilter, setTypeStatusFilter] = useState('all');

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showItemsManager, setShowItemsManager] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'type' | 'item'; id: string } | null>(null);

  const [currentManageType, setCurrentManageType] = useState<DictType | null>(null);
  const [itemSearch, setItemSearch] = useState('');
  const [itemStatusFilter, setItemStatusFilter] = useState('all');

  const [editingType, setEditingType] = useState<DictType | null>(null);
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);

  const [typeForm, setTypeForm] = useState({ code: '', name: '', description: '', status: 'enabled' as 'enabled' | 'disabled' });
  const [itemForm, setItemForm] = useState({ typeCode: '', label: '', value: '', sort: 1, status: 'enabled' as 'enabled' | 'disabled', remark: '' });

  const filteredDictTypes = dictTypes.filter((t) => {
    const matchesSearch =
      !typeSearch ||
      t.code.toLowerCase().includes(typeSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(typeSearch.toLowerCase());
    const matchesStatus = typeStatusFilter === 'all' || t.status === typeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentTypeItems = currentManageType
    ? dictItems.filter((i) => i.typeCode === currentManageType.code)
    : [];

  const filteredCurrentTypeItems = currentTypeItems.filter((i) => {
    const matchesSearch =
      !itemSearch ||
      i.label.toLowerCase().includes(itemSearch.toLowerCase()) ||
      i.value.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesStatus = itemStatusFilter === 'all' || i.status === itemStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTypeName = (code: string) => dictTypes.find((t) => t.code === code)?.name || code;

  const handleOpenTypeModal = (type?: DictType) => {
    if (type) {
      setEditingType(type);
      setTypeForm({
        code: type.code,
        name: type.name,
        description: type.description,
        status: type.status,
      });
    } else {
      setEditingType(null);
      setTypeForm({ code: '', name: '', description: '', status: 'enabled' });
    }
    setShowTypeModal(true);
  };

  const handleSaveType = () => {
    if (!typeForm.code.trim() || !typeForm.name.trim()) {
      showToast('请填写必填字段', 'error');
      return;
    }
    if (editingType) {
      setDictTypes((prev) =>
        prev.map((t) =>
          t.id === editingType.id
            ? { ...t, name: typeForm.name, description: typeForm.description, status: typeForm.status, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') }
            : t
        )
      );
      showToast('字典类型更新成功', 'success');
    } else {
      if (dictTypes.some((t) => t.code === typeForm.code)) {
        showToast('编码已存在，请更换', 'error');
        return;
      }
      const newType: DictType = {
        id: String(Date.now()),
        code: typeForm.code,
        name: typeForm.name,
        description: typeForm.description,
        itemCount: 0,
        status: typeForm.status,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        isSystem: false,
      };
      setDictTypes((prev) => [newType, ...prev]);
      showToast('字典类型创建成功', 'success');
    }
    setShowTypeModal(false);
  };

  const handleOpenItemModal = (item?: DictItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        typeCode: item.typeCode,
        label: item.label,
        value: item.value,
        sort: item.sort,
        status: item.status,
        remark: item.remark,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        typeCode: currentManageType?.code || '',
        label: '',
        value: '',
        sort: 1,
        status: 'enabled',
        remark: '',
      });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.typeCode || !itemForm.label.trim() || !itemForm.value.trim()) {
      showToast('请填写必填字段', 'error');
      return;
    }
    if (editingItem) {
      setDictItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id
            ? { ...i, typeCode: itemForm.typeCode, label: itemForm.label, value: itemForm.value, sort: itemForm.sort, status: itemForm.status, remark: itemForm.remark }
            : i
        )
      );
      showToast('字典数据更新成功', 'success');
    } else {
      const newItem: DictItem = {
        id: String(Date.now()),
        typeCode: itemForm.typeCode,
        label: itemForm.label,
        value: itemForm.value,
        sort: itemForm.sort,
        status: itemForm.status,
        remark: itemForm.remark,
      };
      setDictItems((prev) => [newItem, ...prev]);
      setDictTypes((prev) =>
        prev.map((t) => (t.code === itemForm.typeCode ? { ...t, itemCount: t.itemCount + 1 } : t))
      );
      showToast('字典数据创建成功', 'success');
    }
    setShowItemModal(false);
  };

  const handleSwitchTypeStatus = (id: string) => {
    setDictTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'enabled' ? 'disabled' : 'enabled' } : t))
    );
  };

  const handleSwitchItemStatus = (id: string) => {
    setDictItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === 'enabled' ? 'disabled' : 'enabled' } : i))
    );
  };

  const handleManageItems = (type: DictType) => {
    setCurrentManageType(type);
    setItemSearch('');
    setItemStatusFilter('all');
    setShowItemsManager(true);
  };

  const handleDeleteClick = (kind: 'type' | 'item', id: string) => {
    setDeleteTarget({ kind, id });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'type') {
      const type = dictTypes.find((t) => t.id === deleteTarget.id);
      setDictTypes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (type) {
        setDictItems((prev) => prev.filter((i) => i.typeCode !== type.code));
      }
      showToast('字典类型及其数据已删除', 'success');
    } else {
      const item = dictItems.find((i) => i.id === deleteTarget.id);
      setDictItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      if (item) {
        setDictTypes((prev) =>
          prev.map((t) => (t.code === item.typeCode ? { ...t, itemCount: Math.max(0, t.itemCount - 1) } : t))
        );
      }
      showToast('字典数据已删除', 'success');
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">字典管理</h1>
          <p className="text-gray-500 mt-1">管理系统字典类型和字典数据</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Settings className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">字典管理使用说明</p>
          <ul className="space-y-0.5 list-disc pl-4">
            <li><strong>字典类型</strong>：定义字典的分类，如"项目状态"、"图纸状态"等</li>
            <li><strong>字典数据</strong>：在类型下的具体选项，如"项目状态"下的"规划中"、"进行中"、"已完成"等</li>
            <li>在"字典类型管理"中点击「数据」按钮，可打开弹窗维护对应类型的字典数据</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-500" />
            字典类型管理
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索编码或名称..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="input-field pl-10 w-64"
                  />
                </div>
                <select
                  value={typeStatusFilter}
                  onChange={(e) => setTypeStatusFilter(e.target.value)}
                  className="input-field w-32"
                >
                  <option value="all">全部状态</option>
                  <option value="enabled">启用</option>
                  <option value="disabled">停用</option>
                </select>
              </div>
              <button onClick={() => handleOpenTypeModal()} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新增类型
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">编码</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">名称</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">描述</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">字典项数</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">更新时间</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="table-zebra">
                  {filteredDictTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          {type.code}
                          {type.isSystem && (
                            <span className="px-1.5 py-0.5 bg-primary-50 text-primary-600 text-xs rounded">
                              系统
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{type.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{type.description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{type.itemCount}</td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={type.status === 'enabled'}
                          onChange={() => handleSwitchTypeStatus(type.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{type.updatedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleManageItems(type)}
                            className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-1"
                            title="查看该类型的字典数据"
                          >
                            <List className="w-3.5 h-3.5" />
                            数据
                          </button>
                          <button
                            onClick={() => handleOpenTypeModal(type)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick('type', type.id)}
                            className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDictTypes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingType ? '编辑字典类型' : '新增字典类型'}
              </h2>
              <button
                onClick={() => setShowTypeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  编码 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={typeForm.code}
                  onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                  disabled={editingType?.isSystem}
                  className={`input-field w-full ${
                    editingType?.isSystem ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  placeholder="请输入字典编码，如 project_status"
                />
                {editingType?.isSystem && (
                  <p className="text-xs text-gray-400 mt-1">系统内置类型，编码不可修改</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="请输入字典名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="input-field w-full resize-none"
                  rows={3}
                  placeholder="请输入字典描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态 <span className="text-danger-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type-status"
                      value="enabled"
                      checked={typeForm.status === 'enabled'}
                      onChange={() => setTypeForm({ ...typeForm, status: 'enabled' })}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">启用</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type-status"
                      value="disabled"
                      checked={typeForm.status === 'disabled'}
                      onChange={() => setTypeForm({ ...typeForm, status: 'disabled' })}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">停用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowTypeModal(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSaveType} className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemsManager && currentManageType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowItemsManager(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <List className="w-5 h-5 text-primary-500" />
                    字典数据管理
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    当前类型：<span className="font-medium text-primary-600">{currentManageType.name}</span>
                    （编码：{currentManageType.code}）· 共 {currentManageType.itemCount} 条数据
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowItemsManager(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索标签或值..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="input-field pl-10 w-64"
                    />
                  </div>
                  <select
                    value={itemStatusFilter}
                    onChange={(e) => setItemStatusFilter(e.target.value)}
                    className="input-field w-32"
                  >
                    <option value="all">全部状态</option>
                    <option value="enabled">启用</option>
                    <option value="disabled">停用</option>
                  </select>
                </div>
                <button
                  onClick={() => handleOpenItemModal()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新增数据
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">标签</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">值</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">排序</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">备注</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="table-zebra">
                    {filteredCurrentTypeItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.value}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.sort}</td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={item.status === 'enabled'}
                            onChange={() => handleSwitchItemStatus(item.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.remark || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick('item', item.id)}
                              className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCurrentTypeItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                共 {filteredCurrentTypeItems.length} 条数据
              </div>
              <button
                onClick={() => setShowItemsManager(false)}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? '编辑字典数据' : '新增字典数据'}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属类型 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={itemForm.typeCode}
                  onChange={(e) => setItemForm({ ...itemForm, typeCode: e.target.value })}
                  disabled={!editingItem}
                  className={`input-field w-full ${!editingItem ? 'bg-gray-50 text-gray-500' : ''}`}
                >
                  {currentManageType && (
                    <option value={currentManageType.code}>
                      {currentManageType.name}
                    </option>
                  )}
                  {!currentManageType && <option value="">请选择字典类型</option>}
                  {dictTypes
                    .filter((t) => !currentManageType || t.code !== currentManageType.code)
                    .map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name}
                      </option>
                    ))}
                </select>
                {!editingItem && currentManageType && (
                  <p className="text-xs text-gray-400 mt-1">当前正在维护「{currentManageType.name}」的数据</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.label}
                  onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                  className="input-field w-full"
                  placeholder="请输入字典标签（显示名称）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  值 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.value}
                  onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                  className="input-field w-full"
                  placeholder="请输入字典值"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
                <input
                  type="number"
                  value={itemForm.sort}
                  onChange={(e) => setItemForm({ ...itemForm, sort: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                  placeholder="数值越小越靠前"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态 <span className="text-danger-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="item-status"
                      value="enabled"
                      checked={itemForm.status === 'enabled'}
                      onChange={() => setItemForm({ ...itemForm, status: 'enabled' })}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">启用</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="item-status"
                      value="disabled"
                      checked={itemForm.status === 'disabled'}
                      onChange={() => setItemForm({ ...itemForm, status: 'disabled' })}
                      className="text-primary-600"
                    />
                    <span className="text-sm text-gray-700">停用</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={itemForm.remark}
                  onChange={(e) => setItemForm({ ...itemForm, remark: e.target.value })}
                  className="input-field w-full resize-none"
                  rows={2}
                  placeholder="请输入备注信息（可选）"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowItemModal(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSaveItem} className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">确认删除</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {deleteTarget?.kind === 'type'
                    ? '删除字典类型将同时删除其下所有字典数据，确定继续？'
                    : '删除后不可恢复，确定继续？'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleConfirmDelete} className="btn-primary bg-danger-500 hover:bg-danger-600">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
