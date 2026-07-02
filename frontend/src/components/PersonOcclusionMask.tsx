/* eslint-disable react-hooks/immutability */
'use client';

import { useSimulationStore } from '@/store';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function PersonOcclusionMask() {
  const detections = useSimulationStore((state) => state.aiDetections);
  const isMirrored = useSimulationStore((state) => state.isMirrored);

  // Initialize canvas
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 320; // Lower resolution for extreme performance
    c.height = 240;
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);

  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (!detections) return;

    // Throttle mask updates to 15 FPS to drastically reduce CPU/GPU load
    const now = clock.getElapsedTime();
    if (now - lastUpdate.current < 1 / 15) return;
    lastUpdate.current = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas - transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const personDetections = detections.filter(d => d.label === 'person');

    if (personDetections.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Solid white for the alpha mask

      for (const det of personDetections) {
        if (det.polygon.length === 0) continue;

        ctx.beginPath();
        for (let i = 0; i < det.polygon.length; i++) {
          let x = det.polygon[i][0];
          const y = det.polygon[i][1];
          if (isMirrored) x = 1 - x;
          
          const px = x * canvas.width;
          const py = y * canvas.height;
          
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Tell three.js the canvas has updated
    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0, -2]} renderOrder={-1}>
      <planeGeometry args={[14.4, 10.8]} /> 
      {texture && (
        <meshBasicMaterial 
          map={texture} 
          alphaMap={texture}
          transparent={true}
          alphaTest={0.5}
          colorWrite={false} 
          depthWrite={true} 
        />
      )}
    </mesh>
  );
}
