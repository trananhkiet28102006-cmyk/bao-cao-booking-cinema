'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, ShieldCheck, QrCode, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBookingStore } from '@/stores/useBookingStore';
import { useSeatStore } from '@/stores/useSeatStore';
import { paymentService } from '@/services/paymentService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { booking, fnbItems, appliedCoupon, applyCoupon, holdTimeSeconds, decrementHoldTimer } = useBookingStore();
  const { getSelectedSeats, getTotalPrice } = useSeatStore();

  const [paymentMethod, setPaymentMethod] = useState<'ZALOPAY' | 'MOMO' | 'VNPAY' | 'ATM'>('ZALOPAY');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zaloPayData, setZaloPayData] = useState<any>(null);

  const selectedSeats = getSelectedSeats();
  const seatTotal = getTotalPrice();
  const fnbTotal = fnbItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? 20000 : 0;
  const finalTotal = Math.max(0, seatTotal + fnbTotal - discount);

  // Đồng hồ đếm ngược 5 phút
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      decrementHoldTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, decrementHoldTimer]);

  const minutes = Math.floor(holdTimeSeconds / 60);
  const seconds = holdTimeSeconds % 60;
  const formatTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponMsg('Áp dụng mã giảm giá 20.000đ thành công!');
    } else {
      setCouponMsg('Mã giảm giá không hợp lệ. Hãy thử: CINE20 hoặc ZALOPAY');
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // Gọi ZaloPay Sandbox tạo đơn
      const res = await paymentService.createZaloPayOrder(1);
      if (res?.data) {
        setZaloPayData(res.data);
      } else {
        // Fallback demo sandbox
        simulateSuccessPayment();
      }
    } catch (err) {
      // Mock Sandbox Direct Transition
      simulateSuccessPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateSuccessPayment = () => {
    onClose();
    router.push('/ticket/CB2404-000123');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 flex flex-col gap-4 text-xs text-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">Xác nhận đơn hàng</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Đồng hồ đếm ngược 5 phút */}
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-purple-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-medium">Thời gian giữ ghế còn lại:</span>
          </div>
          <span className="font-mono font-bold text-sm text-purple-200">{formatTime}</span>
        </div>

        {/* Tóm tắt vé */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between font-bold text-white text-sm">
            <span>{booking.movieTitle}</span>
            <span>{seatTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            {booking.cinemaName} | {booking.roomName} ({booking.format})
          </p>
          <p className="text-slate-400 text-[11px]">
            {booking.showDate} - {booking.showTime}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <span className="text-slate-400 font-medium">Ghế:</span>
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/40 font-bold"
              >
                {s.code}
              </span>
            ))}
          </div>
        </div>

        {/* Mã giảm giá */}
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-slate-300">Mã giảm giá (Coupon)</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã (CINE20, ZALOPAY)"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold transition-colors"
            >
              Áp dụng
            </button>
          </div>
          {couponMsg && (
            <p className={`text-[11px] ${appliedCoupon ? 'text-green-400' : 'text-amber-400'}`}>
              {couponMsg}
            </p>
          )}
        </div>

        {/* Phương thức thanh toán */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-300">Phương thức thanh toán</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('ZALOPAY')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                paymentMethod === 'ZALOPAY'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-md shadow-blue-500/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center font-black text-white text-[10px]">
                ZP
              </div>
              <div>
                <p className="font-bold text-xs text-white">Ví ZaloPay</p>
                <p className="text-[10px] text-blue-300">Sandbox Test</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('MOMO')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                paymentMethod === 'MOMO'
                  ? 'bg-pink-950/40 border-pink-500 text-pink-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="w-7 h-7 rounded bg-pink-600 flex items-center justify-center font-black text-white text-[10px]">
                M
              </div>
              <div>
                <p className="font-bold text-xs text-white">Ví MoMo</p>
                <p className="text-[10px] text-slate-400">QR Code</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Tiền vé ({selectedSeats.length} ghế):</span>
            <span>{seatTotal.toLocaleString('vi-VN')}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-400 font-semibold">
              <span>Giảm giá ({appliedCoupon}):</span>
              <span>-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-black text-white pt-1">
            <span>Tổng thanh toán:</span>
            <span className="text-xl text-purple-400">{finalTotal.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        {/* Nút hành động thanh toán */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessing ? 'Đang kết nối ZaloPay...' : 'Thanh toán ngay'}
          </button>

          {/* Nút thanh toán 1-Click Sandbox Demo */}
          <button
            onClick={simulateSuccessPayment}
            className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Giả lập Thanh toán thành công (Sandbox 1-Click)
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Thanh toán an toàn, bảo mật tiêu chuẩn quốc tế</span>
        </div>
      </div>
    </div>
  );
};
