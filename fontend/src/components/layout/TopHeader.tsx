'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bot, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';

export const TopHeader: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-40 h-13 w-full border-b border-[#172A48]/70 bg-[#030916]/95 backdrop-blur-md px-6 flex items-center justify-between select-none">
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6.5 h-6.5 rounded-lg bg-[#693BFF] flex items-center justify-center shadow-md shadow-[#693BFF]/30">
            <span className="text-white font-black text-sm tracking-tighter">G</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[#F4F7FF]">
            CineBooking
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#AAB8D0]">
          <Link href="/" className="text-[#F4F7FF] font-semibold border-b-2 border-[#693BFF] pb-4 pt-4 -mb-px">
            Trang chủ
          </Link>
          <Link href="/movies" className="hover:text-[#F4F7FF] transition-colors">
            Phim
          </Link>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#F4F7FF] transition-colors">
            <span>Rạp</span>
            <ChevronDown className="w-3 h-3 text-[#7F91AF]" />
          </div>
          <Link href="/promotions" className="hover:text-[#F4F7FF] transition-colors">
            Ưu đãi
          </Link>
          <Link href="/profile" className="hover:text-[#F4F7FF] transition-colors">
            Thành viên
          </Link>
        </nav>
      </div>

      {/* Right: Search, Chatbot, Theme, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar pill */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7F91AF]" />
          <input
            type="text"
            placeholder="Tìm phim, diễn viên, rạp..."
            className="w-full h-8 pl-8.5 pr-4 rounded-full bg-[#08162B] border border-[#172A48] text-xs text-[#F4F7FF] placeholder-[#7F91AF] focus:outline-none focus:border-[#693BFF] focus:ring-1 focus:ring-[#693BFF]/40 transition-all"
          />
        </div>

        {/* AI Assistant Robot Button */}
        <button
          title="Trợ lý CineBot AI"
          className="w-7.5 h-7.5 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#A875FF] hover:border-[#693BFF] transition-all"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
          className="w-7.5 h-7.5 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#AAB8D0] hover:text-[#FFB52E] hover:border-[#FFB52E]/40 transition-all"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Notification Bell */}
        <button
          title="Thông báo"
          className="relative w-7.5 h-7.5 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#AAB8D0] hover:text-[#F4F7FF] transition-all"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
        </button>

        {/* User Profile Avatar */}
        <Link href="/profile" className="flex items-center pl-1">
          <div className="w-7.5 h-7.5 rounded-full ring-1 ring-[#172A48] overflow-hidden bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
};
