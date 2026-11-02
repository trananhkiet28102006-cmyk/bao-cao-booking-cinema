'use client';

import React, { useEffect, useRef } from 'react';
import { useSeatStore, SeatData } from '@/stores/useSeatStore';
import { playSeatGridReveal } from '@/lib/motion';

export default function SeatMap2D({
  screenFormat = 'IMAX',
}: {
  screenFormat?: string;
}) {
  const {
    seats,
    selectedSeats,
    hoveredSeatId,
    setHoveredSeat,
    toggleSeat,
    zoomLevel,
  } = useSeatStore();

  const seatGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seatGridRef.current && seats.length > 0) {
      playSeatGridReveal(seatGridRef.current);
    }
  }, [seats.length, screenFormat]);

  const rows = Array.from(new Set(seats.map((s) => s.row)));
  const hoveredSeat = seats.find((s) => s.id === hoveredSeatId) || null;

  const getSeatTypeLabel = (type: SeatData['type']) => {
    if (type === 'VIP') return 'Ghế VIP';
    if (type === 'COUPLE') return 'Ghế đôi (2 người)';
    return 'Ghế thường';
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#040B1A] via-[#040A17] to-[#030711] flex flex-col items-center justify-between py-6 px-6 select-none overflow-auto">
      {/* 1. MÀN HÌNH CHIẾU CONG PHÁT SÁNG */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-4 flex-shrink-0">
        <div className="relative w-4/5 h-8 flex flex-col items-center">
          <svg
            viewBox="0 0 600 42"
            className="w-full h-full overflow-visible drop-shadow-[0_10px_28px_rgba(96,165,250,0.65)]"
          >
            <defs>
              <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="25%" stopColor="#60A5FA" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#EFF6FF" stopOpacity="1" />
                <stop offset="75%" stopColor="#60A5FA" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M 20 34 Q 300 4 580 34"
              fill="none"
              stroke="url(#screenGlow)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          {/* Ánh sáng hắt xuống từ màn hình */}
          <div className="w-3/4 h-7 -mt-3 bg-gradient-to-b from-[#60A5FA]/20 to-transparent blur-md pointer-events-none rounded-full" />
        </div>

        <span className="text-[11px] uppercase tracking-[0.38em] text-[#93C5FD] font-bold mt-0.5">
          MÀN HÌNH CHIẾU {screenFormat}
        </span>
      </div>

      {/* 2. LƯỚI GHẾ 2D TƯƠNG TÁC TRỰC TIẾP TỪ DATABASE */}
      <div
        ref={seatGridRef}
        className="flex flex-col gap-2 my-auto transition-transform duration-200 origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {rows.map((row) => {
          const rowSeats = seats.filter((s) => s.row === row);
          const leftBlock = rowSeats.filter((s) => s.block === 'LEFT');
          const centerBlock = rowSeats.filter((s) => s.block === 'CENTER');
          const rightBlock = rowSeats.filter((s) => s.block === 'RIGHT');

          const renderSeatButton = (seat: SeatData) => {
            const isSelected = selectedSeats.some((s) => s.id === seat.id);
            const isBooked = seat.status === 'BOOKED';
            const isHold = seat.status === 'HOLD';
            const isCouple = seat.type === 'COUPLE';

            let seatStyle =
              'bg-[#1D4ED8] hover:bg-[#2563EB] border-[#60A5FA]/60 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_16px_rgba(59,130,246,0.5)] hover:brightness-110 active:scale-90 active:translate-y-0.5';
            if (isBooked) {
              seatStyle =
                'bg-[#162033] border-[#28354E] text-[#475569] cursor-not-allowed opacity-75 seat-booked-shake';
            } else if (isHold) {
              seatStyle =
                'bg-[#334155] border-[#475569] text-[#64748B] cursor-not-allowed seat-booked-shake';
            } else if (isSelected) {
              seatStyle =
                'bg-[#7C3AED] hover:bg-[#8B5CF6] border-[#E9D5FF] text-white seat-pop-selected -translate-y-1 scale-110 ring-2 ring-purple-300 ring-offset-1 ring-offset-[#030916] active:scale-95';
            } else if (seat.type === 'VIP') {
              seatStyle =
                'bg-[#D97706] hover:bg-[#F59E0B] border-[#FDE68A]/70 text-white shadow-[0_2px_8px_rgba(217,119,6,0.35)] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_16px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-90 active:translate-y-0.5';
            } else if (isCouple) {
              seatStyle =
                'bg-[#4F46E5] hover:bg-[#6366F1] border-[#A5B4FC]/60 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_6px_16px_rgba(99,102,241,0.5)] hover:brightness-110 active:scale-90 active:translate-y-0.5';
            }

            return (
              <button
                key={seat.id}
                type="button"
                disabled={seat.status !== 'AVAILABLE'}
                onClick={() => toggleSeat(seat.id)}
                onMouseEnter={() => setHoveredSeat(seat.id)}
                onMouseLeave={() => setHoveredSeat(null)}
                className={`group relative ${
                  isCouple ? 'w-[60px]' : 'w-[30px]'
                } h-[28px] rounded-t-lg rounded-b-sm border text-[10px] font-extrabold tracking-tight transition-all duration-200 ease-out flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation ${seatStyle}`}
              >
                {/* Đệm tựa lưng ghế nhỏ phía trên */}
                <span
                  className={`absolute -top-[3px] ${
                    isCouple ? 'w-11' : 'w-5'
                  } h-[3px] rounded-t-full transition-colors duration-200 ${
                    isSelected
                      ? 'bg-white shadow-[0_0_8px_#FFFFFF]'
                      : isBooked
                      ? 'bg-[#28354E]'
                      : seat.type === 'VIP'
                      ? 'bg-[#FDE68A]'
                      : 'bg-white/50 group-hover:bg-white'
                  }`}
                />
                <span className="relative z-10 transition-transform duration-150 group-active:scale-90">
                  {seat.id}
                </span>
              </button>
            );
          };

          return (
            <div key={row} className="seat-row-item flex items-center justify-center gap-3">
              {/* Nhãn hàng ghế bên trái */}
              <span className="w-6 text-xs font-extrabold text-[#64748B] text-right">
                {row}
              </span>

              {/* 3 Khối ghế: Trái - Hành lang - Giữa - Hành lang - Phải */}
              <div className="flex items-center gap-5">
                {leftBlock.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {leftBlock.map(renderSeatButton)}
                  </div>
                )}

                {centerBlock.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/[0.015] border border-white/[0.04]">
                    {centerBlock.map(renderSeatButton)}
                  </div>
                )}

                {rightBlock.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {rightBlock.map(renderSeatButton)}
                  </div>
                )}
              </div>

              {/* Nhãn hàng ghế bên phải */}
              <span className="w-6 text-xs font-extrabold text-[#64748B] text-left">
                {row}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. THANH THÔNG TIN GHẾ ĐANG TRỎ CHUỘT (HOVER BAR) */}
      <div className="h-7 flex items-center justify-center mt-2">
        {hoveredSeat ? (
          <div className="px-3.5 py-1 rounded-full bg-[#0A1830]/95 border border-[#2B4C8C] text-xs flex items-center gap-3 shadow-lg animate-fadeIn">
            <span className="font-extrabold text-[#A875FF]">
              Ghế {hoveredSeat.id}
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-[#E2E8F0] font-semibold">
              {getSeatTypeLabel(hoveredSeat.type)}
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="font-extrabold text-[#FFB52E]">
              {hoveredSeat.price.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span
              className={`font-bold ${
                hoveredSeat.status === 'BOOKED'
                  ? 'text-rose-400'
                  : hoveredSeat.status === 'HOLD'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {hoveredSeat.status === 'BOOKED'
                ? 'Đã bán'
                : hoveredSeat.status === 'HOLD'
                ? 'Đang giữ chỗ (5p)'
                : 'Còn trống'}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#64748B]">
            Nhấp vào ghế trống để chọn (Tối đa 6 ghế mỗi giao dịch)
          </span>
        )}
      </div>
    </div>
  );
}
