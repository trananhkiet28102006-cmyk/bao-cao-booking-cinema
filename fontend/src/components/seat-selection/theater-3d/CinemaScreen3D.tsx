'use client';

import React from 'react';
import * as THREE from 'three';

export const CinemaScreen3D: React.FC = () => {
  return (
    <group position={[0, 2.5, -4.5]}>
      {/* Khung màn hình cong (Curved Screen Bezel) */}
      <mesh>
        <cylinderGeometry args={[11, 11, 4.2, 32, 1, true, Math.PI * 0.82, Math.PI * 0.36]} />
        <meshStandardMaterial
          color="#18181B"
          side={THREE.BackSide}
          roughness={0.8}
        />
      </mesh>

      {/* Mặt màn hình chiếu sáng hình ảnh Dune (Screen Glow) */}
      <mesh position={[0, 0, 0.05]}>
        <cylinderGeometry args={[10.95, 10.95, 4.0, 32, 1, true, Math.PI * 0.83, Math.PI * 0.34]} />
        <meshBasicMaterial
          color="#D97706"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Dải sáng neon hắt từ màn hình xuống khán phòng */}
      <pointLight position={[0, 0, 0.5]} intensity={2.5} color="#F59E0B" distance={12} />
    </group>
  );
};
