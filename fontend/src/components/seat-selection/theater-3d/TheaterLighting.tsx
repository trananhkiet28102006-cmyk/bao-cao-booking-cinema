'use client';

import React from 'react';

export const TheaterLighting: React.FC = () => {
  return (
    <>
      {/* Ánh sáng ambient tối của rạp chiếu phim */}
      <ambientLight intensity={0.4} color="#0B132B" />

      {/* Ánh sáng trần dịu */}
      <directionalLight position={[0, 12, 10]} intensity={0.6} color="#E2E8F0" />

      {/* Đèn hắt tường hai bên (Sconce Lighting) màu vàng ấm */}
      <pointLight position={[-6.5, 3.5, 2]} intensity={1.2} color="#F59E0B" distance={8} />
      <pointLight position={[-6.5, 4.0, 5]} intensity={1.2} color="#F59E0B" distance={8} />
      <pointLight position={[6.5, 3.5, 2]} intensity={1.2} color="#F59E0B" distance={8} />
      <pointLight position={[6.5, 4.0, 5]} intensity={1.2} color="#F59E0B" distance={8} />
    </>
  );
};
