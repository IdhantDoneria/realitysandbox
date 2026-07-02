'use client';

import React from 'react';
import { Text } from '@react-three/drei';

interface ModelProps {
  type: string;
}

// Helper to generate a seeded pseudo-random color for generic objects based on their name
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

export function PrimitiveModels({ type }: ModelProps) {
  const t = type.toLowerCase();

  // 1. HIGHLY DETAILED MODELS

  if (t === 'chair') {
    return (
      <group>
        {/* Seat */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.2, 1.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.75, -0.65]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.5, 0.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.65, -0.75, 0.65]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[0.65, -0.75, 0.65]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[-0.65, -0.75, -0.65]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[0.65, -0.75, -0.65]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.5]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
      </group>
    );
  }

  if (t === 'desk' || t === 'table') {
    return (
      <group>
        {/* Tabletop */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.2, 2.5]} />
          <meshStandardMaterial color="#A0522D" roughness={0.7} />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.8, -1, 1.0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 2]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[1.8, -1, 1.0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 2]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[-1.8, -1, -1.0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 2]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[1.8, -1, -1.0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 2]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
      </group>
    );
  }

  if (t === 'bed') {
    return (
      <group>
        {/* Mattress */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 0.6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Frame */}
        <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.4, 6.2]} />
          <meshStandardMaterial color="#4d3319" />
        </mesh>
        {/* Pillow */}
        <mesh position={[0, 0.6, -2.2]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.3, 1]} />
          <meshStandardMaterial color="#e6f2ff" />
        </mesh>
      </group>
    );
  }

  if (t === 'sofa') {
    return (
      <group>
        {/* Base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.8, 2]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.8, -0.8]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.2, 0.4]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} />
        </mesh>
        {/* Armrests */}
        <mesh position={[-2.3, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 1.0, 2]} />
          <meshStandardMaterial color="#34495e" roughness={0.9} />
        </mesh>
        <mesh position={[2.3, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 1.0, 2]} />
          <meshStandardMaterial color="#34495e" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  if (t === 'laptop') {
    return (
      <group scale={0.5}>
        {/* Base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.05, 1.0]} />
          <meshStandardMaterial color="#bdc3c7" metalness={0.8} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.4, -0.45]} rotation={[0.2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.9, 0.05]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Keyboard Area */}
        <mesh position={[0, 0.03, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.01, 0.6]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    );
  }

  if (t === 'refrigerator') {
    return (
      <group>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 4, 2]} />
          <meshStandardMaterial color="#ecf0f1" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Upper Door Handle */}
        <mesh position={[0.8, 2.5, 1.05]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.8} />
        </mesh>
        {/* Lower Door Handle */}
        <mesh position={[0.8, 0.5, 1.05]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.8} />
        </mesh>
      </group>
    );
  }

  if (t === 'microwave') {
    return (
      <group>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.0, 1.2]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Window */}
        <mesh position={[-0.2, 0, 0.61]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.6, 0.02]} />
          <meshStandardMaterial color="#111" opacity={0.8} transparent />
        </mesh>
        {/* Panel */}
        <mesh position={[0.6, 0, 0.61]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.8, 0.05]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>
    );
  }

  if (t === 'phone') {
    return (
      <group scale={0.3}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.05, 1.6]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.026, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.01, 1.5]} />
          <meshStandardMaterial color="#000" metalness={1} roughness={0} />
        </mesh>
      </group>
    );
  }

  if (t === 'mug' || t === 'glass') {
    return (
      <group scale={0.5}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
          <meshStandardMaterial color={t === 'glass' ? '#a4e5ed' : '#ffffff'} opacity={t === 'glass' ? 0.4 : 1} transparent={t === 'glass'} />
        </mesh>
        {t === 'mug' && (
          <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
            <torusGeometry args={[0.2, 0.05, 8, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        )}
      </group>
    );
  }

  if (t === 'bottle') {
    return (
      <group scale={0.5}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
          <meshStandardMaterial color="#a4e5ed" opacity={0.6} transparent />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.3, 0.2, 16]} />
          <meshStandardMaterial color="#a4e5ed" opacity={0.6} transparent />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#a4e5ed" opacity={0.6} transparent />
        </mesh>
      </group>
    );
  }

  if (t === 'door') {
    return (
      <group>
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 4, 0.15]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0.7, 2, 0.1]} castShadow receiveShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  if (t === 'lamp') {
    return (
      <group>
        {/* Base */}
        <mesh position={[0, -1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        {/* Pole */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        {/* Shade */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.6, 0.8, 16]} />
          <meshStandardMaterial color="#fff" emissive="#ffffcc" emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  }

  // 2. GENERIC SCALED/STYLIZED BOXES & CYLINDERS FOR OTHERS
  // We use small variants, medium variants, and large variants
  const smallItems = ['keys', 'coin', 'ring', 'paperclip', 'pill', 'ticket', 'receipt', 'card', 'banknote', 'wrapper', 'badge', 'fob'];
  const mediumCylinders = ['shampoo', 'deodorant', 'balm', 'sanitizer', 'soap', 'sponge', 'pen'];
  const flatItems = ['document', 'notebook', 'towel', 'sheet', 'blanket', 'envelope', 'mouse', 'wallet', 'plate', 'glasses'];
  const longItems = ['toothbrush', 'toothpaste', 'comb', 'razor', 'cable', 'cord', 'laces', 'belt', 'scissors', 'spoon', 'fork', 'knife'];

  let geometry = <boxGeometry args={[0.5, 0.5, 0.5]} />; // Default box
  let yOffset = 0;

  if (smallItems.includes(t)) geometry = <boxGeometry args={[0.1, 0.02, 0.1]} />;
  else if (mediumCylinders.includes(t)) {
    geometry = <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />;
    yOffset = 0.2;
  }
  else if (flatItems.includes(t)) geometry = <boxGeometry args={[0.8, 0.05, 1.0]} />;
  else if (longItems.includes(t)) geometry = <boxGeometry args={[0.1, 0.05, 0.8]} />;
  else if (['backpack'].includes(t)) geometry = <boxGeometry args={[0.8, 1.2, 0.6]} />;
  else if (['trashcan'].includes(t)) {
    geometry = <cylinderGeometry args={[0.4, 0.3, 1.0, 16]} />;
    yOffset = 0.5;
  }
  else if (['toiletpaper'].includes(t)) {
    geometry = <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />;
    yOffset = 0.1;
  }
  else if (['shoes', 'slippers', 'socks'].includes(t)) geometry = <boxGeometry args={[0.3, 0.2, 0.8]} />;
  else if (['shirt', 'pants', 'underwear'].includes(t)) geometry = <boxGeometry args={[1.0, 0.1, 1.0]} />;

  const genericColor = stringToColor(t);

  return (
    <group>
      <mesh position={[0, yOffset, 0]} castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial color={genericColor} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* 3D Label overlay for generic items so you know what it is */}
      <Text
        position={[0, yOffset + 0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {type}
      </Text>
    </group>
  );
}
