'use client';

import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '@/store';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

export function LassoManager() {
  const isFrozen = useSimulationStore((state) => state.isFrozen);
  const setIsFrozen = useSimulationStore((state) => state.setIsFrozen);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const handPosition = useSimulationStore((state) => state.handPosition);
  const videoElement = useSimulationStore((state) => state.videoElement);
  const addExtractedObject = useSimulationStore((state) => state.addExtractedObject);

  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const isPinchingRef = useRef(false);

  const processLassoExtraction = (finalPoints: THREE.Vector3[]) => {
    if (!videoElement) return;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = videoElement.videoWidth;
    maskCanvas.height = videoElement.videoHeight;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Convert 3D world points back to 2D video pixel coordinates
    const pixelPoints = finalPoints.map(p => {
      // Reversing the projection: x = (nx - 0.5) * 10 -> nx = (x / 10) + 0.5
      const nx = (p.x / 10) + 0.5;
      const ny = -(p.y / 10) + 0.5;
      return {
        x: nx * maskCanvas.width,
        y: ny * maskCanvas.height
      };
    });

    // Create the clipping mask
    ctx.beginPath();
    ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
    for (let i = 1; i < pixelPoints.length; i++) {
      ctx.lineTo(pixelPoints[i].x, pixelPoints[i].y);
    }
    ctx.closePath();
    
    // Fill the mask to crop the video frame
    ctx.clip();
    ctx.drawImage(videoElement, 0, 0, maskCanvas.width, maskCanvas.height);

    // Calculate bounding box of the cropped area to find width and height
    let minX = maskCanvas.width, minY = maskCanvas.height, maxX = 0, maxY = 0;
    pixelPoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const id = `lasso_${Date.now()}`;
    addExtractedObject({
      id,
      texture: maskCanvas,
      width: maxX - minX,
      height: maxY - minY,
      position: [0, 0, 0], // The object will spawn at 0,0,0 initially
      rotation: [0, 0, 0],
      velocity: [0, 0, 0],
    });

    // Unfreeze reality
    videoElement.play();
    setIsFrozen(false);
  };

  useFrame(() => {
    if (!isFrozen) {
      if (points.length > 0) setPoints([]); // clear if suddenly unfrozen
      return;
    }

    if (pinchActive && handPosition) {
      const newPoint = new THREE.Vector3(...handPosition);
      // Force the lasso to be drawn on a flat plane in front of the camera
      newPoint.z = 0; 
      
      if (!isPinchingRef.current) {
        // Start lasso
        isPinchingRef.current = true;
        setPoints([newPoint]);
      } else {
        // Continue lasso
        setPoints((prev) => {
          if (prev.length === 0) return [newPoint];
          const lastPoint = prev[prev.length - 1];
          if (lastPoint.distanceTo(newPoint) > 0.05) { // 5cm interval
            return [...prev, newPoint];
          }
          return prev;
        });
      }
    } else if (!pinchActive && isPinchingRef.current) {
      // Stopped pinching -> Check if we closed the loop
      isPinchingRef.current = false;
      
      setPoints((currentPoints) => {
        if (currentPoints.length > 5) {
          const firstPoint = currentPoints[0];
          const lastPoint = currentPoints[currentPoints.length - 1];
          
          // If the end is near the start, close the lasso and extract
          if (lastPoint.distanceTo(firstPoint) < 1.5) { // generous close radius
            processLassoExtraction(currentPoints);
            return [];
          }
        }
        return currentPoints; // Keep points on screen if they didn't close it
      });
    }
  });

  if (!isFrozen || points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#00ffff"
      lineWidth={4}
      dashed
      dashScale={50}
      dashSize={1}
      dashOffset={0}
    />
  );
}
