import React from 'react';

interface ArrowProps {
  fromX: number;
  toX: number;
  y?: number;
}

export function Arrow({ fromX, toX, y = 1.2 }: ArrowProps) {
  const midX = (fromX + toX) / 2;
  const length = Math.abs(toX - fromX) - 1.2;

  if (length <= 0) return null;

  return (
    <group position={[midX, y, 0.6]}>
      <mesh>
        <boxGeometry args={[length, 0.04, 0.04]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[length / 2 + 0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

