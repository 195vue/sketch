import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Download,
} from 'lucide-react';
import { drawings } from '../utils/mockData';

export const SketchPreview = () => {
  const { id, fileId } = useParams<{ id: string; fileId: string }>();
  const navigate = useNavigate();
  const drawing = drawings.find((d) => d.id === fileId);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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
      if (e.key === 'r' || e.key === 'R') {
        handleRotate();
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

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
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
            <h1 className="text-lg font-semibold">{drawing.name}</h1>
            <p className="text-sm text-gray-400">{drawing.format} · {(drawing.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.1}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="缩小 (Ctrl+-)"
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
            title="放大 (Ctrl++)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2" />
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="旋转90° (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2" />
          <button
            onClick={handleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="全屏 (F)"
          >
            {isFullscreen ? <X className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          {drawing.status === 3 && (
            <>
              <div className="w-px h-6 bg-gray-600 mx-2" />
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="下载">
                <Download className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={canvasRef}
          className="relative cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={`https://picsum.photos/1200/800?random=${drawing.id}`}
            alt={drawing.name}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-800 text-white flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span>尺寸：</span>
          <span className="text-white">1200 × 800</span>
          <span className="mx-3">|</span>
          <span>上传时间：</span>
          <span className="text-white">{drawing.uploadedAt}</span>
          <span className="mx-3">|</span>
          <span>上传人：</span>
          <span className="text-white">{drawing.uploaderName}</span>
        </div>
        <div className="text-xs text-gray-500">
          提示：使用鼠标滚轮缩放，拖拽平移，点击旋转按钮或按R键旋转90°
        </div>
      </div>
    </div>
  );
};