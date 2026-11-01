'use client';

import React from 'react';
import { RotateCcw, Target, Plus, Minus } from 'lucide-react';
import { useSeatStore } from '@/stores/useSeatStore';

interface SeatControlsProps {
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const SeatControls: React.FC<SeatControlsProps> = ({
  onResetCamera,
  onZoomIn,
  onZoomOut,
}) => {
  const { viewMode, setViewMode } = useSeatStore();

  return (
    <>
      {/* 1. Bộ điều khiển góc trên bên trái: Tab 3D/2D và các nút chức năng */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        {/* Toggle 3D / 2D */}
        <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setViewMode('3D')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3D'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
          <button
            onClick={() => setViewMode('2D')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2D'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
        </div>

        {/* Các nút: Reset, Focus, Zoom In, Zoom Out */}
        {viewMode === '3D' && (
          <div className="flex flex-col gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg w-fit">
            <button
              onClick={onResetCamera}
              title="Đặt lại góc nhìn"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-purple-400 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onResetCamera}
              title="Căn tâm rạp"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-purple-400 hover:bg-slate-800 transition-colors"
            >
              <Target className="w-4 h-4" />
            </button>
            <div className="w-full h-px bg-slate-800" />
            <button
              onClick={onZoomIn}
              title="Phóng to"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-purple-400 hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onZoomOut}
              title="Thu nhỏ"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-purple-400 hover:bg-slate-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Nút "Đặt lại góc nhìn" góc trên bên phải rạp */}
      {viewMode === '3D' && (
        <button
          onClick={onResetCamera}
          className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/40 border border-slate-700/60 hover:border-purple-500/50 text-xs font-medium text-slate-200 hover:text-purple-300 backdrop-blur-md flex items-center gap-2 shadow-lg transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại góc nhìn</span>
        </button>
      )}
    </>
  );
};
