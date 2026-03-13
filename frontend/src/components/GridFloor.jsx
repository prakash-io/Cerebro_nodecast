import { Canvas } from "@react-three/fiber";

function FloorMesh() {
  return (
    <group rotation={[-1.1, 0, 0]} position={[0, -1.8, 0]}>
      <gridHelper args={[30, 30, "#ff0033", "#00a6ff"]} />
    </group>
  );
}

export function GridFloor() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-72 opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <FloorMesh />
      </Canvas>
    </div>
  );
}
