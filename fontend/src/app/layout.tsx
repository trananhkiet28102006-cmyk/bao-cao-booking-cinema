import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CineBooking — Nền tảng đặt vé xem phim trực tuyến hiện đại',
  description: 'Đặt vé xem phim trực tuyến hiện đại với trải nghiệm chọn ghế 3D và thanh toán ZaloPay Sandbox.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#030916] text-[#F4F7FF] antialiased">
        {children}
      </body>
    </html>
  );
}
