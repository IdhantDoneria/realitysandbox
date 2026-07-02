'use client';

import { useSimulationStore, AIDetection } from '@/store';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';

export function AISegmentationOverlay() {
  const detections = useSimulationStore((state) => state.aiDetections);
  const handPosition = useSimulationStore((state) => state.handPosition);
  
  if (!detections || detections.length === 0) return null;

  return (
    <group>
      {detections.map((det) => (
        <AIPolygon key={det.id} detection={det} handPosition={handPosition} />
      ))}
    </group>
  );
}

function AIPolygon({ detection, handPosition }: { detection: AIDetection, handPosition: [number, number, number] | null }) {
  const [isHovered, setIsHovered] = useState(false);
  const isMirrored = useSimulationStore((state) => state.isMirrored);

  // Convert 0-1 normalized polygons to WebGL world coordinates
  const points = useMemo(() => {
    return detection.polygon.map(p => {
      // Map 0-1 to WebGL (-5 to 5, approx)
      const rawX = isMirrored ? 1 - p[0] : p[0];
      const x = (rawX - 0.5) * 10;
      const y = -(p[1] - 0.5) * 10;
      return new THREE.Vector3(x, y, 0); // Polygons are strictly 2D overlays on Z=0
    });
  }, [detection.polygon, isMirrored]);

  // Close the loop
  const closedPoints = useMemo(() => {
    if (points.length === 0) return [];
    return [...points, points[0]];
  }, [points]);

  // Center for the text label
  const center = useMemo(() => {
    if (points.length === 0) return new THREE.Vector3();
    const box = new THREE.Box3().setFromPoints(points);
    const c = new THREE.Vector3();
    box.getCenter(c);
    return c;
  }, [points]);

  useFrame(() => {
    if (!handPosition || points.length === 0) {
      setIsHovered(false);
      return;
    }

    // Check if hand is near the center of the polygon
    const dist = Math.hypot(
      center.x - handPosition[0],
      center.y - handPosition[1]
    );

    // If hand is within 2.0 units of the center, make it glow
    if (dist < 2.0) {
      setIsHovered(true);
    } else {
      setIsHovered(false);
    }
  });

  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const videoElement = useSimulationStore((state) => state.videoElement);
  const addExtractedObject = useSimulationStore((state) => state.addExtractedObject);
  const removeAIDetection = useSimulationStore((state) => state.removeAIDetection);

  const hasExtractedRef = useRef(false);
  const pointsRef = useRef<THREE.Points>(null);

  // Handle extraction
  useFrame(() => {
    if (isHovered && pinchActive && videoElement && !hasExtractedRef.current) {
      hasExtractedRef.current = true;
      // Remove it from AI detections so it doesn't keep getting extracted
      removeAIDetection(detection.id);

      // Create extraction canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = videoElement.videoWidth;
      maskCanvas.height = videoElement.videoHeight;
      const ctx = maskCanvas.getContext('2d');
      if (!ctx) return;

      // Draw polygon path
      ctx.beginPath();
      detection.polygon.forEach((p, i) => {
        // AI polygons are 0-1, unmirrored
        const x = p[0] * maskCanvas.width;
        const y = p[1] * maskCanvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Create a mask where the inside of the polygon is filled
      ctx.fillStyle = 'white';
      ctx.fill();

      // Draw the video using source-in compositing (only keeps video inside the polygon)
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(videoElement, 0, 0, maskCanvas.width, maskCanvas.height);
      ctx.globalCompositeOperation = 'source-over'; // reset

      // Calculate width/height for physics box
      let minX = maskCanvas.width, minY = maskCanvas.height, maxX = 0, maxY = 0;
      detection.polygon.forEach((p) => {
        const x = p[0] * maskCanvas.width;
        const y = p[1] * maskCanvas.height;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });

      addExtractedObject({
        id: `ai_${detection.id}_${Date.now()}`,
        texture: maskCanvas,
        width: maxX - minX,
        height: maxY - minY,
        position: [center.x, center.y, 0],
        rotation: [0, 0, 0],
        velocity: [0, 0, 0],
        isLocked: false,
      });
    }
  });

  // Generate dense points for the particle system
  const particlePositions = useMemo(() => {
    if (closedPoints.length < 3) return new Float32Array();
    try {
      const curve = new THREE.CatmullRomCurve3(closedPoints, true, 'chordal');
      // Create a dense array of particles along the boundary
      const numParticles = 200;
      const extracted = curve.getPoints(numParticles);
      const positions = new Float32Array(extracted.length * 3);
      for (let i = 0; i < extracted.length; i++) {
        positions[i * 3] = extracted[i].x;
        positions[i * 3 + 1] = extracted[i].y;
        positions[i * 3 + 2] = extracted[i].z;
      }
      return positions;
    } catch {
      return new Float32Array();
    }
  }, [closedPoints]);

  // Animate the particles
  useFrame((state) => {
    if (pointsRef.current && isHovered) {
      // Pulse size and slightly rotate the particles for a magical feel
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      pointsRef.current.scale.set(scale, scale, 1);
    } else if (pointsRef.current) {
      pointsRef.current.scale.set(1, 1, 1);
    }
  });

  if (closedPoints.length < 3 || particlePositions.length === 0) return null;

  const particleColor = isHovered ? '#00ff88' : '#00aa44';
  const particleSize = isHovered ? 0.08 : 0.04;

  return (
    <group>
      {/* WebGL Particle Boundary */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={particlePositions.length / 3} 
            array={particlePositions} 
            itemSize={3} 
          />
        </bufferGeometry>
        <pointsMaterial 
          size={particleSize} 
          color={particleColor} 
          transparent 
          opacity={isHovered ? 1.0 : 0.6}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Futuristic Alphanumeric ID label */}
      <Text
        position={[center.x, center.y + 1, center.z]}
        fontSize={isHovered ? 0.4 : 0.3}
        color={particleColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {detection.id}
      </Text>
    </group>
  );
}
