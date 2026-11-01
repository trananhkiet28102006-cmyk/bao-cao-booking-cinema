'use client';

import React from 'react';
import { Armchair } from 'lucide-react';
import { useSeatStore } from '@/stores/useSeatStore';

export const SeatMap2D: React.FC = () => {
  const { seats, selectedSeatIds, toggleSeat, setHoveredSeat } = useSeatStore();

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-[#070B16] overflow-auto select-none">
      {/* Màn hình 2D */}
      <div className="w-4/5 max-w-xl mb-10 text-center">
        <div className="h-2 rounded-t-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-lg shadow-purple-500/50" />
        <p className="text-xs text-slate-400 mt-2 font-semibold tracking-wider uppercase">
          MÀN HÌNH CHIẾU (SCREEN)
        </p>
      </div>

      {/* Lưới ghế 2D */}
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-4 text-xs font-bold text-slate-400 text-center">{row}</span>

            {/* Block Trái: 1 - 4 */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((num) => renderSeat(row, num))}
            </div>

            {/* Lối đi trái */}
            <div className="w-6" />

            {/* Block Giữa: 5 - 12 */}
            <div className="flex gap-1.5">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((num) => renderSeat(row, num))}
            </div>

            {/* Lối đi phải */}
            <div className="w-6" />

            {/* Block Phải: 13 - 16 */}
            <div className="flex gap-1.5">
              {[13, 14, 15, 16].map((num) => renderSeat(row, num))}
            </div>

            <span className="w-4 text-xs font-bold text-slate-400 text-center">{row}</span>
          </div>
        ))}
      </div>
    </div>
  );

  function renderSeat(row: string, num: number) {
    const code = `${row}${num < 10 ? '0' + num : num}`;
    const seat = seats.find((s) => s.code === code);
    if (!seat) return null;

    const isSelected = selectedSeatIds.includes(seat.id);
    let bgStyle = 'bg-blue-950/80 border-blue-700/60 text-blue-300 hover:border-blue-400';

    if (seat.status === 'SOLD' || seat.status === 'HELD') {
      bgStyle = 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed';
    } else if (isSelected) {
      bgStyle = 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/60 scale-105';
    } else if (seat.type === 'VIP') {
      bgStyle = 'bg-amber-950/80 border-amber-600/70 text-amber-300 hover:border-amber-400';
    } else if (seat.type === 'COUPLE') {
      bgStyle = 'bg-pink-950/80 border-pink-600/70 text-pink-300 hover:border-pink-400';
    }

    return (
      <button
        key={seat.id}
        onClick={() => toggleSeat(seat.id)}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        disabled={seat.status === 'SOLD' || seat.status === 'HELD'}
        title={`${seat.code} - ${seat.price.toLocaleString('vi-VN')}đ`}
        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all ${bgStyle}`}
      >
        {num}
      </button>
    );
  }
};
