import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Single Coin component that rotates and falls
function FallingCoin({ index }) {
  const meshRef = useRef(null);

  // Generate stable random values for each coin based on index
  const data = useMemo(() => {
    const x = (Math.random() - 0.5) * 12;
    // Distribute starting Y positions so they cascade smoothly
    const y = Math.random() * 20 - 10;
    // Distribute Z depth from close to camera to far away
    const z = (Math.random() - 0.5) * 10 - 2;
    
    return {
      x,
      y,
      z,
      speedY: 1.5 + Math.random() * 2.5,
      rotX: Math.random() * 1.5,
      rotY: Math.random() * 1.5,
      rotZ: Math.random() * 1.5,
      scale: 0.4 + Math.random() * 0.5,
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Fall animation
    meshRef.current.position.y -= data.speedY * delta;
    
    // Continuous rotation
    meshRef.current.rotation.x += data.rotX * delta;
    meshRef.current.rotation.y += data.rotY * delta;
    meshRef.current.rotation.z += data.rotZ * delta;

    // Reset position if coin falls below view
    if (meshRef.current.position.y < -10) {
      meshRef.current.position.y = 10;
      meshRef.current.position.x = (Math.random() - 0.5) * 12;
      meshRef.current.position.z = (Math.random() - 0.5) * 10 - 2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[data.x, data.y, data.z]}
      scale={[data.scale, data.scale, data.scale]}
      castShadow
      receiveShadow
    >
      {/* Coin Cylinder Geometry: thin disk shape */}
      <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
      {/* Metallic golden material */}
      <meshStandardMaterial
        color="#EAB308"
        metalness={0.9}
        roughness={0.15}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

// Scene controls camera tilt based on mouse position
function CoinScene({ count = 80 }) {
  const { mouse, camera } = useThree();

  useFrame(() => {
    // Smoothly interpolate camera position based on mouse position
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 2.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 2.5, 0.05);
    camera.lookAt(0, 0, -2);
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#8B5CF6" />
      <pointLight position={[0, 0, 5]} intensity={1.0} color="#FACC15" />

      {/* Floating Sparkles (Partículas Brilhantes) */}
      <Sparkles
        count={100}
        scale={15}
        size={2}
        speed={0.6}
        color="#FACC15"
      />

      {/* Golden Coins Cascade */}
      {Array.from({ length: count }).map((_, idx) => (
        <FallingCoin key={idx} index={idx} count={count} />
      ))}
    </>
  );
}

export default function Coins3D() {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check if WebGL is supported
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setHasWebGL(support);
    } catch (_e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    // Premium CSS Fallback of falling particles
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-card flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 40 }).map((_, idx) => (
            <div
              key={idx}
              className="absolute bg-brand-yellow rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        <div className="text-center p-6 max-w-sm glass-panel rounded-xl border border-border-custom z-10">
          <h3 className="text-xl font-bold font-sora mb-2 text-gradient-gold">Flow Wealth</h3>
          <p className="text-xs text-text-secondary">
            Visualize o 3D interativo ativando a aceleração de hardware nas configurações do seu navegador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container bg-[#08080a] relative">
      {/* Background visual depth vignette */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(9, 9, 11, 0.8) 100%)',
        }}
      />
      
      {/* Purple backglow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-blue/5 blur-[100px] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <CoinScene />
      </Canvas>
    </div>
  );
}
