import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LLNode } from './types';
import { LLNodeCube } from './LLNodeCube';
import { AnimatedBeam } from './AnimatedBeam';

function SkyGradient() {
  const mesh = useRef<THREE.Mesh>(null);
  const shader = useMemo(() => ({
    uniforms: {
      topColor: { value: new THREE.Color('#0a0a2e') },
      bottomColor: { value: new THREE.Color('#1a1040') },
    },
    vertexShader: 'varying vec3 vWorldPosition; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vWorldPosition=wp.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition).y*0.5+0.5; gl_FragColor=vec4(mix(bottomColor,topColor,h),1.0);} ',
  }), []);

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[100, 32, 32]} />
      <shaderMaterial {...shader} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

interface SceneProps {
  nodes: LLNode[];
}

export default function Scene({ nodes }: SceneProps) {
  const spacing = 2.2;
  const startX = -(nodes.length - 1) * spacing / 2;

  return (
    <Canvas camera={{ position: [0, 6, 14], fov: 50 }} style={{ position: 'absolute', inset: 0 }}>
      <SkyGradient />
      <ambientLight intensity={0.4} color="#b8a9e8" />
      <directionalLight position={[10, 15, 10]} intensity={0.6} color="#c4b5fd" />
      <Grid args={[60, 60]} cellSize={1} cellThickness={0.5} cellColor="#4a3a8a" sectionSize={5} sectionThickness={1} sectionColor="#6b4ecf" fadeDistance={40} fadeStrength={1} position={[0, -0.01, 0]} infiniteGrid />
      {nodes.map((node, i) => (
        <LLNodeCube key={node.id} node={node} targetX={startX + i * spacing} isHead={i === 0} isTail={i === nodes.length - 1} />
      ))}
      {nodes.length > 1 && nodes.slice(0, -1).map((node, i) => (
        <AnimatedBeam key={`beam-${node.id}`} fromX={startX + i * spacing} toX={startX + (i + 1) * spacing} />
      ))}
      {nodes.length > 0 && (
        <Text position={[startX + nodes.length * spacing - spacing / 2 + 1.2, 1.5, 0]} fontSize={0.25} color="#ef4444" anchorX="center" anchorY="middle">NULL</Text>
      )}
      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={35} />
    </Canvas>
  );
}

