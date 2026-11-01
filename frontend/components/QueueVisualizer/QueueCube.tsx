import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { QueueElement } from './types';

interface QueueCubeProps {
  element: QueueElement;
  targetX: number;
  isFront: boolean;
  isRear: boolean;
}

export function QueueCube({ element, targetX, isFront, isRear }: QueueCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.01);
  const currentPos = useRef(new THREE.Vector3(targetX, 1.2, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, delta * 5);
    groupRef.current.position.x = currentPos.current.x;
    groupRef.current.position.y = 1.2 + Math.sin(Date.now() * 0.002 + element.index) * 0.06;
    const nextScale = THREE.MathUtils.lerp(scale, 1, delta * 6);
    setScale(nextScale);
    groupRef.current.scale.setScalar(nextScale);
  });

  const baseColor = element.highlighted ? '#facc15' : isFront ? '#22d3ee' : isRear ? '#818cf8' : '#7c3aed';

  return (
    <group ref={groupRef} position={[targetX, 1.2, 0]}>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0, 0.52]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">{element.value.toString()}</Text>
      <Text position={[0, -0.8, 0]} fontSize={0.18} color="#a78bfa" anchorX="center" anchorY="middle">[{element.index}]</Text>
      {isFront && <Text position={[0, 0.75, 0]} fontSize={0.16} color="#22d3ee" anchorX="center" anchorY="middle">FRONT</Text>}
      {isRear && <Text position={[0, 0.75, 0]} fontSize={0.16} color="#818cf8" anchorX="center" anchorY="middle">REAR</Text>}
    </group>
  );
}

