'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Seat } from '@/types/seat.types';

interface SeatMeshProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seatId: string) => void;
  onHover: (seat: Seat | null) => void;
}

export const SeatMesh3D: React.FC<SeatMeshProps> = ({
  seat,
  isSelected,
  onSelect,
  onHover,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Xác định màu sắc vật liệu dựa trên trạng thái và loại ghế
  let seatColor = '#1E3A8A'; // Mặc định xanh navy
  let emissiveColor = '#000000';
  let emissiveIntensity = 0.0;

  if (seat.status === 'SOLD' || seat.status === 'HELD') {
    seatColor = '#334155'; // Xám tối
  } else if (isSelected) {
    seatColor = '#9333EA'; // Tím điện ảnh sáng
    emissiveColor = '#A855F7';
    emissiveIntensity = 0.6; // Phát quang dịu
  } else if (seat.type === 'VIP') {
    seatColor = '#D97706'; // Vàng hổ phách
    if (isHovered) {
      emissiveColor = '#F59E0B';
      emissiveIntensity = 0.3;
    }
  } else if (seat.type === 'COUPLE') {
    seatColor = '#BE185D'; // Tím hồng
  } else if (isHovered) {
    seatColor = '#2563EB';
    emissiveColor = '#38BDF8';
    emissiveIntensity = 0.25;
  }

  // Animation nhấc nhẹ ghế khi được chọn
  useFrame(() => {
    if (groupRef.current) {
      const targetY = isSelected ? seat.position3D[1] + 0.08 : seat.position3D[1];
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.15;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (seat.status !== 'SOLD' && seat.status !== 'HELD') {
      onSelect(seat.id);
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    onHover(seat);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    onHover(null);
  };

  return (
    <group
      ref={groupRef}
      position={[seat.position3D[0], seat.position3D[1], seat.position3D[2]]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 1. Đệm ngồi (Seat Cushion) */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.55, 0.12, 0.5]} />
        <meshStandardMaterial
          color={seatColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Tựa lưng ngả nhẹ (Backrest) */}
      <mesh position={[0, 0.42, 0.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.52, 0.52, 0.1]} />
        <meshStandardMaterial
          color={seatColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* 3. Tay vịn bên trái (Left Armrest) */}
      <mesh position={[-0.3, 0.28, 0.02]}>
        <boxGeometry args={[0.07, 0.14, 0.46]} />
        <meshStandardMaterial color="#0F172A" roughness={0.7} />
      </mesh>

      {/* 4. Tay vịn bên phải (Right Armrest) */}
      <mesh position={[0.3, 0.28, 0.02]}>
        <boxGeometry args={[0.07, 0.14, 0.46]} />
        <meshStandardMaterial color="#0F172A" roughness={0.7} />
      </mesh>

      {/* 5. Chân đế chịu lực (Seat Base) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#090D16" roughness={0.9} />
      </mesh>
    </group>
  );
};
