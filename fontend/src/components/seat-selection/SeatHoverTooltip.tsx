'use client';

import React from 'react';
import { Armchair, X } from 'lucide-react';
import { useSeatStore } from '@/stores/useSeatStore';

export const SeatHoverTooltip: React.FC = () => {
  const { hoveredSeat, setHoveredSeat } = useSeatStore();

  if (!hoveredSeat) return null;

  const typeName =
    hoveredSeat.type === 'VIP'
      ? 'Ghế VIP'
      : hoveredSeat.type === 'COUPLE'
      ? 'Ghế đôi'
      : 'Ghế thường';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-20 pointer-events-auto">
      <div className="px-3 py-2 rounded-xl bg-slate-900/95 border border-purple-500/60 shadow-xl shadow-purple-900/30 backdrop-blur-md flex items-center gap-2.5 text-xs animate-in fade-in zoom-in-95 duration-150">
        <div className="w-6 h-6 rounded-md bg-purple-950/80 border border-purple-600/40 flex items-center justify-center text-purple-400">
          <Armchair className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{hoveredSeat.code}</span>
            <span className="text-[10px] text-purple-300 bg-purple-950/50 px-1.5 py-0.2 rounded border border-purple-800/40">
              {typeName}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-amber-400">
            {hoveredSeat.price.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <button
          onClick={() => setHoveredSeat(null)}
          className="text-slate-400 hover:text-white ml-1 p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
