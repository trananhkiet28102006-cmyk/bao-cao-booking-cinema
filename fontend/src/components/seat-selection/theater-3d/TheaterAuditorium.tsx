'use client';

import React from 'react';
import { Text } from '@react-three/drei';

export const TheaterAuditorium: React.FC = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <group>
      {/* Sàn khán phòng tối */}
      <mesh position={[0, -0.1, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#060913" roughness={0.9} />
      </mesh>

      {/* Tường bên trái */}
      <mesh position={[-7.5, 4, 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#0A0F1D" roughness={0.8} />
      </mesh>

      {/* Tường bên phải */}
      <mesh position={[7.5, 4, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#0A0F1D" roughness={0.8} />
      </mesh>

      {/* Chữ cái hàng ghế (A -> H) in trên lối đi hai bên */}
      {rows.map((row, idx) => {
        const z = -2 + idx * 1.1;
        const y = idx * 0.35 + 0.05;

        return (
          <React.Fragment key={row}>
            {/* Lối đi bên trái */}
            <Text
              position={[-2.4, y, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.28}
              color="#94A3B8"
              anchorX="center"
              anchorY="middle"
            >
              {row}
            </Text>

            {/* Lối đi bên phải */}
            <Text
              position={[2.4, y, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.28}
              color="#94A3B8"
              anchorX="center"
              anchorY="middle"
            >
              {row}
            </Text>
          </React.Fragment>
        );
      })}
    </group>
  );
};
