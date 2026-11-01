'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, MapPin, Tag, Award, MessageSquare } from 'lucide-react';

const SidebarContent: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', href: '/', icon: Home, active: true },
    { label: 'Phim', href: '/movies', icon: Film, active: false },
    { label: 'Rạp', href: '/showtimes', icon: MapPin, active: false },
    { label: 'Ưu đãi', href: '/promotions', icon: Tag, active: false },
    { label: 'Thành viên', href: '/profile', icon: Award, active: false },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-[#040B18] border-r border-[#172A48]/70 py-4 select-none shrink-0 z-30 h-screen sticky top-0">
      {/* 1. Logo G góc trên bên trái */}
      <div className="flex flex-col items-center gap-5 w-full">
        <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#693BFF] to-[#8057FF] flex items-center justify-center shadow-lg shadow-[#693BFF]/30 hover:scale-105 transition-transform">
          <span className="text-white font-black text-xl tracking-tighter">G</span>
        </Link>

        {/* 2. Menu dọc */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#17143B] text-[#A875FF] border border-[#6037D9]/60 shadow-md shadow-[#693BFF]/20'
                    : 'text-[#7F91AF] hover:text-[#F4F7FF] hover:bg-[#071329]/60'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-[10px] font-medium tracking-tight scale-90">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Phần dưới sidebar: Avatar + Chat ngay */}
      <div className="flex flex-col items-center gap-3 w-full pb-2">
        <button
          title="Chat ngay"
          className="flex flex-col items-center gap-0.5 text-[#7F91AF] hover:text-[#A875FF] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-medium scale-90 text-[#7F91AF]">Hỗ trợ</span>
          <span className="text-[8px] font-semibold text-[#A875FF] -mt-1 scale-85">Chat ngay</span>
        </button>

        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#172A48] mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </aside>
  );
};

export const DesktopSidebar: React.FC = () => {
  return (
    <Suspense fallback={<aside className="hidden md:flex w-[72px] bg-[#040B18] border-r border-[#172A48]" />}>
      <SidebarContent />
    </Suspense>
  );
};
