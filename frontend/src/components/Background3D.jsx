import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const points = useRef();
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.05;
    points.current.rotation.x = time * 0.02;
  });

  return (
    <Points ref={points}>
      <PointMaterial
        transparent
        vertexColors
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#4f46e5"
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}

function FloatingSphere() {
  const sphere = useRef();

  useFrame(({ clock }) => {
    sphere.current.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 2;
    sphere.current.position.y = Math.cos(clock.getElapsedTime() * 0.3) * 2;
  });

  return (
    <Sphere ref={sphere} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#3b82f6"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        emissive="#1e3a8a"
      />
    </Sphere>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ParticleField />
        <FloatingSphere />
      </Canvas>
    </div>
  );
}