import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ArrayElement } from './types';

interface AnimatedCubeProps {
  element: ArrayElement;
  targetX: number;
}

export function AnimatedCube({ element, targetX }: AnimatedCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.01);
  const currentPos = useRef(new THREE.Vector3(targetX, 1.5, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, targetX, delta * 5);
    groupRef.current.position.x = currentPos.current.x;
    groupRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.002 + element.index) * 0.08;
    const nextScale = THREE.MathUtils.lerp(scale, 1, delta * 6);
    setScale(nextScale);
    groupRef.current.scale.setScalar(nextScale);
  });

  const baseColor = element.highlighted ? '#facc15' : '#7c3aed';

  return (
    <group ref={groupRef} position={[targetX, 1.5, 0]}>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0, 0.52]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">{element.value.toString()}</Text>
      <Text position={[0, -0.85, 0]} fontSize={0.2} color="#a78bfa" anchorX="center" anchorY="middle">[{element.index}]</Text>
    </group>
  );
}

