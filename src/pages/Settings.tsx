import { useState } from 'react';
import {
  Save,
  RotateCcw,
  Tag,
  Layers,
  FileText,
  Settings2,
  Palette,
  Type,
  Scale,
  Upload,
  Download,
  X,
  CheckCircle,
  Lock,
  Shield,
  KeyRound,
} from 'lucide-react';
import { showToast } from '../components/Toast';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('annotation');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [annotationSettings, setAnnotationSettings] = useState({
    poleNumberPrefix: 'A',
    poleNumberStart: 1,
    poleNumberStep: 1,
    routeNumberPrefix: 'R',
    routeNumberStart: 1,
    fiberDistributionFormat: 'F{number}',
    layingMethodFormat: '架空',
  });
  const [layerSettings, setLayerSettings] = useState([
    { name: '杆路层', color: '#ef4444', lineType: 'solid', lineWidth: '0.35mm', fontStyle: '宋体' },
    { name: '光缆层', color: '#3b82f6', lineType: 'dashed', lineWidth: '0.25mm', fontStyle: '宋体' },
    { name: '分纤层', color: '#10b981', lineType: 'solid', lineWidth: '0.35mm', fontStyle: '宋体' },
    { name: '标注层', color: '#f59e0b', lineType: 'solid', lineWidth: '0.25mm', fontStyle: '仿宋' },
    { name: '辅助层', color: '#8b5cf6', lineType: 'dotted', lineWidth: '0.20mm', fontStyle: '宋体' },
  ]);
  const [exportSettings, setExportSettings] = useState({
    frameTemplate: 'standard_a3',
    scale: '1:100',
    legendItems: ['杆位', '光缆路由', '分纤点', '接头'],
    paperSize: 'A3',
  });
  const [systemSettings, setSystemSettings] = useState({
    maxUploadSize: 10,
    taskTimeout: 5,
    logRetentionDays: 180,
    loginFailedLockCount: 5,
    lockDuration: 30,
  });
  const [encryptionSettings, setEncryptionSettings] = useState({
    enabled: true,
    algorithm: 'AES-256',
    keyRotationDays: 90,
    encryptAtRest: true,
    encryptInTransit: true,
    keyManagement: '自动',
    lastRotation: '2024-06-01',
  });
  const handleSave = () => {
    showToast('配置保存成功', 'success');
  };

  const handleReset = () => {
    if (confirm('确认将当前配置恢复为默认值？')) {
      switch (activeTab) {
        case 'annotation':
          setAnnotationSettings({
            poleNumberPrefix: 'A',
            poleNumberStart: 1,
            poleNumberStep: 1,
            routeNumberPrefix: 'R',
            routeNumberStart: 1,
            fiberDistributionFormat: 'F{number}',
            layingMethodFormat: '架空',
          });
          break;
        case 'layers':
          setLayerSettings([
            { name: '杆路层', color: '#ef4444', lineType: 'solid', lineWidth: '0.35mm', fontStyle: '宋体' },
            { name: '光缆层', color: '#3b82f6', lineType: 'dashed', lineWidth: '0.25mm', fontStyle: '宋体' },
            { name: '分纤层', color: '#10b981', lineType: 'solid', lineWidth: '0.35mm', fontStyle: '宋体' },
            { name: '标注层', color: '#f59e0b', lineType: 'solid', lineWidth: '0.25mm', fontStyle: '仿宋' },
            { name: '辅助层', color: '#8b5cf6', lineType: 'dotted', lineWidth: '0.20mm', fontStyle: '宋体' },
          ]);
          break;
        case 'export':
          setExportSettings({
            frameTemplate: 'standard_a3',
            scale: '1:100',
            legendItems: ['杆位', '光缆路由', '分纤点', '接头'],
            paperSize: 'A3',
          });
          break;
        case 'system':
          setSystemSettings({
            maxUploadSize: 10,
            taskTimeout: 5,
            logRetentionDays: 180,
            loginFailedLockCount: 5,
            lockDuration: 30,
          });
          break;
        case 'encryption':
          setEncryptionSettings({
            enabled: true,
            algorithm: 'AES-256',
            keyRotationDays: 90,
            encryptAtRest: true,
            encryptInTransit: true,
            keyManagement: '自动',
            lastRotation: '2024-06-01',
          });
          break;
      }
    }
  };

  const tabs = [
    { id: 'annotation', label: '标注规则', icon: Tag },
    { id: 'layers', label: '图层标准', icon: Layers },
    { id: 'export', label: '出图规范', icon: FileText },
    { id: 'system', label: '系统参数', icon: Settings2 },
    { id: 'encryption', label: '数据加密', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">系统配置</h1>
          <p className="text-gray-500 mt-1">配置系统运行参数和出图规则</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowExportModal(true);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出配置
          </button>
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportFileName('');
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入配置
          </button>
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            恢复默认
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'annotation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">杆号命名规则</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      前缀 <span className="text-gray-400">(1-5字符)</span>
                    </label>
                    <input
                      type="text"
                      value={annotationSettings.poleNumberPrefix}
                      onChange={(e) =>
                        setAnnotationSettings({
                          ...annotationSettings,
                          poleNumberPrefix: e.target.value,
                        })
                      }
                      className="input-field"
                      maxLength={5}
                    />
                    <p className="text-xs text-gray-500 mt-1">示例：A、GH、POLE</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      起始编号 <span className="text-gray-400">(正整数)</span>
                    </label>
                    <input
                      type="number"
                      value={annotationSettings.poleNumberStart}
                      onChange={(e) =>
                        setAnnotationSettings({
                          ...annotationSettings,
                          poleNumberStart: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-field"
                      min={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">示例：1、100、001</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      步长 <span className="text-gray-400">(正整数)</span>
                    </label>
                    <input
                      type="number"
                      value={annotationSettings.poleNumberStep}
                      onChange={(e) =>
                        setAnnotationSettings({
                          ...annotationSettings,
                          poleNumberStep: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-field"
                      min={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">示例：1、2、5</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">预览：</span>
                  <span className="text-sm font-medium text-primary-600">
                    {annotationSettings.poleNumberPrefix}
                    {String(annotationSettings.poleNumberStart).padStart(3, '0')}、
                    {annotationSettings.poleNumberPrefix}
                    {String(annotationSettings.poleNumberStart + annotationSettings.poleNumberStep).padStart(3, '0')}、...
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">路由编号规则</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      前缀 <span className="text-gray-400">(1-5字符)</span>
                    </label>
                    <input
                      type="text"
                      value={annotationSettings.routeNumberPrefix}
                      onChange={(e) =>
                        setAnnotationSettings({
                          ...annotationSettings,
                          routeNumberPrefix: e.target.value,
                        })
                      }
                      className="input-field"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      起始编号 <span className="text-gray-400">(正整数)</span>
                    </label>
                    <input
                      type="number"
                      value={annotationSettings.routeNumberStart}
                      onChange={(e) =>
                        setAnnotationSettings({
                          ...annotationSettings,
                          routeNumberStart: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-field"
                      min={1}
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">预览：</span>
                  <span className="text-sm font-medium text-primary-600">
                    {annotationSettings.routeNumberPrefix}
                    {String(annotationSettings.routeNumberStart).padStart(3, '0')}、
                    {annotationSettings.routeNumberPrefix}
                    {String(annotationSettings.routeNumberStart + 1).padStart(3, '0')}、...
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">分纤点标注格式</h3>
                <select
                  value={annotationSettings.fiberDistributionFormat}
                  onChange={(e) =>
                    setAnnotationSettings({
                      ...annotationSettings,
                      fiberDistributionFormat: e.target.value,
                    })
                  }
                  className="input-field w-64"
                >
                  <option value="F{number}">F001、F002...</option>
                  <option value="FP{number}">FP001、FP002...</option>
                  <option value="FX{number}">FX001、FX002...</option>
                  <option value="{number}号分纤点">1号分纤点、2号分纤点...</option>
                </select>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">敷设方式标注规则</h3>
                <select
                  value={annotationSettings.layingMethodFormat}
                  onChange={(e) =>
                    setAnnotationSettings({
                      ...annotationSettings,
                      layingMethodFormat: e.target.value,
                    })
                  }
                  className="input-field w-64"
                >
                  <option value="架空">架空</option>
                  <option value="直埋">直埋</option>
                  <option value="管道">管道</option>
                  <option value="桥架">桥架</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        图层名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        颜色
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        线型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        线宽
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                        字体样式
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-zebra">
                    {layerSettings.map((layer, index) => (
                      <tr key={layer.name}>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {layer.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={layer.color}
                              onChange={(e) => {
                                const newLayers = [...layerSettings];
                                newLayers[index] = { ...newLayers[index], color: e.target.value };
                                setLayerSettings(newLayers);
                              }}
                              className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                            />
                            <span className="text-sm text-gray-600">{layer.color}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={layer.lineType}
                            onChange={(e) => {
                              const newLayers = [...layerSettings];
                              newLayers[index] = { ...newLayers[index], lineType: e.target.value };
                              setLayerSettings(newLayers);
                            }}
                            className="input-field"
                          >
                            <option value="solid">实线</option>
                            <option value="dashed">虚线</option>
                            <option value="dotted">点划线</option>
                            <option value="double-dotted">双点划线</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={layer.lineWidth}
                            onChange={(e) => {
                              const newLayers = [...layerSettings];
                              newLayers[index] = { ...newLayers[index], lineWidth: e.target.value };
                              setLayerSettings(newLayers);
                            }}
                            className="input-field"
                          >
                            <option value="0.20mm">0.20mm</option>
                            <option value="0.25mm">0.25mm</option>
                            <option value="0.35mm">0.35mm</option>
                            <option value="0.50mm">0.50mm</option>
                            <option value="0.70mm">0.70mm</option>
                            <option value="1.0mm">1.0mm</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={layer.fontStyle}
                            onChange={(e) => {
                              const newLayers = [...layerSettings];
                              newLayers[index] = { ...newLayers[index], fontStyle: e.target.value };
                              setLayerSettings(newLayers);
                            }}
                            className="input-field"
                          >
                            <option value="宋体">宋体</option>
                            <option value="仿宋">仿宋</option>
                            <option value="黑体">黑体</option>
                            <option value="楷体">楷体</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">点击颜色选择器可自定义颜色</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">标注层建议使用仿宋字体</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">图框模板</h3>
                <select
                  value={exportSettings.frameTemplate}
                  onChange={(e) =>
                    setExportSettings({ ...exportSettings, frameTemplate: e.target.value })
                  }
                  className="input-field w-64"
                >
                  <option value="standard_a3">标准A3图框</option>
                  <option value="standard_a4">标准A4图框</option>
                  <option value="custom">自定义图框</option>
                </select>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-full h-32 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">图框预览</p>
                      <p className="text-xs text-gray-400 mt-1">标准A3图框 (420mm × 297mm)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">比例尺设置</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={exportSettings.scale}
                    onChange={(e) =>
                      setExportSettings({ ...exportSettings, scale: e.target.value })
                    }
                    className="input-field w-48"
                  >
                    <option value="1:100">1:100</option>
                    <option value="1:200">1:200</option>
                    <option value="1:500">1:500</option>
                    <option value="1:1000">1:1000</option>
                    <option value="custom">自定义</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">根据实际需求选择合适的比例尺</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">图纸尺寸</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['A3', 'A4', 'A2', '自定义'].map((size) => (
                    <label
                      key={size}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportSettings.paperSize === size
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paperSize"
                        value={size}
                        checked={exportSettings.paperSize === size}
                        onChange={(e) =>
                          setExportSettings({ ...exportSettings, paperSize: e.target.value })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">图例样式</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['杆位', '光缆路由', '分纤点', '接头', '拉线', '地线', '预留', '其他'].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        exportSettings.legendItems.includes(item)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={exportSettings.legendItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExportSettings({
                              ...exportSettings,
                              legendItems: [...exportSettings.legendItems, item],
                            });
                          } else {
                            setExportSettings({
                              ...exportSettings,
                              legendItems: exportSettings.legendItems.filter((i) => i !== item),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    单文件上传大小上限 <span className="text-gray-400">(MB)</span>
                  </label>
                  <input
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxUploadSize: parseInt(e.target.value) || 10,
                      })
                    }
                    className="input-field"
                    min={1}
                    max={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">默认值：10MB</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务处理超时时间 <span className="text-gray-400">(分钟)</span>
                  </label>
                  <input
                    type="number"
                    value={systemSettings.taskTimeout}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        taskTimeout: parseInt(e.target.value) || 5,
                      })
                    }
                    className="input-field"
                    min={1}
                    max={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">默认值：5分钟</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日志保留天数 <span className="text-gray-400">(天)</span>
                  </label>
                  <input
                    type="number"
                    value={systemSettings.logRetentionDays}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        logRetentionDays: parseInt(e.target.value) || 180,
                      })
                    }
                    className="input-field"
                    min={30}
                    max={365}
                  />
                  <p className="text-xs text-gray-500 mt-1">默认值：180天</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    登录失败锁定次数 <span className="text-gray-400">(次)</span>
                  </label>
                  <input
                    type="number"
                    value={systemSettings.loginFailedLockCount}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        loginFailedLockCount: parseInt(e.target.value) || 5,
                      })
                    }
                    className="input-field"
                    min={3}
                    max={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">默认值：5次</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    锁定时长 <span className="text-gray-400">(分钟)</span>
                  </label>
                  <input
                    type="number"
                    value={systemSettings.lockDuration}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        lockDuration: parseInt(e.target.value) || 30,
                      })
                    }
                    className="input-field"
                    min={10}
                    max={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">默认值：30分钟</p>
                </div>
              </div>

              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-warning-800">注意</p>
                    <p className="text-xs text-warning-600 mt-1">
                      修改系统参数后，部分配置需要重启服务才能生效。请谨慎修改。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'encryption' && (
            <div className="space-y-6">
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-800">数据存储加密</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      系统采用业界标准加密算法对所有数据进行加密存储，确保数据安全
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">加密开关</span>
                    </div>
                    <button
                      onClick={() =>
                        setEncryptionSettings({
                          ...encryptionSettings,
                          enabled: !encryptionSettings.enabled,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        encryptionSettings.enabled
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          encryptionSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    开启后，所有数据将加密存储，防止数据泄露和篡改
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">传输加密 (TLS)</span>
                    </div>
                    <button
                      onClick={() =>
                        setEncryptionSettings({
                          ...encryptionSettings,
                          encryptInTransit: !encryptionSettings.encryptInTransit,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        encryptionSettings.encryptInTransit
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          encryptionSettings.encryptInTransit ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    启用 HTTPS/TLS 加密传输，保障数据传输安全
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">加密算法</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={encryptionSettings.algorithm}
                    onChange={(e) =>
                      setEncryptionSettings({
                        ...encryptionSettings,
                        algorithm: e.target.value,
                      })
                    }
                    className="input-field w-48"
                  >
                    <option value="AES-256">AES-256 (推荐)</option>
                    <option value="AES-128">AES-128</option>
                    <option value="SM4">SM4 (国密)</option>
                    <option value="ChaCha20">ChaCha20</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-success-500" />
                    <span className="text-sm text-gray-600">
                      当前算法强度：<span className="font-medium text-success-600">高</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">密钥管理</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密钥轮换周期 <span className="text-gray-400">(天)</span>
                    </label>
                    <input
                      type="number"
                      value={encryptionSettings.keyRotationDays}
                      onChange={(e) =>
                        setEncryptionSettings({
                          ...encryptionSettings,
                          keyRotationDays: parseInt(e.target.value) || 90,
                        })
                      }
                      className="input-field"
                      min={30}
                      max={365}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      定期轮换密钥可提升加密安全性，默认90天
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密钥管理方式
                    </label>
                    <select
                      value={encryptionSettings.keyManagement}
                      onChange={(e) =>
                        setEncryptionSettings({
                          ...encryptionSettings,
                          keyManagement: e.target.value,
                        })
                      }
                      className="input-field w-full"
                    >
                      <option value="自动">自动管理 (推荐)</option>
                      <option value="手动">手动管理</option>
                      <option value="HSM">HSM 硬件加密机</option>
                      <option value="KMS">云 KMS 服务</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      当前密钥上次轮换：{encryptionSettings.lastRotation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">安全审计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">256位</p>
                    <p className="text-xs text-gray-500 mt-1">加密密钥长度</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">TLS 1.3</p>
                    <p className="text-xs text-gray-500 mt-1">传输协议版本</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {encryptionSettings.keyRotationDays}天
                    </p>
                    <p className="text-xs text-gray-500 mt-1">密钥轮换周期</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">导入配置</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择配置文件 <span className="text-danger-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    importFileName
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
                  }`}
                  onClick={() => document.getElementById('config-file-input')?.click()}
                >
                  <input
                    id="config-file-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImportFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  {importFileName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                      <span className="text-sm font-medium text-success-600">
                        {importFileName}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">点击或拖拽上传配置文件</p>
                      <p className="text-xs text-gray-400 mt-1">支持 .json 格式</p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">注意：</span>导入配置将覆盖当前所有配置项，请确保配置文件来自可信来源。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (importFileName) {
                    alert(`配置文件 "${importFileName}" 导入成功`);
                    setShowImportModal(false);
                    setImportFileName('');
                  }
                }}
                disabled={!importFileName}
                className="btn-primary disabled:opacity-50"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">导出配置</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  导出的配置文件将包含以下内容：
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    标注规则配置（杆号、路由编号、分纤点等）
                  </li>
                  <li className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    图层标准配置（颜色、线型、线宽、字体）
                  </li>
                  <li className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    出图规范配置（图框、比例尺、图纸尺寸、图例）
                  </li>
                  <li className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    系统参数配置（上传大小、超时时间、日志保留等）
                  </li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件名
                </label>
                <input
                  type="text"
                  defaultValue="system_config.json"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('配置文件已导出');
                  setShowExportModal(false);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出文件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};