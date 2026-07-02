'use client';

import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '@/store';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

export function DrawingManager() {
  const isDrawingMode = useSimulationStore((state) => state.isDrawingMode);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const handPosition = useSimulationStore((state) => state.handPosition);
  const drawColor = useSimulationStore((state) => state.drawColor);
  const addDrawnObject = useSimulationStore((state) => state.addDrawnObject);

  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const isPinchingRef = useRef(false);

  useFrame(() => {
    if (!isDrawingMode) return;

    if (pinchActive && handPosition) {
      const newPoint = new THREE.Vector3(...handPosition);
      
      if (!isPinchingRef.current) {
        // Started pinching -> start new path
        isPinchingRef.current = true;
        setPoints([newPoint]);
      } else {
        // Continue pinching -> add to path if distance > threshold
        setPoints((prev) => {
          if (prev.length === 0) return [newPoint];
          const lastPoint = prev[prev.length - 1];
          if (lastPoint.distanceTo(newPoint) > 0.05) { // 5cm threshold for smoother drawing
            return [...prev, newPoint];
          }
          return prev;
        });
      }
    } else if (!pinchActive && isPinchingRef.current) {
      // Stopped pinching -> finalize path
      isPinchingRef.current = false;
      
      setPoints((currentPoints) => {
        if (currentPoints.length > 2) {
          // Smooth the points before saving to physics
          const curve = new THREE.CatmullRomCurve3(currentPoints);
          const pointsCount = Math.min(200, currentPoints.length * 10);
          const finalSmoothPoints = curve.getPoints(pointsCount);

          const id = `drawn_${Date.now()}`;
          const pointArray = finalSmoothPoints.map(p => [p.x, p.y, p.z] as [number, number, number]);
          
          const box = new THREE.Box3().setFromPoints(finalSmoothPoints);
          const center = new THREE.Vector3();
          box.getCenter(center);

          const normalizedPoints = pointArray.map(p => [
            p[0] - center.x,
            p[1] - center.y,
            p[2] - center.z
          ] as [number, number, number]);
          
          addDrawnObject({
            id,
            points: normalizedPoints,
            color: drawColor,
            position: [center.x, center.y, center.z],
            isLocked: false,
          });
        }
        return [];
      });
    }
  });

  const smoothPoints = useMemo(() => {
    if (points.length < 3) return points;
    const curve = new THREE.CatmullRomCurve3(points);
    // Dynamic resolution based on how long the line is
    const pointsCount = Math.min(200, points.length * 10);
    return curve.getPoints(pointsCount);
  }, [points]);

  if (!isDrawingMode || points.length < 2) return null;

  return (
    <Line
      points={smoothPoints}
      color={drawColor}
      lineWidth={5}
      castShadow
      receiveShadow
    />
  );
}
