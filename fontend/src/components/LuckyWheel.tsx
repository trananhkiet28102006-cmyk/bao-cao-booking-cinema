'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { 
  Sparkles, 
  Gift, 
  RotateCw, 
  Coins, 
  History, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { 
  cineBookingApi, 
  LuckyWheelPrize, 
  SpinResult, 
  SpinHistoryItem 
} from '@/lib/api';
import { triggerCinemaConfetti } from '@/lib/motion';

interface LuckyWheelProps {
  userPoints: number;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  onUpdatePoints: (newBalance: number) => void;
}

// 8 ô vòng quay chuẩn đẹp
const SLICE_CONFIG: Record<number, { icon: string; line1: string; line2: string; color: string }> = {
  0: { icon: '🎁', line1: '+50 ĐIỂM', line2: 'ĐIỂM THƯỞNG', color: '#10b981' },
  1: { icon: '🎟️', line1: 'VOUCHER', line2: '20.000đ', color: '#ec4899' },
  2: { icon: '🍿', line1: 'BẮP RANG', line2: 'MIỄN PHÍ', color: '#f59e0b' },
  3: { icon: '🍀', line1: 'MAY MẮN', line2: 'LẦN SAU', color: '#64748b' },
  4: { icon: '💎', line1: '+100 ĐIỂM', line2: 'THƯỞNG', color: '#8b5cf6' },
  5: { icon: '🎁', line1: 'VOUCHER', line2: '50.000đ', color: '#06b6d4' },
  6: { icon: '✨', line1: '+200 ĐIỂM', line2: 'HOÀN 100%', color: '#3b82f6' },
  7: { icon: '👑', line1: 'JACKPOT', line2: '1.000 PTS', color: '#e11d48' },
};

const DEFAULT_PRIZES: LuckyWheelPrize[] = [
  { id: 9, slotIndex: 0, name: '50 Điểm Thưởng', prizeType: 'POINTS', prizeValue: 50, probabilityWeight: 70, color: '#10b981', icon: 'sparkles' },
  { id: 10, slotIndex: 1, name: 'Voucher Giảm 20K', prizeType: 'COUPON', prizeValue: 20000, probabilityWeight: 8, color: '#ec4899', icon: 'ticket' },
  { id: 11, slotIndex: 2, name: 'Combo Bắp Rang', prizeType: 'FNB', prizeValue: 0, probabilityWeight: 7, color: '#f59e0b', icon: 'popcorn' },
  { id: 12, slotIndex: 3, name: 'May Mắn Lần Sau', prizeType: 'NO_PRIZE', prizeValue: 0, probabilityWeight: 5, color: '#64748b', icon: 'smile' },
  { id: 13, slotIndex: 4, name: '100 Điểm Thưởng', prizeType: 'POINTS', prizeValue: 100, probabilityWeight: 4, color: '#8b5cf6', icon: 'flame' },
  { id: 14, slotIndex: 5, name: 'Voucher Giảm 50K', prizeType: 'COUPON', prizeValue: 50000, probabilityWeight: 3, color: '#06b6d4', icon: 'gift' },
  { id: 15, slotIndex: 6, name: 'Hoàn 200 Điểm', prizeType: 'POINTS', prizeValue: 200, probabilityWeight: 2, color: '#3b82f6', icon: 'coins' },
  { id: 16, slotIndex: 7, name: 'JACKPOT 1000 PTS', prizeType: 'POINTS', prizeValue: 1000, probabilityWeight: 1, color: '#e11d48', icon: 'crown' },
];

const getCleanPrizeName = (name: string, slotIndex: number) => {
  const fallbackNames: Record<number, string> = {
    0: '50 Điểm Thưởng',
    1: 'Voucher Giảm 20K',
    2: 'Combo Bắp Rang',
    3: 'May Mắn Lần Sau',
    4: '100 Điểm Thưởng',
    5: 'Voucher Giảm 50K',
    6: 'Hoàn 200 Điểm',
    7: 'JACKPOT 1000 PTS',
  };
  if (!name || name.includes('?')) {
    return fallbackNames[slotIndex] || name;
  }
  return name;
};

