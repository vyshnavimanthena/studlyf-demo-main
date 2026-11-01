import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { HashBucket } from './types';
import { HashEntryCube } from './HashEntryCube';

function SkyGradient() {
  const mesh = useRef<THREE.Mesh>(null);
  const shader = useMemo(() => ({
    uniforms: { topColor: { value: new THREE.Color('#0a0a2e') }, bottomColor: { value: new THREE.Color('#1a1040') } },
    vertexShader: 'varying vec3 vWorldPosition; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vWorldPosition=wp.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
    fragmentShader: 'uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition).y*0.5+0.5; gl_FragColor=vec4(mix(bottomColor,topColor,h),1.0);} ',
  }), []);
  return (<mesh ref={mesh}><sphereGeometry args={[100, 32, 32]} /><shaderMaterial {...shader} side={THREE.BackSide} depthWrite={false} /></mesh>);
}

interface SceneProps {
  buckets: HashBucket[];
}

export default function Scene({ buckets }: SceneProps) {
  const spacing = 1.8;
  const startX = -(buckets.length - 1) * spacing / 2;

  return (
    <Canvas camera={{ position: [0, 8, 16], fov: 50 }} style={{ position: 'absolute', inset: 0 }}>
      <SkyGradient />
      <ambientLight intensity={0.4} color="#b8a9e8" />
      <directionalLight position={[10, 15, 10]} intensity={0.6} color="#c4b5fd" />
      <Grid args={[60, 60]} cellSize={1} cellThickness={0.5} cellColor="#4a3a8a" sectionSize={5} sectionThickness={1} sectionColor="#6b4ecf" fadeDistance={40} fadeStrength={1} position={[0, -0.01, 0]} infiniteGrid />

      {buckets.map((bucket, i) => {
        const bx = startX + i * spacing;
        return (
          <group key={`bucket-${bucket.index}`}>
            <group position={[bx, 0.3, 0]}>
              <RoundedBox args={[1.2, 0.5, 1.2]} radius={0.06} smoothness={4}>
                <meshStandardMaterial color="#1e1b4b" emissive="#312e81" emissiveIntensity={0.2} metalness={0.3} roughness={0.5} transparent opacity={0.8} />
              </RoundedBox>
              <Text position={[0, 0, 0.62]} fontSize={0.22} color="#818cf8" anchorX="center" anchorY="middle">[{bucket.index}]</Text>
            </group>
            {bucket.entries.map((entry, j) => (
              <HashEntryCube key={entry.id} entry={entry} x={bx} y={1.2 + j * 1.1} z={0} />
            ))}
          </group>
        );
      })}

      <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={35} />
    </Canvas>
  );
}

