'use client';

import React from 'react';
import { Star, Clock, MapPin, Calendar, X, ArrowRight, Popcorn } from 'lucide-react';
import { useSeatStore } from '@/stores/useSeatStore';
import { useBookingStore } from '@/stores/useBookingStore';

interface RightBookingPanelProps {
  onContinue: () => void;
}

export const RightBookingPanel: React.FC<RightBookingPanelProps> = ({ onContinue }) => {
  const { getSelectedSeats, removeSeat, clearSelection, getTotalPrice } = useSeatStore();
  const { booking } = useBookingStore();

  const selectedSeats = getSelectedSeats();
  const totalPrice = getTotalPrice();

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Card thông tin vé & tổng kết */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col gap-4 shadow-xl">
        {/* Phim & Rating */}
        <div className="flex gap-3">
          <div className="w-14 h-18 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-slate-700/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm leading-snug">
              {booking.movieTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" /> 8.6
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> 2h 46m
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[9px] font-semibold">
                Hành động
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 text-[9px] font-semibold">
                Khoa học viễn tưởng
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Thông tin Rạp & Phòng */}
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">{booking.cinemaName}</p>
              <p className="text-[10px] text-slate-400">{booking.cinemaAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] pl-5 mt-1">
            <span className="font-semibold text-indigo-300">{booking.roomName} - {booking.format}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px] pl-5">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span>{booking.showDate} | {booking.showTime}</span>
          </div>
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Danh sách ghế đã chọn */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">
              Ghế đã chọn ({selectedSeats.length})
            </span>
            {selectedSeats.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {selectedSeats.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Vui lòng chọn ghế trên rạp chiếu
              </p>
            ) : (
              selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs">
                      {seat.code}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{seat.code}</p>
                      <p className="text-[10px] text-slate-400">
                        {seat.type === 'VIP' ? 'Ghế VIP' : seat.type === 'COUPLE' ? 'Ghế đôi' : 'Ghế thường'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {seat.price.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                      onClick={() => removeSeat(seat.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="h-px bg-slate-800/80" />

        {/* Chi tiết giá vé & Tổng tiền */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chi tiết giá vé</span>
            <span className="text-slate-300">
              Ghế ({selectedSeats.length}): {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-white">Tổng tiền</span>
            <span className="text-lg font-black text-white tracking-tight">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Nút Tiếp tục màu tím nổi bật */}
          <button
            onClick={onContinue}
            disabled={selectedSeats.length === 0}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed group"
          >
            <span>Tiếp tục</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] text-slate-500 text-center">
            Bạn có thể chọn tối đa 6 ghế cho mỗi đơn hàng.
          </p>
        </div>
      </div>

      {/* 2. Banner Combo bắp nước giảm ngay 20% */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-800/40 relative overflow-hidden flex items-center justify-between shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold mb-1">
            <Popcorn className="w-4 h-4 text-amber-400" />
            <span>Combo bắp nước</span>
          </div>
          <p className="text-white font-bold text-xs">
            Giảm ngay 20% khi đặt vé online
          </p>
          <button
            onClick={onContinue}
            className="mt-2.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1"
          >
            Xem ngay &gt;
          </button>
        </div>

        {/* Minh họa bắp rang */}
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <Popcorn className="w-9 h-9 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
