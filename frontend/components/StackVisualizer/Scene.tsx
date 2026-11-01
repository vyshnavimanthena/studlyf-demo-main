import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { StackElement } from './types';
import { StackCube } from './StackCube';

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
  elements: StackElement[];
}

export default function Scene({ elements }: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 50 }} style={{ position: 'absolute', inset: 0 }}>
      <SkyGradient />
      <ambientLight intensity={0.4} color="#b8a9e8" />
      <directionalLight position={[10, 15, 10]} intensity={0.6} color="#c4b5fd" />
      <Grid args={[60, 60]} cellSize={1} cellThickness={0.5} cellColor="#4a3a8a" sectionSize={5} sectionThickness={1} sectionColor="#6b4ecf" fadeDistance={40} fadeStrength={1} position={[0, -0.01, 0]} infiniteGrid />
      {elements.map((el, i) => <StackCube key={el.id} element={el} targetY={0.5 + i * 1.1} isTop={i === elements.length - 1} />)}
      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={30} />
    </Canvas>
  );
}

