import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { drawings } from '../utils/mockData';

const layers = [
  { name: '杆路层', color: '#ef4444', visible: true },
  { name: '光缆层', color: '#3b82f6', visible: true },
  { name: '分纤层', color: '#10b981', visible: true },
  { name: '标注层', color: '#f59e0b', visible: true },
  { name: '辅助层', color: '#8b5cf6', visible: true },
];

export const DwgPreview = () => {
  const { id, fileId } = useParams<{ id: string; fileId: string }>();
  const navigate = useNavigate();
  const drawing = drawings.find((d) => d.id === fileId);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState(
    layers.reduce((acc, layer) => ({ ...acc, [layer.name]: layer.visible }), {})
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, scale]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.1, 0.1));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale((prev) => Math.max(0.1, Math.min(prev + delta, 3)));
    },
    []
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleLayer = (layerName: string) => {
    setLayerVisibility((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  if (!drawing) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">图纸不存在</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen bg-gray-900 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${id}/drawings`)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{drawing.name} (DWG)</h1>
            <p className="text-sm text-gray-400">
              图纸尺寸：A3 · 图层数：5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.1}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-medium min-w-[80px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="放大"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2" />
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="全屏"
          >
            {isFullscreen ? <X className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="下载DWG">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="relative cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              viewBox="0 0 800 600"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                width: '800px',
                height: '600px',
              }}
              className="bg-white rounded-lg shadow-2xl"
            >
              <rect width="800" height="600" fill="white" />
              <rect x="40" y="40" width="720" height="520" fill="none" stroke="#333" strokeWidth="2" />
              <text x="400" y="60" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">
                运营商通信线路竣工图
              </text>
              <text x="60" y="80" fontSize="10" fill="#666">
                项目名称：{drawing.name}
              </text>
              <text x="60" y="100" fontSize="10" fill="#666">
                生成日期：{drawing.generatedAt || '2024-06-08'}
              </text>

              {layerVisibility['杆路层'] && (
                <>
                  <circle cx="100" cy="200" r="8" fill="#ef4444" />
                  <line x1="100" y1="200" x2="100" y2="350" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="100" cy="350" r="5" fill="#ef4444" />
                  <text x="100" y="370" textAnchor="middle" fontSize="10" fill="#ef4444">A001</text>

                  <circle cx="200" cy="180" r="8" fill="#ef4444" />
                  <line x1="200" y1="180" x2="200" y2="330" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="200" cy="330" r="5" fill="#ef4444" />
                  <text x="200" y="350" textAnchor="middle" fontSize="10" fill="#ef4444">A002</text>

                  <circle cx="300" cy="220" r="8" fill="#ef4444" />
                  <line x1="300" y1="220" x2="300" y2="370" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="300" cy="370" r="5" fill="#ef4444" />
                  <text x="300" y="390" textAnchor="middle" fontSize="10" fill="#ef4444">A003</text>
                </>
              )}

              {layerVisibility['光缆层'] && (
                <>
                  <path
                    d="M100 275 Q150 250 200 255 T300 295"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M200 255 Q250 280 300 295"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text x="150" y="240" fontSize="10" fill="#3b82f6">R001</text>
                </>
              )}

              {layerVisibility['分纤层'] && (
                <>
                  <rect x="350" y="250" width="40" height="30" fill="#10b981" opacity="0.3" stroke="#10b981" />
                  <text x="370" y="270" textAnchor="middle" fontSize="8" fill="#10b981">分纤点</text>
                  <text x="370" y="285" textAnchor="middle" fontSize="8" fill="#10b981">F001</text>

                  <rect x="450" y="280" width="40" height="30" fill="#10b981" opacity="0.3" stroke="#10b981" />
                  <text x="470" y="300" textAnchor="middle" fontSize="8" fill="#10b981">分纤点</text>
                  <text x="470" y="315" textAnchor="middle" fontSize="8" fill="#10b981">F002</text>
                </>
              )}

              {layerVisibility['标注层'] && (
                <>
                  <text x="100" y="130" fontSize="10" fill="#f59e0b">杆路标注</text>
                  <text x="100" y="150" fontSize="9" fill="#f59e0b">敷设方式：架空</text>
                  <text x="250" y="130" fontSize="10" fill="#f59e0b">光缆标注</text>
                  <text x="250" y="150" fontSize="9" fill="#f59e0b">型号：GYTA-24B1</text>
                  <text x="400" y="130" fontSize="10" fill="#f59e0b">分纤标注</text>
                  <text x="400" y="150" fontSize="9" fill="#f59e0b">容量：1:64</text>
                </>
              )}

              {layerVisibility['辅助层'] && (
                <>
                  <line x1="60" y1="450" x2="740" y2="450" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="60" y="465" fontSize="8" fill="#8b5cf6">0</text>
                  <text x="360" y="465" fontSize="8" fill="#8b5cf6">100m</text>
                  <text x="660" y="465" fontSize="8" fill="#8b5cf6">200m</text>

                  <line x1="60" y1="450" x2="60" y2="540" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="45" y="475" fontSize="8" fill="#8b5cf6">0</text>
                  <text x="45" y="520" fontSize="8" fill="#8b5cf6">100m</text>

                  <rect x="650" y="480" width="100" height="80" fill="none" stroke="#8b5cf6" strokeWidth="1" />
                  <text x="700" y="500" textAnchor="middle" fontSize="8" fill="#8b5cf6">图例</text>
                  <circle cx="670" cy="520" r="4" fill="#ef4444" />
                  <text x="685" y="523" fontSize="7" fill="#8b5cf6">杆位</text>
                  <line x1="670" y1="535" x2="690" y2="535" stroke="#3b82f6" strokeWidth="1" />
                  <text x="700" y="538" fontSize="7" fill="#8b5cf6">光缆</text>
                  <rect x="670" y="545" width="15" height="10" fill="#10b981" opacity="0.3" stroke="#10b981" />
                  <text x="695" y="552" fontSize="7" fill="#8b5cf6">分纤点</text>
                </>
              )}
            </svg>
          </div>
        </div>

        {showLayers && (
          <div className="w-56 bg-gray-800 p-4 border-l border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">图层图例</h3>
              <button
                onClick={() => setShowLayers(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <ul className="space-y-2">
              {layers.map((layer) => (
                <li key={layer.name} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLayer(layer.name)}
                    className="w-8 h-8 rounded border-2 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: layerVisibility[layer.name] ? layer.color : 'transparent',
                      borderColor: layer.color,
                    }}
                  >
                    {layerVisibility[layer.name] && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm ${layerVisibility[layer.name] ? 'text-white' : 'text-gray-500'}`}>
                    {layer.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!showLayers && (
          <button
            onClick={() => setShowLayers(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 hover:bg-gray-700 rounded-l-lg transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-800 text-white flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span>文件名：</span>
          <span className="text-white">{drawing.name}.dwg</span>
          <span className="mx-3">|</span>
          <span>生成时间：</span>
          <span className="text-white">{drawing.generatedAt || '2024-06-08 11:15:00'}</span>
          <span className="mx-3">|</span>
          <span>图层数：</span>
          <span className="text-white">5</span>
        </div>
        <div className="text-xs text-gray-500">
          提示：使用鼠标滚轮缩放，拖拽平移
        </div>
      </div>
    </div>
  );
};