export default function LuckyWheel({
  userPoints,
  isLoggedIn,
  onRequireLogin,
  onUpdatePoints,
}: LuckyWheelProps) {
  const [prizes, setPrizes] = useState<LuckyWheelPrize[]>(DEFAULT_PRIZES);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [historyList, setHistoryList] = useState<SpinHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wheelRef = useRef<SVGSVGElement | null>(null);
  const currentRotationRef = useRef<number>(0);

  // Tải danh sách giải thưởng thực tế từ Backend
  useEffect(() => {
    cineBookingApi
      .getLuckyWheelPrizes()
      .then((data) => {
        if (data && data.length > 0) {
          setPrizes(data.sort((a, b) => a.slotIndex - b.slotIndex));
        }
      })
      .catch((err) => {
        console.warn('Using default prizes due to:', err);
      });
  }, []);

  const loadHistory = async () => {
    if (!isLoggedIn) return;
    try {
      const data = await cineBookingApi.getLuckyWheelHistory();
      setHistoryList(data);
    } catch (e) {
      console.warn('Failed to load wheel history', e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadHistory();
    }
  }, [isLoggedIn]);

  const handleSpin = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    if (userPoints < 200) {
      setErrorMsg('Bạn cần ít nhất 200 điểm CineClub để quay vòng quay!');
      return;
    }

    if (isSpinning) return;

    setErrorMsg(null);
    setIsSpinning(true);

    try {
      const result = await cineBookingApi.spinLuckyWheel();

      // Thuật toán quay số góc chuẩn:
      // Ô slotIndex = k có tâm ở góc k * 45 độ
      // Để ô k dừng ngay tại kim chỉ ở 12h (đỉnh bánh xe), bánh xe cần quay (360 - k * 45) độ
      const slotIndex = result.slotIndex ?? 0;
      const targetRemainder = (360 - (slotIndex * 45) % 360) % 360;

      const currentRot = currentRotationRef.current;
      const currentRemainder = ((currentRot % 360) + 360) % 360;
      let diff = targetRemainder - currentRemainder;
      if (diff <= 0) diff += 360;

      // Quay 5 vòng tròn lớn (1800 độ) + góc bù
      const finalRotation = currentRot + 1800 + diff;
      currentRotationRef.current = finalRotation;

      if (wheelRef.current) {
        gsap.to(wheelRef.current, {
          rotation: finalRotation,
          duration: 4.8,
          ease: 'power4.out',
          transformOrigin: '50% 50%',
          onComplete: () => {
            setIsSpinning(false);
            setSpinResult(result);
            setShowResultModal(true);
            onUpdatePoints(result.newBalance);

            // Bắn pháo hoa ăn mừng
            triggerCinemaConfetti();

            loadHistory();
          },
        });
      }
    } catch (err: any) {
      setIsSpinning(false);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi quay thưởng, vui lòng thử lại!');
    }
  };

  // Hình quạt nan hoa chuẩn toán học: bán kính 170px, góc 45 độ đối xứng qua trục đứng 12h
  const wedgePath = "M 200 200 L 134.94 42.94 A 170 170 0 0 1 265.06 42.94 Z";

  return (
    <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-[#22436D] bg-gradient-to-br from-[#0B152A] via-[#081022] to-[#040814] shadow-2xl">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#693BFF]/15 via-[#10B981]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-[#1E2E4B]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#6EE7B7] text-xs font-bold">
            <Sparkles size={14} className="text-[#34D399]" />
            <span>CINEWHEEL • VÒNG QUAY MAY MẮN</span>
            <span className="px-2 py-0.2 rounded-full bg-[#10b981] text-black text-[10px] font-black uppercase">
              100% Trúng Quà
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            Đổi Điểm Thưởng Nhận Quà Khủng
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Chỉ với <b className="text-amber-400">200 điểm/lượt</b>, cơ hội rinh ngay voucher 50.000đ, combo bắp rang hoặc Jackpot 1.000 điểm!
          </p>
        </div>

        {/* Current user balance & Action buttons */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#13223E] border border-[#233B65] flex items-center gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Coins size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8FA5C5]">Điểm thưởng của bạn</p>
              <p className="text-lg font-black text-amber-400 leading-tight">
                {userPoints.toLocaleString('vi-VN')} <span className="text-xs text-amber-400/80">pts</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadHistory();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1B2C4B] hover:bg-[#253D68] text-[#CBD5E1] hover:text-white border border-[#294270] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Lịch sử quay"
          >
            <History size={15} />
            <span className="hidden sm:inline">Lịch sử</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-rose-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Wheel Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: The Wheel Graphic */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
            {/* Outer LED Glowing Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#2A436D] shadow-[0_0_50px_rgba(105,59,255,0.35)] pointer-events-none" />

            {/* Glowing Bulb lights */}
            <div className="absolute inset-2 rounded-full border border-amber-400/30 pointer-events-none" />

            {/* NEEDLE POINTER (Fixed at Top / 12 o'clock) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] pointer-events-none">
              <div className="w-7 h-10 bg-gradient-to-b from-[#FFE066] via-[#FFB800] to-[#E53935] [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
              <div className="w-3.5 h-3.5 -mt-8 rounded-full bg-white shadow-md border-2 border-amber-500" />
            </div>

            {/* ROTATING WHEEL SVG */}
            <svg
              ref={wheelRef}
              viewBox="0 0 400 400"
              className="w-full h-full transform-gpu"
              style={{ willChange: 'transform' }}
            >
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.75" />
                </filter>
              </defs>

              {/* 8 Nan quạt chuẩn xác 100% */}
              {Array.from({ length: 8 }).map((_, idx) => {
                const cfg = SLICE_CONFIG[idx] || SLICE_CONFIG[0];
                return (
                  <g key={idx} transform={`rotate(${idx * 45} 200 200)`}>
                    {/* Nan quạt */}
                    <path
                      d={wedgePath}
                      fill={cfg.color}
                      stroke="#061020"
                      strokeWidth="2.5"
                    />

                    {/* Icon Emoji */}
                    <text
                      x="200"
                      y="64"
                      fontSize="17"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {cfg.icon}
                    </text>

                    {/* Dòng 1: Tiêu đề in hoa đậm rõ ràng */}
                    <text
                      x="200"
                      y="87"
                      fill="#FFFFFF"
                      fontSize="11.5"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      filter="url(#shadow)"
                      style={{ letterSpacing: '0.3px', fontFamily: 'system-ui, sans-serif' }}
                    >
                      {cfg.line1}
                    </text>

                    {/* Dòng 2: Mô tả phụ màu vàng kim */}
                    <text
                      x="200"
                      y="104"
                      fill="#FFE57F"
                      fontSize="9.5"
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="central"
                      filter="url(#shadow)"
                      style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                      {cfg.line2}
                    </text>
                  </g>
                );
              })}

              {/* Viền ngoài chấm bi tròn trang trí */}
              <circle
                cx={200}
                cy={200}
                r={170}
                fill="none"
                stroke="#FFE066"
                strokeWidth="4"
                strokeDasharray="4 6"
              />
            </svg>

            {/* CENTER SPIN BUTTON */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[#FFE57F] via-[#FFB703] to-[#FB8500] hover:from-[#FFF176] hover:to-[#FF9800] text-[#4A154B] font-black shadow-[0_0_30px_rgba(255,183,3,0.6)] flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed border-4 border-white ${
                isSpinning ? 'animate-pulse' : ''
              }`}
            >
              {isSpinning ? (
                <>
                  <RotateCw size={22} className="animate-spin text-[#31111D]" />
                  <span className="text-[10px] font-black text-[#31111D] mt-0.5">QUAY...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="text-[#31111D]" />
                  <span className="text-xs sm:text-sm font-black tracking-tight text-[#31111D]">
                    QUAY
                  </span>
                  <span className="text-[9px] font-extrabold text-[#5B1E31]">
                    200 pts
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Prize Legend & History Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#0E1A33] border border-[#1D3258] p-5 shadow-lg">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              <span>Cơ Cấu Giải Thưởng (8 Ô)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {prizes.map((p) => {
                const cfg = SLICE_CONFIG[p.slotIndex] || SLICE_CONFIG[0];
                return (
                  <div
                    key={p.id || p.slotIndex}
                    className="p-2.5 rounded-xl border border-[#1A2D4E] bg-[#0A1324] flex items-center gap-2.5 transition-all hover:border-[#2C497A]"
                  >
                    <span className="text-base shrink-0">{cfg.icon}</span>
                    <div className="truncate">
                      <p className="font-extrabold text-white truncate text-[11px]">
                        {getCleanPrizeName(p.name, p.slotIndex)}
                      </p>
                      <p className="text-[10px] text-amber-400/90 font-medium">
                        {p.prizeType === 'POINTS' ? 'Cộng điểm tự động' : p.prizeType === 'COUPON' ? 'Voucher giảm vé' : p.prizeType === 'FNB' ? 'Nhận bắp rang bơ' : 'Chúc bạn may mắn'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1C2F52] flex items-center justify-between text-[11px] text-[#93A5C3]">
              <span>Phí lượt quay: <b className="text-amber-400">200 điểm</b></span>
              <span className="text-emerald-400 font-bold">★ 100% Quay Là Có Quà</span>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="rounded-2xl bg-[#091426] border border-[#172946] p-4 text-xs text-[#8A9EB9] space-y-2">
            <p className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Điểm trúng thưởng được cộng tự động ngay vào tài khoản hội viên CineClub.</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Voucher trúng thưởng tự động lưu vào ví và áp dụng ngay khi đặt vé xem phim.</span>
            </p>
          </div>
        </div>
      </div>

      {/* RESULT MODAL */}
      {mounted && showResultModal && spinResult && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setShowResultModal(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#16274A] to-[#0A1325] border-2 border-[#FFE066] p-7 text-center shadow-[0_0_80px_rgba(255,224,102,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 text-[#8FA5C5] hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-black mx-auto flex items-center justify-center shadow-lg mb-4">
              <Sparkles size={32} />
            </div>

            <p className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              KẾT QUẢ VÒNG QUAY MAY MẮN
            </p>
            <h3 className="text-2xl font-black text-white mt-1 mb-3">
              {getCleanPrizeName(spinResult.prizeName, spinResult.slotIndex)}
            </h3>

            <div className="p-4 rounded-2xl bg-[#0B1528] border border-[#233B65] space-y-2 my-4 text-xs text-[#CBD5E1]">
              <div className="flex justify-between">
                <span className="text-[#8499B8]">Chi phí quay:</span>
                <span className="font-bold text-rose-400">-200 điểm</span>
              </div>
              {spinResult.pointsRewarded > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#8499B8]">Điểm thưởng nhận:</span>
                  <span className="font-bold text-emerald-400">+{spinResult.pointsRewarded} điểm</span>
                </div>
              )}
              {spinResult.couponCode && (
                <div className="flex justify-between items-center pt-1 border-t border-[#1C2F52]">
                  <span className="text-[#8499B8]">Mã Voucher trúng:</span>
                  <span className="px-2.5 py-1 rounded bg-[#693BFF] text-white font-mono font-bold tracking-wider">
                    {spinResult.couponCode}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-[#1C2F52]">
                <span className="text-[#8499B8]">Số dư điểm mới:</span>
                <span className="font-extrabold text-amber-400">{spinResult.newBalance.toLocaleString('vi-VN')} pts</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResultModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#233B65] hover:bg-[#2D4A7E] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowResultModal(false);
                  handleSpin();
                }}
                disabled={isSpinning || userPoints < 200}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-extrabold transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                Quay Tiếp (200 pts)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* HISTORY MODAL */}
      {mounted && showHistory && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-3xl bg-[#0B152A] border border-[#22436D] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E3355]">
              <div className="flex items-center gap-2">
                <History className="text-amber-400" size={18} />
                <h3 className="text-base font-extrabold text-white">Lịch Sử Quay Thưởng Của Bạn</h3>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-[#8FA5C5] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-[350px] overflow-y-auto space-y-2.5 pr-1">
              {historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8499B8]">
                  Bạn chưa có lượt quay nào. Hãy thử vận may ngay!
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0E1A33] border border-[#1D3258] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-extrabold text-white">{getCleanPrizeName(item.prizeName, 0)}</p>
                      <p className="text-[10px] text-[#7A8EA8] mt-0.5">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.pointsRewarded > 0 ? (
                        <p className="font-bold text-emerald-400">+{item.pointsRewarded} pts</p>
                      ) : item.couponCode ? (
                        <span className="px-2 py-0.5 rounded bg-[#693BFF]/20 text-[#A875FF] font-mono text-[10px] font-bold">
                          {item.couponCode}
                        </span>
                      ) : (
                        <p className="text-[#8499B8] text-[11px]">Không trúng điểm</p>
                      )}
                      <p className="text-[10px] text-rose-400/80">-{item.pointsSpent} pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#1A2E50] hover:bg-[#253E6A] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
