'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, BallCollider } from '@react-three/rapier';
import { useSimulationStore } from '@/store';
import * as THREE from 'three';

interface EmojiParticle {
  id: string;
  emoji: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  createdAt: number;
}

const VICTORY_EMOJIS = ['✌️', '🎉', '✨', '🎊'];
const SAD_EMOJIS = ['🥺', '😭', '😢', '😔', '🙁'];
const PARTICLE_LIFETIME = 2000; // 2 seconds

// Helper to pre-render emojis to canvas textures for 100% native support in WebGL
const useEmojiTextures = () => {
  return useMemo(() => {
    const textures: Record<string, THREE.CanvasTexture> = {};
    const emojis = [...VICTORY_EMOJIS, ...SAD_EMOJIS];
    
    for (const emoji of emojis) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = '100px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Fill text at exact center
        ctx.fillText(emoji, 64, 64 + 10); // +10 to adjust vertical baseline quirks
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[emoji] = tex;
    }
    return textures;
  }, []);
};

export function EmojiOutburst() {
  const handGesture = useSimulationStore((state) => state.handGesture);
  const handPosition = useSimulationStore((state) => state.handPosition);
  
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const prevGesture = useRef(handGesture);
  const lastSpawnTime = useRef(0);
  
  const textures = useEmojiTextures();

  useEffect(() => {
    // Detect gesture transition
    if (handGesture !== prevGesture.current) {
      if (handGesture === 'Victory' || handGesture === 'Thumb_Down') {
        const now = Date.now();
        // Cooldown mechanism: Only spawn an outburst once every 2 seconds
        if (now - lastSpawnTime.current > 2000) {
          lastSpawnTime.current = now;
          
          const emojiSet = handGesture === 'Victory' ? VICTORY_EMOJIS : SAD_EMOJIS;
          const origin: [number, number, number] = handPosition || [0, 0, 0];
          
          // Spawn outburst
          const newParticles: EmojiParticle[] = [];
          const count = 30; // 30 emojis per outburst
          
          for (let i = 0; i < count; i++) {
            const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
            
          // Explode outwards radially in an upward arc
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            const upVelocity = 5 + Math.random() * 8;
            
            const vx = Math.cos(angle) * speed;
            const vz = Math.sin(angle) * speed;
            
            // Add jitter to position so they don't perfectly overlap and freeze the physics solver
            const jx = (Math.random() - 0.5) * 0.5;
            const jy = (Math.random() - 0.5) * 0.5;
            const jz = (Math.random() - 0.5) * 0.5;
            
            newParticles.push({
              id: `emoji_${Date.now()}_${i}`,
              emoji,
              position: [origin[0] + jx, origin[1] + jy, origin[2] - 0.5 + jz], // spawn slightly behind hand
              velocity: [vx, upVelocity, vz],
              rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
              createdAt: Date.now()
            });
          }
          
          // Wrap in setTimeout to avoid React "cascading update" warning
          setTimeout(() => setParticles(prev => [...prev, ...newParticles]), 0);
        }
      }
    }
    
    prevGesture.current = handGesture;
  }, [handGesture, handPosition]);

  useFrame(() => {
    // Garbage collect old particles
    if (particles.length > 0) {
      const now = Date.now();
      if (particles.some(p => now - p.createdAt > PARTICLE_LIFETIME)) {
        setParticles(prev => prev.filter(p => now - p.createdAt <= PARTICLE_LIFETIME));
      }
    }
  });

  return (
    <group>
      {particles.map(p => (
        <RigidBody 
          key={p.id} 
          position={p.position} 
          linearVelocity={p.velocity}
          angularVelocity={p.rotation}
          restitution={0.8}
          colliders={false}
        >
          <BallCollider args={[0.5]} />
          <mesh>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
              map={textures[p.emoji]} 
              transparent={true} 
              alphaTest={0.1}
              depthWrite={true} 
              side={THREE.DoubleSide}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
