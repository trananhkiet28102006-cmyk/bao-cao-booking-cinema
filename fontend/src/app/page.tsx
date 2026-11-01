'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Volume2, VolumeX, Ticket, Star, Clock, Bot, Search, Sun, Moon, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'NOW' | 'SOON' | 'FAV'>('NOW');
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { isDarkMode, toggleTheme } = useThemeStore();

  // 7 phim Đang chiếu với Poster Full HD Studio
  const nowShowing = [
    {
      id: 2,
      title: 'Dune: Part Two',
      poster: '/hd_dune2.jpg',
      rating: '8.6',
      duration: '2h 46m',
      selected: true,
    },
    {
      id: 3,
      title: 'Kung Fu Panda 4',
      poster: '/hd_kungfupanda4.jpg',
      rating: '7.4',
      duration: '1h 34m',
      selected: false,
    },
    {
      id: 5,
      title: 'Godzilla x Kong',
      poster: '/hd_godzillakong.jpg',
      rating: '7.2',
      duration: '1h 55m',
      selected: false,
    },
    {
      id: 6,
      title: 'The First Omen',
      poster: '/hd_firstomen.jpg',
      rating: '6.7',
      duration: '1h 57m',
      selected: false,
    },
    {
      id: 7,
      title: 'Poor Things',
      poster: '/hd_poorthings.jpg',
      rating: '7.9',
      duration: '2h 21m',
      selected: false,
    },
    {
      id: 8,
      title: 'Argylle',
      poster: '/hd_argylle.jpg',
      rating: '6.4',
      duration: '2h 19m',
      selected: false,
    },
    {
      id: 9,
      title: 'The Marvels',
      poster: '/hd_marvels.jpg',
      rating: '6.8',
      duration: '2h 3m',
      selected: false,
    },
  ];

  // 5 phim Dành cho bạn với Poster Full HD Studio
  const forYou = [
    {
      id: 10,
      title: 'John Wick 4',
      poster: '/hd_johnwick4.jpg',
      rating: '8.1',
      duration: '2h 49m',
    },
    {
      id: 11,
      title: 'Oppenheimer',
      poster: '/hd_oppenheimer.jpg',
      rating: '8.8',
      duration: '3h 0m',
    },
    {
      id: 12,
      title: 'Interstellar',
      poster: '/hd_interstellar.jpg',
      rating: '8.7',
      duration: '2h 49m',
    },
    {
      id: 13,
      title: 'Spider-Man: No Way Home',
      poster: '/hd_spiderman.jpg',
      rating: '8.3',
      duration: '2h 28m',
    },
    {
      id: 14,
      title: 'The Batman',
      poster: '/hd_batman.jpg',
      rating: '7.6',
      duration: '2h 56m',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030916] text-[#F4F7FF] flex font-sans select-none antialiased">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR CỐ ĐỊNH BÊN TRÁI RỘNG 72PX */}
      {/* ========================================================================= */}
      <aside className="w-[72px] shrink-0 bg-[#040B18] border-r border-[#172A48]/80 flex flex-col items-center justify-between py-4 h-screen sticky top-0 z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#693BFF] to-[#8057FF] flex items-center justify-center shadow-lg shadow-[#693BFF]/30 hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-tighter">G</span>
          </Link>

          <nav className="flex flex-col items-center gap-1.5 w-full px-2 mt-2">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl bg-[#17143B] text-[#A875FF] border border-[#6037D9]/60 shadow-md shadow-[#693BFF]/20"
            >
              <span className="text-base">🏠</span>
              <span className="text-[10px] font-semibold tracking-tight">Trang chủ</span>
            </Link>

            <Link
              href="/movies"
              className="flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl text-[#7F91AF] hover:text-[#F4F7FF] hover:bg-[#071329]/60 transition-colors"
            >
              <span className="text-base">🎬</span>
              <span className="text-[10px] font-medium tracking-tight">Phim</span>
            </Link>

            <Link
              href="/showtimes"
              className="flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl text-[#7F91AF] hover:text-[#F4F7FF] hover:bg-[#071329]/60 transition-colors"
            >
              <span className="text-base">📍</span>
              <span className="text-[10px] font-medium tracking-tight">Rạp</span>
            </Link>

            <Link
              href="/promotions"
              className="flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl text-[#7F91AF] hover:text-[#F4F7FF] hover:bg-[#071329]/60 transition-colors"
            >
              <span className="text-base">🏷️</span>
              <span className="text-[10px] font-medium tracking-tight">Ưu đãi</span>
            </Link>

            <Link
              href="/profile"
              className="flex flex-col items-center justify-center gap-1 w-full h-13 rounded-xl text-[#7F91AF] hover:text-[#F4F7FF] hover:bg-[#071329]/60 transition-colors"
            >
              <span className="text-base">👑</span>
              <span className="text-[10px] font-medium tracking-tight">Thành viên</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3 w-full pb-2">
          <button
            onClick={() => alert('Mở CineBot AI hỗ trợ')}
            className="flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#7F91AF] group-hover:text-[#A875FF] transition-colors">
              💬
            </div>
            <span className="text-[9px] text-[#7F91AF] mt-0.5 scale-90">Hỗ trợ</span>
            <span className="text-[8px] font-bold text-[#A875FF] -mt-0.5 scale-85">Chat ngay</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#172A48]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. KHU VỰC CHÍNH BÊN PHẢI */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER TRÊN CÙNG */}
        <header className="h-12 w-full border-b border-[#172A48]/70 bg-[#030916]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#693BFF] flex items-center justify-center shadow-md shadow-[#693BFF]/30">
                <span className="text-white font-black text-xs">G</span>
              </div>
              <span className="text-sm font-bold tracking-tight text-[#F4F7FF]">
                CineBooking
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#AAB8D0]">
              <Link href="/" className="text-[#F4F7FF] font-semibold border-b-2 border-[#693BFF] pb-3.5 pt-3.5 -mb-px">
                Trang chủ
              </Link>
              <Link href="/movies" className="hover:text-[#F4F7FF] transition-colors">Phim</Link>
              <Link href="/showtimes" className="hover:text-[#F4F7FF] transition-colors flex items-center gap-1">
                <span>Rạp</span>
                <span className="text-[9px]">▼</span>
              </Link>
              <Link href="/promotions" className="hover:text-[#F4F7FF] transition-colors">Ưu đãi</Link>
              <Link href="/profile" className="hover:text-[#F4F7FF] transition-colors">Thành viên</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7F91AF]" />
              <input
                type="text"
                placeholder="Tìm phim, diễn viên, rạp..."
                className="w-full h-7.5 pl-8.5 pr-4 rounded-full bg-[#08162B] border border-[#172A48] text-xs text-[#F4F7FF] placeholder-[#7F91AF] focus:outline-none focus:border-[#693BFF] transition-all"
              />
            </div>

            <button
              title="Trợ lý CineBot AI"
              className="w-7 h-7 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#A875FF]"
            >
              <Bot className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
              className="w-7 h-7 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#AAB8D0]"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              title="Thông báo"
              className="relative w-7 h-7 rounded-full bg-[#08162B] border border-[#172A48] flex items-center justify-center text-[#AAB8D0]"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </button>

            <Link href="/profile" className="w-7 h-7 rounded-full ring-1 ring-[#172A48] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </header>

        {/* PHẦN BODY CHÍNH */}
        <main className="p-5 md:p-6 flex flex-col gap-6 max-w-[1536px] w-full">
          {/* ========================================================================= */}
          {/* 1. HERO BANNER: DUNE 2 SẮC NÉT FULL HD */}
          {/* ========================================================================= */}
          <section className="relative w-full h-[285px] rounded-2xl overflow-hidden border border-[#172A48] shadow-2xl flex items-center justify-between p-7 bg-[#030916]">
            {/* Nền sa mạc vàng hoàng hôn độ nét cao 1920x800 */}
            <div
              className="absolute inset-0 bg-cover bg-center -z-20 scale-102"
              style={{
                backgroundImage: `url('/dune_desert_wide.jpg')`,
                backgroundPosition: 'right 30%',
              }}
            />

            {/* Lớp gradient bóng đổ điện ảnh bảo đảm chữ cực nét */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030916] via-[#030916]/85 via-45% to-transparent -z-10" />

            {/* Cụm slide < 1/5 > */}
            <div className="absolute top-4 right-6 flex items-center gap-2 text-xs font-semibold text-[#AAB8D0] z-20">
              <button className="hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-[#AAB8D0]">1/5</span>
              <button className="hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thông tin chữ bên trái sắc nét 100% bằng HTML font */}
            <div className="max-w-md flex flex-col gap-2.5 z-10">
              <div className="w-fit px-2.5 py-0.5 rounded-full bg-[#17143B] border border-[#6037D9] text-[#A875FF] text-[10px] font-semibold">
                Đang chiếu
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[#F4F7FF] tracking-tight drop-shadow-md">
                Dune: Part Two
              </h1>

              <p className="text-[#AAB8D0] text-xs font-normal">
                Hành trình tiếp tục. Cuộc chiến vì tương lai.
              </p>

              <div className="flex items-center gap-2.5 text-xs text-[#AAB8D0] pt-0.5">
                <span className="flex items-center gap-1 font-bold text-[#F4F7FF]">
                  <Star className="w-3.5 h-3.5 fill-[#FFB52E] text-[#FFB52E]" /> 8.6
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#08162B] border border-[#172A48] text-[10px] font-semibold text-[#AAB8D0]">
                  P16
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#08162B] border border-[#172A48] text-[10px] text-[#AAB8D0]">
                  Khoa học viễn tưởng
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#AAB8D0]">
                  <Clock className="w-3 h-3 text-[#7F91AF]" /> 2h 46m
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/booking"
                  className="py-2.5 px-5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-[#FFFFFF] font-bold text-xs shadow-lg shadow-[#693BFF]/35 flex items-center gap-2 transition-all hover:scale-102"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Đặt vé ngay</span>
                </Link>

                <button
                  onClick={() => setIsTrailerModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-[#071329]/70 hover:bg-[#071329] border border-[#6037D9]/80 text-[#F4F7FF] font-semibold text-xs backdrop-blur-md flex items-center gap-2 transition-all hover:border-[#693BFF]"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Xem trailer</span>
                </button>
              </div>
            </div>

            {/* Khung video trailer preview Timothée Chalamet sắc nét bên phải */}
            <div className="hidden lg:flex w-76 h-42 rounded-xl overflow-hidden border border-[#6037D9]/70 shadow-2xl bg-[#040B18]/95 backdrop-blur-md flex-col justify-between p-2.5 z-10">
              <div
                onClick={() => setIsTrailerModalOpen(true)}
                className="relative flex-1 rounded-lg overflow-hidden bg-cover bg-center flex items-center justify-center cursor-pointer group/play"
                style={{
                  backgroundImage: `url('/trailer_timothee.png')`,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#040B18]/80 group-hover/play:bg-[#693BFF] group-hover/play:scale-110 flex items-center justify-center text-white border border-white/20 shadow-lg transition-all z-10">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#AAB8D0] pt-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#AAB8D0]">0:32 / 1:00</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="text-[#7F91AF] hover:text-[#F4F7FF] transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. KHU VỰC "ĐANG CHIẾU": 7 THẺ PHIM POSTER FULL HD KHÔNG MỜ */}
          {/* ========================================================================= */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h2 className="text-base font-bold text-[#F4F7FF]">
                  Đang chiếu
                </h2>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('NOW')}
                    className={`pb-1 transition-all ${
                      activeTab === 'NOW'
                        ? 'text-[#F4F7FF] border-b-2 border-[#693BFF]'
                        : 'text-[#7F91AF] hover:text-[#AAB8D0]'
                    }`}
                  >
                    Đang chiếu
                  </button>
                  <button
                    onClick={() => setActiveTab('SOON')}
                    className={`pb-1 transition-all ${
                      activeTab === 'SOON'
                        ? 'text-[#F4F7FF] border-b-2 border-[#693BFF]'
                        : 'text-[#7F91AF] hover:text-[#AAB8D0]'
                    }`}
                  >
                    Sắp chiếu
                  </button>
                  <button
                    onClick={() => setActiveTab('FAV')}
                    className={`pb-1 transition-all ${
                      activeTab === 'FAV'
                        ? 'text-[#F4F7FF] border-b-2 border-[#693BFF]'
                        : 'text-[#7F91AF] hover:text-[#AAB8D0]'
                    }`}
                  >
                    Phim yêu thích
                  </button>
                </div>
              </div>

              <Link
                href="/movies"
                className="text-xs font-medium text-[#7F91AF] hover:text-[#A875FF] flex items-center gap-0.5 transition-colors"
              >
                <span>Xem tất cả</span>
                <span className="text-[10px]">▶</span>
              </Link>
            </div>

            {/* LƯỚI 7 THẺ PHIM VỚI POSTER FULL HD GỐC VÀ CHỮ VECTOR SẮC NÉT */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {nowShowing.map((movie) => (
                <Link
                  key={movie.id}
                  href="/booking"
                  className={`group flex flex-col rounded-xl overflow-hidden bg-[#071329] border transition-all hover:scale-102 shadow-md ${
                    movie.selected
                      ? 'border-[#693BFF] ring-1 ring-[#693BFF]/50 shadow-lg shadow-[#693BFF]/20'
                      : 'border-[#172A48]/70 hover:border-[#6037D9]'
                  }`}
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#030916]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-2.5 flex flex-col gap-1">
                    <h4 className="font-bold text-[#F4F7FF] text-xs truncate group-hover:text-[#A875FF] transition-colors">
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#AAB8D0]">
                      <span className="flex items-center gap-1 font-semibold text-[#F4F7FF]">
                        <Star className="w-2.5 h-2.5 fill-[#FFB52E] text-[#FFB52E]" /> {movie.rating}
                      </span>
                      <span className="flex items-center gap-1 text-[#7F91AF]">
                        <Clock className="w-2.5 h-2.5" /> {movie.duration}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 3. DẢI BANNER TÍCH ĐIỂM THÀNH VIÊN CINECLUB */}
          {/* ========================================================================= */}
          <section className="relative w-full h-[76px] rounded-2xl overflow-hidden border border-[#6037D9]/50 shadow-xl flex items-center justify-between px-6 bg-gradient-to-r from-[#6532FF] via-[#4927C9] to-[#21145F]">
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md">
                <span className="text-lg">👑</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#F4F7FF] tracking-tight">
                  Thành viên CineClub
                </h3>
                <p className="text-[11px] text-[#AAB8D0]">
                  Tích điểm · Đổi quà · Nhận ưu đãi đặc biệt
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="z-10 py-2 px-5 rounded-xl bg-[#693BFF] hover:bg-[#8057FF] text-white font-bold text-xs shadow-md shadow-[#693BFF]/40 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Tham gia ngay</span>
              <span className="text-[11px]">▶</span>
            </Link>
          </section>

          {/* ========================================================================= */}
          {/* 4. KHU VỰC "DÀNH CHO BẠN" VỚI 5 PHIM FULL HD VÀ 1 CHATBOT CARD */}
          {/* ========================================================================= */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F4F7FF]">Dành cho bạn</h3>
                <p className="text-[11px] text-[#7F91AF]">Gợi ý từ lịch sử xem gần đây của bạn</p>
              </div>
              <Link href="/movies" className="text-xs font-medium text-[#7F91AF] hover:text-[#A875FF] transition-colors">
                Xem thêm &gt;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {forYou.map((movie) => (
                <Link
                  key={movie.id}
                  href="/booking"
                  className="group flex flex-col rounded-xl overflow-hidden bg-[#071329] border border-[#172A48]/70 hover:border-[#6037D9] transition-all hover:scale-102 shadow-md"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#030916]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform"
                    />
                    <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-[#040B18]/80 border border-white/20 flex items-center justify-center text-white">
                      <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1">
                    <h4 className="font-bold text-[#F4F7FF] text-xs truncate group-hover:text-[#A875FF] transition-colors">
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#AAB8D0]">
                      <span className="flex items-center gap-1 font-semibold text-[#F4F7FF]">
                        <Star className="w-2.5 h-2.5 fill-[#FFB52E] text-[#FFB52E]" /> {movie.rating}
                      </span>
                      <span className="flex items-center gap-1 text-[#7F91AF]">
                        <Clock className="w-2.5 h-2.5" /> {movie.duration}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Card Chatbot AI */}
              <div className="flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-[#09172E] via-[#071329] to-[#17143B] border border-[#6037D9]/80 shadow-lg">
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#693BFF]/30 border border-[#A875FF]/40 flex items-center justify-center text-[#A875FF] shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#F4F7FF] text-xs leading-snug">
                    Bạn muốn xem phim gì hôm nay?
                  </h4>
                  <p className="text-[10px] text-[#AAB8D0]">
                    Để mình gợi ý cho bạn nhé!
                  </p>
                </div>

                <button
                  onClick={() => alert('Mở CineBot AI trợ lý gợi ý phim')}
                  className="w-full py-2 px-3 rounded-lg bg-[#693BFF] hover:bg-[#8057FF] text-white text-[11px] font-bold shadow-md shadow-[#693BFF]/30 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  <span>Bắt đầu chat</span>
                  <span className="text-[10px]">▶</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* MODAL TRAILER ĐẦY ĐỦ */}
      {isTrailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black border border-[#693BFF]/50 shadow-2xl">
            <button
              onClick={() => setIsTrailerModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#040B18]/80 hover:bg-[#693BFF] text-white flex items-center justify-center border border-[#172A48] transition-all cursor-pointer"
            >
              ✕
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/Way9Dexny3w?autoplay=1&rel=0"
              title="Dune 2 Official Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
