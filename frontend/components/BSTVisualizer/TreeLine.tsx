import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TreeLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function TreeLine({ fromX, fromY, toX, toY }: TreeLineProps) {
  const { mid, len, angle } = useMemo(() => {
    const from = new THREE.Vector3(fromX, fromY - 0.5, 0);
    const to = new THREE.Vector3(toX, toY + 0.5, 0);
    const dir = to.clone().sub(from);
    return {
      len: dir.length(),
      mid: from.clone().add(to).multiplyScalar(0.5),
      angle: Math.atan2(dir.y, dir.x),
    };
  }, [fromX, fromY, toX, toY]);

  return (
    <mesh position={[mid.x, mid.y, 0]} rotation={[0, 0, angle]}>
      <boxGeometry args={[len, 0.06, 0.06]} />
      <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.4} transparent opacity={0.7} />
    </mesh>
  );
}

