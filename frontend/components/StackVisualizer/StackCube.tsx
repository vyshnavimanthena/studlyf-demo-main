import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { StackElement } from './types';

interface StackCubeProps {
  element: StackElement;
  targetY: number;
  isTop: boolean;
}

export function StackCube({ element, targetY, isTop }: StackCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.01);
  const currentPos = useRef(new THREE.Vector3(0, targetY, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, targetY, delta * 5);
    groupRef.current.position.y = currentPos.current.y;
    groupRef.current.position.x = isTop ? Math.sin(Date.now() * 0.002) * 0.05 : 0;
    const nextScale = THREE.MathUtils.lerp(scale, 1, delta * 6);
    setScale(nextScale);
    groupRef.current.scale.setScalar(nextScale);
  });

  const baseColor = element.highlighted ? '#facc15' : isTop ? '#818cf8' : '#7c3aed';

  return (
    <group ref={groupRef} position={[0, targetY, 0]}>
      <RoundedBox args={[1.2, 0.9, 1.2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0, 0.62]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">{element.value.toString()}</Text>
      <Text position={[0.85, 0, 0]} fontSize={0.18} color="#a78bfa" anchorX="center" anchorY="middle">[{element.index}]</Text>
      {isTop && <Text position={[-0.85, 0, 0]} fontSize={0.16} color="#facc15" anchorX="center" anchorY="middle">TOP</Text>}
    </group>
  );
}

