'use client';

import React from 'react';
import Link from 'next/link';
import { User, Shield, Wallet, Award, History, Ticket, Calendar, Clock, MapPin } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full bg-[#080D18]">
      {/* 1. Header Tài Khoản & Điểm Thành Viên */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/50 bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Trần Anh Kiệt</h1>
            <p className="text-xs text-slate-400 mt-0.5">trananhkiet@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-300">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <span className="font-bold text-white">Hạng Bạc</span> • <span className="font-bold text-amber-400">120 điểm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 2. Menu Bên Trái */}
        <div className="md:col-span-4 flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          {[
            { label: 'Thông tin cá nhân', icon: User, active: true },
            { label: 'Bảo mật tài khoản', icon: Shield, active: false },
            { label: 'Ví của tôi', icon: Wallet, active: false },
            { label: 'Ưu đãi & Điểm thưởng', icon: Award, active: false },
            { label: 'Lịch sử đặt vé', icon: History, active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                  item.active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Danh Sách Vé Sắp Xem */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <h2 className="text-base font-bold text-white">Vé sắp xem</h2>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4 shadow-lg hover:border-purple-500/40 transition-all">
            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80"
                alt="Dune 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1 text-xs">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase">Mã vé: CB2404-000123</span>
                <h3 className="text-base font-bold text-white mt-0.5">Dune: Part Two</h3>
                <p className="text-slate-400 text-[11px] mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  CGV Vincom Đồng Khởi - Phòng 3 (IMAX)
                </p>
                <p className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Thứ 6, 26/04/2024 - 19:30 | Ghế: C04, C05
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  href="/ticket/CB2404-000123"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Xem vé điện tử
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
