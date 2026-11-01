'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Ticket } from 'lucide-react';

export default function TicketPage() {
  return (
    <div className="min-h-screen bg-[#030916] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#071329] border border-[#172A48] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#693BFF]/20 border border-[#693BFF] mx-auto flex items-center justify-center text-[#A875FF]">
          <Ticket size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white">Vé Điện Tử</h1>
        <p className="text-sm text-[#AAB8D0]">
          Trang hiển thị vé điện tử và QR Code.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#693BFF] hover:bg-[#8057FF] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
        >
          <ArrowLeft size={16} />
          <span>Quay lại Trang Chủ</span>
        </Link>
      </div>
    </div>
  );
}
