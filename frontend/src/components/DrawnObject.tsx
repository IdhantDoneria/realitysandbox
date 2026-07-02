'use client';

import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore, DrawnObjectData } from '@/store';

interface DrawnObjectProps {
  obj: DrawnObjectData;
}

export function DrawnObject({ obj }: DrawnObjectProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  
  const handPosition = useSimulationStore((state) => state.handPosition);
  const pinchActive = useSimulationStore((state) => state.pinchActive);
  const handGesture = useSimulationStore((state) => state.handGesture);
  const updateDrawnObject = useSimulationStore((state) => state.updateDrawnObject);
  const removeDrawnObject = useSimulationStore((state) => state.removeDrawnObject);

  const [isHeld, setIsHeld] = useState(false);
  const isHeldRef = useRef(false);

  // Generate TubeGeometry from points
  const geometry = useMemo(() => {
    if (obj.points.length < 2) return null;
    
    const vectorPoints = obj.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    // CatmullRomCurve3 creates a smooth 3D curve through the points
    const curve = new THREE.CatmullRomCurve3(vectorPoints);
    
    // Create tube: curve, tubularSegments, radius, radialSegments, closed
    return new THREE.TubeGeometry(curve, obj.points.length * 2, 0.2, 8, false);
  }, [obj.points]);

  useFrame(() => {
    if (!bodyRef.current || !handPosition) return;

    const currentPos = bodyRef.current.translation();
    const distance2D = Math.hypot(
      currentPos.x - handPosition[0],
      currentPos.y - handPosition[1]
    );
    const zDistance = Math.abs(currentPos.z - handPosition[2]);

    // Grab logic
    if (pinchActive && !isHeldRef.current && distance2D < 2.5 && zDistance < 8.0) { // forgiving Z grab
      setIsHeld(true);
      isHeldRef.current = true;
    } else if (!pinchActive && isHeldRef.current) {
      setIsHeld(false);
      isHeldRef.current = false;
    }

    // Lock gesture logic
    if (isHeldRef.current && handGesture === 'Closed_Fist' && !obj.isLocked) {
      updateDrawnObject(obj.id, { isLocked: true });
      setIsHeld(false);
      isHeldRef.current = false;
    }

    // Delete gesture logic
    if (isHeldRef.current && handGesture === 'Thumb_Down') {
      removeDrawnObject(obj.id);
      setIsHeld(false);
      isHeldRef.current = false;
    }

    if (isHeldRef.current) {
      // Kinematic movement while held
      bodyRef.current.setTranslation(
        { x: handPosition[0], y: handPosition[1], z: handPosition[2] },
        true
      );
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  if (!geometry) return null;

  return (
    <RigidBody
      ref={bodyRef}
      position={obj.position}
      type={obj.isLocked ? 'fixed' : (isHeld ? 'kinematicPosition' : 'dynamic')}
      colliders="hull"
      restitution={0.5}
      friction={0.5}
      mass={1}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color={obj.color} 
          roughness={0.4} 
          metalness={0.2} 
          emissive={obj.color}
          emissiveIntensity={isHeld ? 0.5 : 0.1}
        />
      </mesh>
    </RigidBody>
  );
}
