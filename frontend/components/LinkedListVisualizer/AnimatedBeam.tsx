import React from 'react';

interface AnimatedBeamProps {
  fromX: number;
  toX: number;
  y?: number;
}

export function AnimatedBeam({ fromX, toX, y = 1.5 }: AnimatedBeamProps) {
  const midX = (fromX + toX) / 2;
  const length = Math.abs(toX - fromX) - 1.6;
  if (length <= 0) return null;

  return (
    <group position={[midX, y, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.06, 0.06]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[length / 2 + 0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.22, 8]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

