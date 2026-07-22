"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, SoftShadows } from "@react-three/drei";

function Wall({
  position,
  rotation,
  args,
  color,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number];
  color: string;
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Box({
  position,
  args,
  color,
}: {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Room({ accent }: { accent: string }) {
  return (
    <group>
      {/* Sol */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#d9c7b0" />
      </mesh>

      {/* Tapis */}
      <mesh position={[0, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 3]} />
        <meshStandardMaterial color={accent} opacity={0.35} transparent />
      </mesh>

      {/* Murs */}
      <Wall position={[0, 2.5, -5]} args={[10, 5]} color="#f2ede6" />
      <Wall position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} args={[10, 5]} color="#eae3d9" />

      {/* Fenêtre (cadre + vitre) sur le mur du fond */}
      <Box position={[2.5, 2.6, -4.9]} args={[2.6, 1.8, 0.08]} color="#8a7f70" />
      <mesh position={[2.5, 2.6, -4.85]}>
        <planeGeometry args={[2.3, 1.5]} />
        <meshStandardMaterial color="#bfe3f0" emissive="#bfe3f0" emissiveIntensity={0.4} />
      </mesh>

      {/* Canapé */}
      <Box position={[-2, 0.5, -1]} args={[3, 0.7, 1.2]} color={accent} />
      <Box position={[-2, 1.05, -1.5]} args={[3, 0.5, 0.25]} color={accent} />
      <Box position={[-3.3, 0.85, -1]} args={[0.25, 0.5, 1.2]} color={accent} />
      <Box position={[-0.7, 0.85, -1]} args={[0.25, 0.5, 1.2]} color={accent} />

      {/* Table basse */}
      <Box position={[-1.8, 0.35, 0.8]} args={[1.6, 0.15, 0.9]} color="#6b5844" />
      <Box position={[-2.5, 0.17, 0.4]} args={[0.12, 0.35, 0.12]} color="#4a3d2f" />
      <Box position={[-1.1, 0.17, 0.4]} args={[0.12, 0.35, 0.12]} color="#4a3d2f" />
      <Box position={[-2.5, 0.17, 1.2]} args={[0.12, 0.35, 0.12]} color="#4a3d2f" />
      <Box position={[-1.1, 0.17, 1.2]} args={[0.12, 0.35, 0.12]} color="#4a3d2f" />

      {/* Meuble TV + écran */}
      <Box position={[3, 0.4, 1]} args={[2, 0.6, 0.5]} color="#5a4a38" />
      <Box position={[3, 1.4, 0.8]} args={[1.8, 1, 0.08]} color="#1a1a1a" />

      {/* Plante */}
      <Box position={[4, 0.4, -3.5]} args={[0.5, 0.8, 0.5]} color="#7a5230" />
      <mesh position={[4, 1.2, -3.5]} castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#3f7d4f" />
      </mesh>

      {/* Lampe suspendue */}
      <mesh position={[-1.8, 3.2, 0.8]}>
        <coneGeometry args={[0.4, 0.5, 24]} />
        <meshStandardMaterial color="#e8c56a" emissive="#e8c56a" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function Property3DViewer({ accent = "#6366f1" }: { accent?: string }) {
  return (
    <Canvas shadows camera={{ position: [7, 5, 7], fov: 50 }} dpr={[1, 2]}>
      <SoftShadows size={25} samples={12} />
      <color attach="background" args={["#0e0e14"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-1.8, 3, 0.8]} intensity={20} color="#ffdb99" distance={8} />
      <Room accent={accent} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.4} scale={12} blur={2} far={5} />
      <OrbitControls
        enableDamping
        minDistance={4}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
