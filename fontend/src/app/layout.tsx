import './globals.css';

export const metadata = {
  title: 'CineBooking — Nền tảng đặt vé xem phim trực tuyến hiện đại',
  description: 'Đặt vé xem phim trực tuyến với giao diện điện ảnh cao cấp và trải nghiệm chọn ghế 3D.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#030916] text-[#F4F7FF] antialiased selection:bg-[#693BFF] selection:text-white"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
