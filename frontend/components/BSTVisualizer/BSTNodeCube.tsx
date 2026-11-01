import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { FlatBSTNode } from './types';

interface BSTNodeCubeProps {
  node: FlatBSTNode;
}

export function BSTNodeCube({ node }: BSTNodeCubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0.01);
  const currentPos = useRef(new THREE.Vector3(node.x, node.y, 0));

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.x = THREE.MathUtils.lerp(currentPos.current.x, node.x, delta * 4);
    currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, node.y, delta * 4);
    groupRef.current.position.set(currentPos.current.x, currentPos.current.y, 0);
    const nextScale = THREE.MathUtils.lerp(scale, 1, delta * 6);
    setScale(nextScale);
    groupRef.current.scale.setScalar(nextScale);
  });

  const baseColor = node.highlighted ? '#facc15' : '#7c3aed';

  return (
    <group ref={groupRef} position={[node.x, node.y, 0]}>
      <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.35} metalness={0.3} roughness={0.4} transparent opacity={0.9} />
      </RoundedBox>
      <Text position={[0, 0, 0.48]} fontSize={0.35} color="white" anchorX="center" anchorY="middle">{node.value.toString()}</Text>
    </group>
  );
}

