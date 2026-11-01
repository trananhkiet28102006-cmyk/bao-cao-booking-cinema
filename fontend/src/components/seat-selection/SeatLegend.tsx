'use client';

import React from 'react';
import { Armchair, Minimize2 } from 'lucide-react';
import { useSeatStore } from '@/stores/useSeatStore';

export const SeatLegend: React.FC = () => {
  const { seats, selectedSeatIds } = useSeatStore();

  const legendItems = [
    {
      label: 'Ghế trống',
      desc: 'Có thể chọn',
      color: 'bg-blue-900 border-blue-600/60 text-blue-300',
    },
    {
      label: 'Ghế đang chọn',
      desc: 'Đang được chọn',
      color: 'bg-purple-600 border-purple-400 text-white shadow-sm shadow-purple-500/50',
    },
    {
      label: 'Ghế đã bán',
      desc: 'Không thể chọn',
      color: 'bg-slate-700 border-slate-600 text-slate-400',
    },
    {
      label: 'Ghế đang giữ',
      desc: 'Đang được giữ',
      color: 'bg-slate-800 border-slate-700 text-slate-500',
    },
    {
      label: 'Ghế VIP',
      desc: 'Giá cao hơn',
      color: 'bg-amber-600 border-amber-400 text-white',
    },
    {
      label: 'Ghế đôi',
      desc: 'Dành cho 2 người',
      color: 'bg-pink-600 border-pink-400 text-white',
    },
  ];

  return (
    <div className="w-full mt-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* 1. Chú thích các loại ghế */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Chú thích ghế
        </span>
        <div className="flex flex-wrap items-center gap-5">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center ${item.color}`}
              >
                <Armchair className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200 text-[11px]">
                  {item.label}
                </span>
                <span className="text-[9px] text-slate-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Sơ đồ tổng quan (Minimap) */}
      <div className="flex items-center gap-3 border-l border-slate-800/80 pl-5">
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
            <span>Tổng quan</span>
            <span className="flex items-center gap-1 text-[9px] text-purple-400 cursor-pointer">
              <Minimize2 className="w-2.5 h-2.5" /> Thu nhỏ
            </span>
          </div>

          {/* Minimap lưới ghế thu nhỏ */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((row) => (
              <div key={row} className="flex gap-1 items-center">
                {/* Block trái 4 ghế */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map((num) => {
                    const code = `${row}${num < 10 ? '0' + num : num}`;
                    const isSelected = selectedSeatIds.includes(`seat-${code}`);
                    return (
                      <div
                        key={code}
                        className={`w-1.5 h-1.5 rounded-xs ${
                          isSelected ? 'bg-purple-500 shadow-xs shadow-purple-500' : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                {/* Lối đi */}
                <div className="w-1.5" />
                {/* Block giữa 8 ghế */}
                <div className="flex gap-0.5">
                  {[5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                    const code = `${row}${num < 10 ? '0' + num : num}`;
                    const isSelected = selectedSeatIds.includes(`seat-${code}`);
                    return (
                      <div
                        key={code}
                        className={`w-1.5 h-1.5 rounded-xs ${
                          isSelected ? 'bg-purple-500 shadow-xs shadow-purple-500' : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                {/* Lối đi */}
                <div className="w-1.5" />
                {/* Block phải 4 ghế */}
                <div className="flex gap-0.5">
                  {[13, 14, 15, 16].map((num) => {
                    const code = `${row}${num < 10 ? '0' + num : num}`;
                    const isSelected = selectedSeatIds.includes(`seat-${code}`);
                    return (
                      <div
                        key={code}
                        className={`w-1.5 h-1.5 rounded-xs ${
                          isSelected ? 'bg-purple-500 shadow-xs shadow-purple-500' : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
