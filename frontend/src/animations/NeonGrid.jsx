import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedGrid() {
  const gridRef = useRef();

  useFrame((state, delta) => {
    if (gridRef.current) {
      // Move grid towards the camera to simulate forward movement
      gridRef.current.position.z = (gridRef.current.position.z + delta * 2) % 1;
    }
  });

  return (
    <group ref={gridRef}>
      <Grid 
        args={[20, 20]} // size
        cellSize={1} 
        cellThickness={1.5} 
        cellColor="#ff0033" 
        sectionSize={5} 
        sectionThickness={2.5} 
        sectionColor="#ff1a1a" 
        fadeDistance={20} 
        fadeStrength={1.5}
      />
    </group>
  );
}

const NeonGrid = React.memo(function NeonGrid() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-60">
      <Canvas frameloop="always" dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} rotation={[-Math.PI / 8, 0, 0]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={2} color="#ff0033" />
        {/* Adds fog to obscure the distant grid */}
        <fog attach="fog" args={['#000000', 5, 20]} />
        
        <AnimatedGrid />
      </Canvas>
    </div>
  );
});

export default NeonGrid;
