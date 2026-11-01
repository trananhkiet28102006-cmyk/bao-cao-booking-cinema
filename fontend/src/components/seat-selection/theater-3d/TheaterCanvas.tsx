'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TheaterLighting } from './TheaterLighting';
import { CinemaScreen3D } from './CinemaScreen3D';
import { TheaterAuditorium } from './TheaterAuditorium';
import { SeatMesh3D } from './SeatMesh3D';
import { useSeatStore } from '@/stores/useSeatStore';

interface TheaterCanvasProps {
  controlsRef?: React.RefObject<any>;
}

export const TheaterCanvas: React.FC<TheaterCanvasProps> = ({ controlsRef }) => {
  const { seats, selectedSeatIds, toggleSeat, setHoveredSeat } = useSeatStore();

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 8.5, 12], fov: 42 }}
        className="w-full h-full"
      >
        <TheaterLighting />
        <CinemaScreen3D />
        <TheaterAuditorium />

        {/* Hệ thống ghế 3D */}
        <group>
          {seats.map((seat) => (
            <SeatMesh3D
              key={seat.id}
              seat={seat}
              isSelected={selectedSeatIds.includes(seat.id)}
              onSelect={toggleSeat}
              onHover={setHoveredSeat}
            />
          ))}
        </group>

        {/* Điều khiển Camera có giới hạn góc xoay rạp chiếu */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 1.2, 0.5]}
          enablePan={false}
          minDistance={6}
          maxDistance={18}
          minPolarAngle={Math.PI / 6} // Không ngửa lên trần quá mức
          maxPolarAngle={Math.PI / 2.3} // Tuyệt đối không chui xuống gầm sàn rạp
          minAzimuthAngle={-Math.PI / 4} // Giới hạn xoay ngang trái
          maxAzimuthAngle={Math.PI / 4}  // Giới hạn xoay ngang phải
        />
      </Canvas>
    </div>
  );
};
