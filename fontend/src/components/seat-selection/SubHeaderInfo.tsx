'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Clock, MapPin, Calendar, Film } from 'lucide-react';
import { showtimeService, BackendShowtime } from '@/services/showtimeService';

export const SubHeaderInfo: React.FC = () => {
  const [showtime, setShowtime] = useState<BackendShowtime | null>(null);

  useEffect(() => {
    // Kết nối lấy suất chiếu thật từ Spring Boot
    showtimeService.getShowtimeById(1).then((data) => {
      if (data) setShowtime(data);
    });
  }, []);

  const movieTitle = showtime?.movieTitle || 'Dune: H\u00E0nh Tinh C\u00E1t - Ph\u1EA7n 2';
  const posterUrl = showtime?.moviePosterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80';
  const cinemaName = showtime?.cinemaName || 'CGV Vincom \u0110\u1ED3ng Kh\u1EDFi';
  const roomName = showtime?.roomName || 'Ph\u00F2ng 1 (IMAX)';
  const format = showtime?.screenFormat || 'IMAX';
  const showDate = showtime?.showDate ? `Ng\u00E0y ${showtime.showDate}` : 'Th\u1EE9 6, 26/04/2024';
  const showTime = showtime?.startTime ? showtime.startTime.substring(0, 5) : '19:30';

  return (
    <div className="mx-6 mt-4 mb-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
      {/* 1. Phim & Thể loại */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0 shadow-md ring-1 ring-slate-700/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={movieTitle}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {movieTitle}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-slate-300">
            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold text-[11px]">
              H\u00E0nh \u0111\u1ED9ng
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold text-[11px]">
              Khoa h\u1ECDc vi\u1EC5n t\u01B0\u1EDFng
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold ml-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 8.6
            </span>
            <span className="flex items-center gap-1 text-slate-400 ml-1">
              <Clock className="w-3.5 h-3.5" /> 2h 46m
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[10px] ml-1">
              {showtime?.movieAgeRating || 'C16'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Rạp & Địa chỉ */}
      <div className="flex items-center gap-2.5 border-l border-slate-800/80 pl-4">
        <div className="w-8 h-8 rounded-full bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-100">{cinemaName}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>72 L\u00EA Th\u00E1nh T\u00F4n, Qu\u1EADn 1, TP.HCM</span>
            <a href="#" className="text-purple-400 hover:underline">Xem b\u1EA3n \u0111\u1ED3</a>
          </div>
        </div>
      </div>

      {/* 3. Phòng & Định dạng */}
      <div className="flex items-center gap-2 border-l border-slate-800/80 pl-4">
        <div>
          <p className="font-semibold text-slate-100">{roomName}</p>
          <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 font-bold text-[10px]">
            {format}
          </span>
        </div>
      </div>

      {/* 4. Ngày & Giờ & Nút đổi suất */}
      <div className="flex items-center gap-3 border-l border-slate-800/80 pl-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{showDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300">{showTime}</span>
          </div>
        </div>

        <Link
          href="/showtimes"
          className="ml-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-purple-900/30 text-purple-300 hover:text-purple-200 border border-purple-700/40 font-medium text-xs transition-all flex items-center gap-1.5"
        >
          <Film className="w-3.5 h-3.5" />
          \u0110\u1ED5i su\u1EA5t chi\u1EBFu
        </Link>
      </div>
    </div>
  );
};
