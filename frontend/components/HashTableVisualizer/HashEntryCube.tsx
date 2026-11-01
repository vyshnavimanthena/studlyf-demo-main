import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { HashEntry } from './types';

interface HashEntryCubeProps {
  entry: HashEntry;
  x: number;
  y: number;
  z: number;
}

export function HashEntryCube({ entry, x, y, z }: HashEntryCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.01);
  const currentPos = useRef(new THREE.Vector3(x, y, z));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, x, delta * 5);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, y, delta * 5);
    currentPos.current.z = THREE.MathUtils.lerp(currentPos.current.z, z, delta * 5);
    groupRef.current.position.set(currentPos.current.x, currentPos.current.y, currentPos.current.z);
    const nextScale = THREE.MathUtils.lerp(scale, 1, delta * 6);
    setScale(nextScale);
    groupRef.current.scale.setScalar(nextScale);
  });

  const baseColor = entry.highlighted ? '#facc15' : '#7c3aed';

  return (
    <group ref={groupRef} position={[x, y, z]}>
      <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0.12, 0.42]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">{`k:${entry.key}`}</Text>
      <Text position={[0, -0.15, 0.42]} fontSize={0.18} color="#c4b5fd" anchorX="center" anchorY="middle">{`v:${entry.value}`}</Text>
    </group>
  );
}

